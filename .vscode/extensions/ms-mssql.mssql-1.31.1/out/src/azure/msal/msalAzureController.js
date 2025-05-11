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
exports.MsalAzureController = void 0;
const msal_common_1 = require("@azure/msal-common");
const msal_node_1 = require("@azure/msal-node");
const Constants = require("../../constants/constants");
const LocalizedConstants = require("../../constants/locConstants");
const azure_1 = require("../../models/contracts/azure");
const azureController_1 = require("../azureController");
const utils_1 = require("../utils");
const msalAzureCodeGrant_1 = require("./msalAzureCodeGrant");
const msalAzureDeviceCode_1 = require("./msalAzureDeviceCode");
const msalCachePlugin_1 = require("./msalCachePlugin");
const fs_1 = require("fs");
const path = require("path");
const AzureConstants = require("../constants");
class MsalAzureController extends azureController_1.AzureController {
    constructor() {
        super(...arguments);
        this._authMappings = new Map();
        this._cachePluginProvider = undefined;
    }
    getLoggerCallback() {
        return (level, message, containsPii) => {
            if (!containsPii) {
                switch (level) {
                    case msal_common_1.LogLevel.Error:
                        this.logger.error(message);
                        break;
                    case msal_common_1.LogLevel.Info:
                        this.logger.info(message);
                        break;
                    case msal_common_1.LogLevel.Verbose:
                    default:
                        this.logger.verbose(message);
                        break;
                }
            }
            else {
                this.logger.pii(message);
            }
        };
    }
    init() {
        // Since this setting is only applicable to MSAL, we can enable it safely only for MSAL Controller
        if ((0, utils_1.getEnableSqlAuthenticationProviderConfig)()) {
            this._isSqlAuthProviderEnabled = true;
        }
    }
    loadTokenCache() {
        return __awaiter(this, void 0, void 0, function* () {
            let authType = (0, utils_1.getAzureActiveDirectoryConfig)();
            if (!this._authMappings.has(authType)) {
                yield this.handleAuthMapping();
            }
            let azureAuth = yield this.getAzureAuthInstance(authType);
            yield this.clearOldCacheIfExists();
            void azureAuth.loadTokenCache();
        });
    }
    clearTokenCache() {
        return __awaiter(this, void 0, void 0, function* () {
            this.clientApplication.clearCache();
            yield this._cachePluginProvider.unlinkMsalCache();
            // Delete Encryption Keys
            yield this._cachePluginProvider.clearCacheEncryptionKeys();
        });
    }
    /**
     * Clears old cache file that is no longer needed on system.
     */
    clearOldCacheIfExists() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = path.join(yield this.findOrMakeStoragePath(), AzureConstants.oldMsalCacheFileName);
            try {
                yield fs_1.promises.access(filePath);
                yield fs_1.promises.rm(filePath);
                this.logger.verbose(`Old cache file removed successfully.`);
            }
            catch (e) {
                if (e.code !== "ENOENT") {
                    this.logger.verbose(`Error occurred while removing old cache file: ${e}`);
                } // else file doesn't exist.
            }
        });
    }
    login(authType) {
        return __awaiter(this, void 0, void 0, function* () {
            let azureAuth = yield this.getAzureAuthInstance(authType);
            let response = yield azureAuth.startLogin();
            return response ? response : undefined;
        });
    }
    isAccountInCache(account) {
        return __awaiter(this, void 0, void 0, function* () {
            let authType = (0, utils_1.getAzureActiveDirectoryConfig)();
            let azureAuth = yield this.getAzureAuthInstance(authType);
            yield this.clearOldCacheIfExists();
            let accountInfo = yield azureAuth.getAccountFromMsalCache(account.key.id);
            return accountInfo !== undefined;
        });
    }
    getAzureAuthInstance(authType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._authMappings.has(authType)) {
                yield this.handleAuthMapping();
            }
            return this._authMappings.get(authType);
        });
    }
    getAccountSecurityToken(account, tenantId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let azureAuth = yield this.getAzureAuthInstance((0, utils_1.getAzureActiveDirectoryConfig)());
            if (azureAuth) {
                this.logger.piiSanitized(`Getting account security token for ${JSON.stringify(account === null || account === void 0 ? void 0 : account.key)} (tenant ${tenantId}). Auth Method = ${azure_1.AzureAuthType[account === null || account === void 0 ? void 0 : account.properties.azureAuthType]}`, [], []);
                tenantId = tenantId || account.properties.owningTenant.id;
                let result = yield azureAuth.getToken(account, tenantId, settings);
                if (!result || !result.account || !result.account.idTokenClaims) {
                    this.logger.error(`MSAL: getToken call failed`);
                    throw Error("Failed to get token");
                }
                else {
                    const token = {
                        key: result.account.homeAccountId,
                        token: result.accessToken,
                        tokenType: result.tokenType,
                        expiresOn: result.account.idTokenClaims.exp,
                    };
                    return token;
                }
            }
            else {
                if (account) {
                    account.isStale = true;
                    this.logger.error(`_getAccountSecurityToken: Authentication method not found for account ${account.displayInfo.displayName}`);
                    throw Error(LocalizedConstants.msgAuthTypeNotFound);
                }
                else {
                    this.logger.error(`_getAccountSecurityToken: Authentication method not found as account not available.`);
                    throw Error(LocalizedConstants.msgAccountNotFound);
                }
            }
        });
    }
    refreshAccessToken(account, accountStore, tenantId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let newAccount;
            try {
                let azureAuth = yield this.getAzureAuthInstance((0, utils_1.getAzureActiveDirectoryConfig)());
                newAccount = yield azureAuth.refreshAccessToken(account, AzureConstants.organizationTenant.id, this._providerSettings.resources.windowsManagementResource);
                if (newAccount.isStale === true) {
                    return undefined;
                }
                yield accountStore.addAccount(newAccount);
                return yield this.getAccountSecurityToken(account, tenantId !== null && tenantId !== void 0 ? tenantId : account.properties.owningTenant.id, settings);
            }
            catch (ex) {
                if (ex instanceof msal_common_1.ClientAuthError &&
                    ex.errorCode === AzureConstants.noAccountInSilentRequestError) {
                    try {
                        // Account needs re-authentication
                        newAccount = yield this.login(account.properties.azureAuthType);
                        if (newAccount.isStale === true) {
                            return undefined;
                        }
                        yield accountStore.addAccount(newAccount);
                        return yield this.getAccountSecurityToken(account, tenantId !== null && tenantId !== void 0 ? tenantId : account.properties.owningTenant.id, settings);
                    }
                    catch (ex) {
                        this._vscodeWrapper.showErrorMessage(ex);
                    }
                }
                else {
                    this._vscodeWrapper.showErrorMessage(ex);
                }
            }
        });
    }
    /**
     * Gets the token for given account and updates the connection profile with token information needed for AAD authentication
     */
    populateAccountProperties(profile, accountStore, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield this.addAccount(accountStore);
            profile.user = account.displayInfo.displayName;
            profile.email = account.displayInfo.email;
            profile.accountId = account.key.id;
            // Skip fetching access token for profile if Sql Authentication Provider is enabled.
            if (!this.isSqlAuthProviderEnabled()) {
                if (!profile.tenantId) {
                    yield this.promptForTenantChoice(account, profile);
                }
                const token = yield this.getAccountSecurityToken(account, profile.tenantId, settings);
                if (!token) {
                    let errorMessage = LocalizedConstants.msgGetTokenFail;
                    this.logger.error(errorMessage);
                    this._vscodeWrapper.showErrorMessage(errorMessage);
                }
                else {
                    profile.azureAccountToken = token.token;
                    profile.expiresOn = token.expiresOn;
                }
            }
            else {
                this.logger.verbose("SQL Authentication Provider is enabled, access token will not be acquired by extension.");
            }
            return profile;
        });
    }
    removeAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            let azureAuth = yield this.getAzureAuthInstance((0, utils_1.getAzureActiveDirectoryConfig)());
            yield azureAuth.clearCredentials(account);
        });
    }
    handleAuthMapping() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.clientApplication) {
                let storagePath = yield this.findOrMakeStoragePath();
                this._cachePluginProvider = new msalCachePlugin_1.MsalCachePluginProvider(Constants.msalCacheFileName, storagePath, this._vscodeWrapper, this.logger, this._credentialStore);
                const msalConfiguration = {
                    auth: {
                        clientId: this._providerSettings.clientId,
                        authority: "https://login.windows.net/common",
                    },
                    system: {
                        loggerOptions: {
                            loggerCallback: this.getLoggerCallback(),
                            logLevel: msal_common_1.LogLevel.Trace,
                            piiLoggingEnabled: true,
                        },
                    },
                    cache: {
                        cachePlugin: (_a = this._cachePluginProvider) === null || _a === void 0 ? void 0 : _a.getCachePlugin(),
                    },
                };
                this.clientApplication = new msal_node_1.PublicClientApplication(msalConfiguration);
            }
            this._authMappings.clear();
            const configuration = (0, utils_1.getAzureActiveDirectoryConfig)();
            if (configuration === azure_1.AzureAuthType.AuthCodeGrant) {
                this._authMappings.set(azure_1.AzureAuthType.AuthCodeGrant, new msalAzureCodeGrant_1.MsalAzureCodeGrant(this._providerSettings, this.context, this.clientApplication, this._vscodeWrapper, this.logger));
            }
            else if (configuration === azure_1.AzureAuthType.DeviceCode) {
                this._authMappings.set(azure_1.AzureAuthType.DeviceCode, new msalAzureDeviceCode_1.MsalAzureDeviceCode(this._providerSettings, this.context, this.clientApplication, this._vscodeWrapper, this.logger));
            }
        });
    }
}
exports.MsalAzureController = MsalAzureController;

//# sourceMappingURL=msalAzureController.js.map
