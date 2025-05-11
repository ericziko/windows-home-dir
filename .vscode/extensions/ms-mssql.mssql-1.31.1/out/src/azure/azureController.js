"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureController = void 0;
const path = require("path");
const vscode = require("vscode");
const LocalizedConstants = require("../constants/locConstants");
const AzureConstants = require("./constants");
const azureUtils = require("./utils");
const fs_1 = require("fs");
const providerSettings_1 = require("../azure/providerSettings");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
const logger_1 = require("../models/logger");
const question_1 = require("../prompts/question");
class AzureController {
    constructor(context, prompter, _credentialStore, _subscriptionClientFactory = azureUtils.defaultSubscriptionClientFactory) {
        this.context = context;
        this.prompter = prompter;
        this._credentialStore = _credentialStore;
        this._subscriptionClientFactory = _subscriptionClientFactory;
        this._credentialStoreInitialized = false;
        this._isSqlAuthProviderEnabled = false;
        if (!this._vscodeWrapper) {
            this._vscodeWrapper = new vscodeWrapper_1.default();
        }
        // Setup Logger
        let channel = this._vscodeWrapper.createOutputChannel(LocalizedConstants.azureLogChannelName);
        this.logger = logger_1.Logger.create(channel);
        this._providerSettings = providerSettings_1.default;
        vscode.workspace.onDidChangeConfiguration((changeEvent) => {
            const impactsProvider = changeEvent.affectsConfiguration(AzureConstants.accountsAzureAuthSection);
            if (impactsProvider === true) {
                this.handleAuthMapping();
            }
        });
    }
    isSqlAuthProviderEnabled() {
        return this._isSqlAuthProviderEnabled;
    }
    addAccount(accountStore) {
        return __awaiter(this, void 0, void 0, function* () {
            let config = azureUtils.getAzureActiveDirectoryConfig();
            let account = yield this.login(config);
            yield accountStore.addAccount(account);
            this.logger.verbose("Account added successfully.");
            return account;
        });
    }
    refreshTokenWrapper(profile, accountStore, accountAnswer, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = accountStore.getAccount(accountAnswer.key.id);
            if (!account) {
                yield this._vscodeWrapper.showErrorMessage(LocalizedConstants.msgAccountNotFound);
                throw new Error(LocalizedConstants.msgAccountNotFound);
            }
            if (!this._isSqlAuthProviderEnabled) {
                this.logger.verbose(`Account found, refreshing access token for tenant ${profile.tenantId}`);
                let azureAccountToken = yield this.refreshAccessToken(account, accountStore, profile.tenantId, settings);
                if (!azureAccountToken) {
                    let errorMessage = LocalizedConstants.msgAccountRefreshFailed;
                    return this._vscodeWrapper
                        .showErrorMessage(errorMessage, LocalizedConstants.refreshTokenLabel)
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result === LocalizedConstants.refreshTokenLabel) {
                            let refreshedProfile = yield this.populateAccountProperties(profile, accountStore, settings);
                            return refreshedProfile;
                        }
                        else {
                            return undefined;
                        }
                    }));
                }
                profile.azureAccountToken = azureAccountToken.token;
                profile.expiresOn = azureAccountToken.expiresOn;
                profile.email = account.displayInfo.email;
                profile.accountId = account.key.id;
            }
            else {
                this.logger.verbose("Account found and SQL Authentication Provider is enabled, access token will not be refreshed by extension.");
            }
            return profile;
        });
    }
    /**
     * Returns Azure sessions with subscriptions, tenant and token for each given account
     */
    getAccountSessions(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = [];
            const tenants = account.properties.tenants;
            for (const tenant of tenants) {
                const tenantId = tenant.id;
                const token = yield this.getAccountSecurityToken(account, tenantId, providerSettings_1.default.resources.azureManagementResource);
                const subClient = this._subscriptionClientFactory(token);
                const newSubPages = yield subClient.subscriptions.list();
                const array = yield azureUtils.getAllValues(newSubPages, (nextSub) => {
                    return {
                        subscription: nextSub,
                        tenantId: tenantId,
                        account: account,
                        token: token,
                    };
                });
                sessions.push(...array);
            }
            return sessions.sort((a, b) => (a.subscription.displayName || "").localeCompare(b.subscription.displayName || ""));
        });
    }
    /**
     * Verifies if the token still valid, refreshes the token for given account
     * @param session
     */
    checkAndRefreshToken(session, accountStore) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if ((session === null || session === void 0 ? void 0 : session.account) &&
                !AzureController.isTokenValid(session.token.token, session.token.expiresOn)) {
                const token = yield this.refreshAccessToken(session.account, accountStore, undefined, providerSettings_1.default.resources.azureManagementResource);
                session.token = token;
                this.logger.verbose(`Access Token refreshed for account: ${(_a = session === null || session === void 0 ? void 0 : session.account) === null || _a === void 0 ? void 0 : _a.key.id}`);
            }
            else {
                this.logger.verbose(`Access Token not refreshed for account: ${(_b = session === null || session === void 0 ? void 0 : session.account) === null || _b === void 0 ? void 0 : _b.key.id}`);
            }
        });
    }
    /**
     * Returns false if token is invalid or expired
     * @param token Token
     * @param token expiry
     */
    static isTokenValid(token, expiresOn) {
        return !!token && !AzureController.isTokenExpired(expiresOn);
    }
    /**
     * Returns true if token is expired
     * @param token expiry
     */
    static isTokenExpired(expiresOn) {
        if (!expiresOn) {
            return true;
        }
        const currentTime = Date.now() / 1000;
        const maxTolerance = 2 * 60; // two minutes
        return expiresOn - currentTime < maxTolerance;
    }
    promptForTenantChoice(account, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let tenantChoices = (_a = account.properties.tenants) === null || _a === void 0 ? void 0 : _a.map((t) => ({
                name: t.displayName,
                value: t,
            }));
            if (tenantChoices && tenantChoices.length === 1) {
                profile.tenantId = tenantChoices[0].value.id;
                return;
            }
            let tenantQuestion = {
                type: question_1.QuestionTypes.expand,
                name: LocalizedConstants.tenant,
                message: LocalizedConstants.azureChooseTenant,
                choices: tenantChoices,
                shouldPrompt: (answers) => profile.isAzureActiveDirectory() && tenantChoices.length > 1,
                onAnswered: (value) => {
                    profile.tenantId = value.id;
                },
            };
            yield this.prompter.promptSingle(tenantQuestion, true);
        });
    }
    // Generates storage path for Azure Account cache, e.g C:\users\<>\AppData\Roaming\Code\Azure Accounts\
    findOrMakeStoragePath() {
        return __awaiter(this, void 0, void 0, function* () {
            let defaultOutputLocation = this.getDefaultOutputLocation();
            let storagePath = path.join(defaultOutputLocation, AzureConstants.azureAccountDirectory);
            try {
                yield fs_1.promises.mkdir(defaultOutputLocation, { recursive: true });
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    this.logger.error(`Creating the base directory failed... ${e}`);
                    return undefined;
                }
            }
            try {
                yield fs_1.promises.mkdir(storagePath, { recursive: true });
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    this.logger.error(`Initialization of vscode-mssql storage failed: ${e}`);
                    this.logger.error("Azure accounts will not be available");
                    return undefined;
                }
            }
            this.logger.log("Initialized vscode-mssql storage.");
            return storagePath;
        });
    }
    getDefaultOutputLocation() {
        return path.join(azureUtils.getAppDataPath(), AzureConstants.serviceName);
    }
}
exports.AzureController = AzureController;

//# sourceMappingURL=azureController.js.map
