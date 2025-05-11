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
exports.ConnectionUI = void 0;
const providerSettings_1 = require("../azure/providerSettings");
const constants = require("../constants/constants");
const LocalizedConstants = require("../constants/locConstants");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
const connectionCredentials_1 = require("../models/connectionCredentials");
const connectionProfile_1 = require("../models/connectionProfile");
const interfaces_1 = require("../models/interfaces");
const Utils = require("../models/utils");
const utils_1 = require("../models/utils");
const objectExplorerUtils_1 = require("../objectExplorer/objectExplorerUtils");
const question_1 = require("../prompts/question");
const utils_2 = require("../utils/utils");
const addFirewallRuleWebviewController_1 = require("../controllers/addFirewallRuleWebviewController");
/**
 * The different tasks for managing connection profiles.
 */
var ManageProfileTask;
(function (ManageProfileTask) {
    ManageProfileTask[ManageProfileTask["Create"] = 1] = "Create";
    ManageProfileTask[ManageProfileTask["ClearRecentlyUsed"] = 2] = "ClearRecentlyUsed";
    ManageProfileTask[ManageProfileTask["Edit"] = 3] = "Edit";
    ManageProfileTask[ManageProfileTask["Remove"] = 4] = "Remove";
})(ManageProfileTask || (ManageProfileTask = {}));
class ConnectionUI {
    constructor(_connectionManager, _context, _connectionStore, _accountStore, _prompter, _isRichExperiencesEnabled = constants.isRichExperiencesEnabledDefault, _vscodeWrapper) {
        this._connectionManager = _connectionManager;
        this._context = _context;
        this._connectionStore = _connectionStore;
        this._accountStore = _accountStore;
        this._prompter = _prompter;
        this._isRichExperiencesEnabled = _isRichExperiencesEnabled;
        this._vscodeWrapper = _vscodeWrapper;
        if (!this._vscodeWrapper) {
            this._vscodeWrapper = new vscodeWrapper_1.default();
        }
        this._errorOutputChannel = this._vscodeWrapper.createOutputChannel(LocalizedConstants.connectionErrorChannelName);
    }
    get connectionManager() {
        return this._connectionManager;
    }
    /**
     * Exposed for testing purposes
     */
    get vscodeWrapper() {
        return this._vscodeWrapper;
    }
    /**
     * Exposed for testing purposes
     */
    set vscodeWrapper(wrapper) {
        this._vscodeWrapper = wrapper;
    }
    // Show connection errors in an output window
    showConnectionErrors(errorMessages) {
        this._errorOutputChannel.clear();
        this._errorOutputChannel.append(errorMessages);
        this._errorOutputChannel.show(true);
    }
    /**
     * Prompt user to choose a connection profile from stored connections , or to create a new connection.
     * @param ignoreFocusOut Whether to ignoreFocusOut on the quickpick prompt
     * @returns The connectionInfo choosen or created from the user, or undefined if the user cancels the prompt.
     */
    promptForConnection(connectionProfileList_1) {
        return __awaiter(this, arguments, void 0, function* (connectionProfileList, ignoreFocusOut = false) {
            // Let this design use Promise and resolve/reject pattern instead of async/await
            // because resolve/reject is done in in callback events.
            return yield new Promise((resolve, _) => {
                // We have recent connections - show them in a prompt for connection profiles
                const connectionProfileQuickPick = this.vscodeWrapper.createQuickPick();
                connectionProfileQuickPick.items = connectionProfileList;
                connectionProfileQuickPick.placeholder =
                    LocalizedConstants.recentConnectionsPlaceholder;
                connectionProfileQuickPick.matchOnDescription = true;
                connectionProfileQuickPick.ignoreFocusOut = ignoreFocusOut;
                connectionProfileQuickPick.canSelectMany = false;
                connectionProfileQuickPick.busy = false;
                connectionProfileQuickPick.show();
                connectionProfileQuickPick.onDidChangeSelection((selection) => {
                    if (selection[0]) {
                        // add progress notification and hide quickpick after user chooses an item from the quickpick
                        connectionProfileQuickPick.busy = true;
                        connectionProfileQuickPick.hide();
                        resolve(this.handleSelectedConnection(selection[0]));
                    }
                    else {
                        resolve(undefined);
                    }
                });
                connectionProfileQuickPick.onDidHide(() => {
                    connectionProfileQuickPick.dispose();
                    resolve(undefined);
                });
            });
        });
    }
    promptLanguageFlavor() {
        const self = this;
        return new Promise((resolve, reject) => {
            let picklist = [
                {
                    label: LocalizedConstants.mssqlProviderName,
                    description: LocalizedConstants.flavorDescriptionMssql,
                    providerId: constants.mssqlProviderName,
                },
                {
                    label: LocalizedConstants.noneProviderName,
                    description: LocalizedConstants.flavorDescriptionNone,
                    providerId: constants.noneProviderName,
                },
            ];
            self.promptItemChoice({
                placeHolder: LocalizedConstants.flavorChooseLanguage,
                matchOnDescription: true,
            }, picklist).then((selection) => {
                if (selection) {
                    resolve(selection.providerId);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
    // requests the user to choose an item from the list
    promptItemChoice(options, choices) {
        let question = {
            type: question_1.QuestionTypes.expand,
            name: "question",
            message: options.placeHolder,
            matchOptions: options,
            choices: choices,
        };
        return this._prompter.promptSingle(question, question.matchOptions.ignoreFocusOut);
    }
    /**
     * Helper for waitForLanguageModeToBeSql() method.
     */
    waitForLanguageModeToBeSqlHelper(resolve, timer) {
        if (timer.getDuration() > constants.timeToWaitForLanguageModeChange) {
            resolve(false);
        }
        else if (this.vscodeWrapper.isEditingSqlFile) {
            resolve(true);
        }
        else {
            setTimeout(this.waitForLanguageModeToBeSqlHelper.bind(this, resolve, timer), 50);
        }
    }
    /**
     * Wait for up to 10 seconds for the language mode to change to SQL.
     */
    waitForLanguageModeToBeSql() {
        const self = this;
        return new Promise((resolve, reject) => {
            let timer = new utils_1.Timer();
            timer.start();
            self.waitForLanguageModeToBeSqlHelper(resolve, timer);
        });
    }
    /**
     * Prompt the user if they would like to cancel connecting.
     */
    promptToCancelConnection() {
        const self = this;
        return new Promise((resolve, reject) => {
            let question = {
                type: question_1.QuestionTypes.confirm,
                name: LocalizedConstants.msgPromptCancelConnect,
                message: LocalizedConstants.msgPromptCancelConnect,
            };
            self._prompter
                .promptSingle(question)
                .then((result) => {
                resolve(result ? true : false);
            })
                .catch((err) => {
                resolve(false);
            });
        });
    }
    /**
     * Prompt the user for password
     */
    promptForPassword() {
        const self = this;
        return new Promise((resolve, reject) => {
            let question = {
                type: question_1.QuestionTypes.password,
                name: LocalizedConstants.passwordPrompt,
                message: LocalizedConstants.passwordPrompt,
                placeHolder: LocalizedConstants.passwordPlaceholder,
            };
            self._prompter
                .promptSingle(question)
                .then((result) => {
                resolve(result);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    /**
     * Prompt the user to change language mode to SQL.
     * @returns resolves to true if the user changed the language mode to SQL.
     */
    promptToChangeLanguageMode() {
        const self = this;
        return new Promise((resolve, reject) => {
            let question = {
                type: question_1.QuestionTypes.confirm,
                name: LocalizedConstants.msgChangeLanguageMode,
                message: LocalizedConstants.msgChangeLanguageMode,
            };
            self._prompter
                .promptSingle(question)
                .then((value) => {
                if (value) {
                    this._vscodeWrapper
                        .executeCommand("workbench.action.editor.changeLanguageMode")
                        .then(() => {
                        self.waitForLanguageModeToBeSql().then((result) => {
                            resolve(result);
                        });
                    });
                }
                else {
                    resolve(false);
                }
            })
                .catch((err) => {
                resolve(false);
            });
        });
    }
    // Helper to let the user choose a database on the current server
    showDatabasesOnCurrentServer(currentCredentials, databaseNames) {
        const self = this;
        return new Promise((resolve, reject) => {
            const pickListItems = databaseNames.map((name) => {
                let newCredentials = {};
                Object.assign(newCredentials, currentCredentials);
                if (newCredentials["profileName"]) {
                    delete newCredentials["profileName"];
                }
                newCredentials.database = name;
                return {
                    label: name,
                    description: "",
                    detail: "",
                    connectionCreds: newCredentials,
                    quickPickItemType: interfaces_1.CredentialsQuickPickItemType.Mru,
                };
            });
            // Add an option to disconnect from the current server
            const disconnectItem = {
                label: LocalizedConstants.disconnectOptionLabel,
                description: LocalizedConstants.disconnectOptionDescription,
            };
            pickListItems.push(disconnectItem);
            const pickListOptions = {
                placeHolder: LocalizedConstants.msgChooseDatabasePlaceholder,
            };
            // show database picklist, and modify the current connection to switch the active database
            self.vscodeWrapper
                .showQuickPick(pickListItems, pickListOptions)
                .then((selection) => {
                if (selection === disconnectItem) {
                    self.handleDisconnectChoice().then(() => resolve(undefined), (err) => reject(err));
                }
                else if (typeof selection !== "undefined") {
                    resolve(selection.connectionCreds);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
    handleDisconnectChoice() {
        const self = this;
        return new Promise((resolve, reject) => {
            let question = {
                type: question_1.QuestionTypes.confirm,
                name: LocalizedConstants.disconnectConfirmationMsg,
                message: LocalizedConstants.disconnectConfirmationMsg,
            };
            self._prompter.promptSingle(question).then((result) => {
                if (result === true) {
                    self.connectionManager.onDisconnect().then(() => resolve(), (err) => reject(err));
                }
                else {
                    resolve();
                }
            }, (err) => reject(err));
        });
    }
    createProfileWithDifferentCredentials(connection) {
        return new Promise((resolve, reject) => {
            this.promptForRetryConnectWithDifferentCredentials().then((result) => {
                if (result) {
                    let connectionWithoutCredentials = Object.assign({}, connection, {
                        user: "",
                        password: "",
                        emptyPasswordInput: false,
                    });
                    connectionCredentials_1.ConnectionCredentials.ensureRequiredPropertiesSet(connectionWithoutCredentials, // connection profile
                    true, // isProfile
                    false, // isPasswordRequired
                    true, // wasPasswordEmptyInConfigFile
                    this._prompter, this._connectionStore, connection).then((connectionResult) => {
                        resolve(connectionResult);
                    }, (error) => {
                        reject(error);
                    });
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
    handleSelectedConnection(selection) {
        return new Promise((resolve, reject) => {
            if (selection !== undefined) {
                let connectFunc;
                if (selection.quickPickItemType === interfaces_1.CredentialsQuickPickItemType.NewConnection) {
                    // call the workflow to create a new connection
                    connectFunc = this.createAndSaveProfile();
                }
                else {
                    // user chose a connection from picklist. Prompt for mandatory info that's missing (e.g. username and/or password)
                    connectFunc = this.fillOrPromptForMissingInfo(selection);
                }
                connectFunc.then((resolvedConnectionCreds) => {
                    if (!resolvedConnectionCreds) {
                        resolve(undefined);
                    }
                    resolve(resolvedConnectionCreds);
                }, (err) => 
                // we will send back a cancelled error in order to re-prompt the promptForConnection
                reject(err));
            }
            else {
                resolve(undefined);
            }
        });
    }
    promptToClearRecentConnectionsList() {
        const self = this;
        return new Promise((resolve, reject) => {
            let question = {
                type: question_1.QuestionTypes.confirm,
                name: LocalizedConstants.msgPromptClearRecentConnections,
                message: LocalizedConstants.msgPromptClearRecentConnections,
            };
            self._prompter
                .promptSingle(question)
                .then((result) => {
                resolve(result ? true : false);
            })
                .catch((err) => {
                resolve(false);
            });
        });
    }
    promptToManageProfiles() {
        const self = this;
        return new Promise((resolve, reject) => {
            // Create profile, clear recent connections, edit profiles, or remove profile?
            let choices = [
                {
                    name: LocalizedConstants.CreateProfileLabel,
                    value: ManageProfileTask.Create,
                },
                {
                    name: LocalizedConstants.ClearRecentlyUsedLabel,
                    value: ManageProfileTask.ClearRecentlyUsed,
                },
                {
                    name: LocalizedConstants.EditProfilesLabel,
                    value: ManageProfileTask.Edit,
                },
                {
                    name: LocalizedConstants.RemoveProfileLabel,
                    value: ManageProfileTask.Remove,
                },
            ];
            let question = {
                type: question_1.QuestionTypes.expand,
                name: LocalizedConstants.ManageProfilesPrompt,
                message: LocalizedConstants.ManageProfilesPrompt,
                choices: choices,
                onAnswered: (value) => {
                    switch (value) {
                        case ManageProfileTask.Create:
                            self.connectionManager.onCreateProfile().then((result) => {
                                resolve(result);
                            });
                            break;
                        case ManageProfileTask.ClearRecentlyUsed:
                            self.promptToClearRecentConnectionsList().then((result) => {
                                if (result) {
                                    self.connectionManager
                                        .clearRecentConnectionsList()
                                        .then((credentialsDeleted) => {
                                        if (credentialsDeleted) {
                                            self.vscodeWrapper.showInformationMessage(LocalizedConstants.msgClearedRecentConnections);
                                        }
                                        else {
                                            self.vscodeWrapper.showWarningMessage(LocalizedConstants.msgClearedRecentConnectionsWithErrors);
                                        }
                                        resolve(true);
                                    });
                                }
                                else {
                                    resolve(false);
                                }
                            });
                            break;
                        case ManageProfileTask.Edit:
                            self.vscodeWrapper
                                .executeCommand("workbench.action.openGlobalSettings")
                                .then(() => {
                                resolve(true);
                            });
                            break;
                        case ManageProfileTask.Remove:
                            self.connectionManager.onRemoveProfile().then((result) => {
                                resolve(result);
                            });
                            break;
                        default:
                            resolve(false);
                            break;
                    }
                },
            };
            this._prompter.promptSingle(question);
        });
    }
    /**
     * Calls the create profile workflow
     * @param validate whether the profile should be connected to and validated before saving
     * @returns undefined if profile creation failed
     */
    createAndSaveProfile() {
        return __awaiter(this, arguments, void 0, function* (validate = true) {
            let profile = yield this.promptForCreateProfile();
            if (profile) {
                let savedProfile = validate
                    ? yield this.validateAndSaveProfile(profile)
                    : yield this.saveProfile(profile);
                if (savedProfile) {
                    if (validate) {
                        this.vscodeWrapper.showInformationMessage(LocalizedConstants.msgProfileCreatedAndConnected);
                    }
                    else {
                        this.vscodeWrapper.showInformationMessage(LocalizedConstants.msgProfileCreated);
                    }
                }
                return savedProfile;
            }
        });
    }
    /**
     * Validate a connection profile by connecting to it, and save it if we are successful.
     */
    validateAndSaveProfile(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            let uri = this.vscodeWrapper.activeTextEditorUri;
            if (!uri || !this.vscodeWrapper.isEditingSqlFile) {
                uri = objectExplorerUtils_1.ObjectExplorerUtils.getNodeUriFromProfile(profile);
            }
            const success = yield this.connectionManager.connect(uri, profile);
            if (success) {
                // Success! save it
                return yield this.saveProfile(profile);
            }
            else {
                // Check whether the error was for firewall rule or not
                if (this.connectionManager.failedUriToFirewallIpMap.has(uri)) {
                    let success = yield this.addFirewallRule(uri, profile);
                    if (success) {
                        return yield this.validateAndSaveProfile(profile);
                    }
                    return undefined;
                }
                else if (this.connectionManager.failedUriToSSLMap.has(uri)) {
                    // SSL error
                    let updatedConn = yield this.connectionManager.handleSSLError(uri, profile);
                    if (updatedConn) {
                        return yield this.validateAndSaveProfile(updatedConn);
                    }
                    return undefined;
                }
                else {
                    // Normal connection error! Let the user try again, prefilling values that they already entered
                    return yield this.promptToRetryAndSaveProfile(profile);
                }
            }
        });
    }
    /**
     * Validate a connection profile by connecting to it, and save it if we are successful.
     */
    validateAndSaveProfileFromDialog(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.connectionManager.connectDialog(profile);
            return result;
        });
    }
    addFirewallRule(uri, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connectionManager.failedUriToFirewallIpMap.has(uri)) {
                // Firewall rule error
                const firewallResponse = this.connectionManager.failedUriToFirewallIpMap.get(uri);
                let success = yield this.handleFirewallError(profile, firewallResponse);
                if (success) {
                    // Retry creating the profile if firewall rule
                    // was successful
                    this.connectionManager.failedUriToFirewallIpMap.delete(uri);
                    return true;
                }
            }
            return false;
        });
    }
    /**
     * Method to handle a firewall error. Returns true if a firewall rule was successfully added, and
     * false otherwise
     */
    handleFirewallError(profile, connectionResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isRichExperiencesEnabled) {
                if (connectionResponse.errorNumber !== constants.errorFirewallRule) {
                    Utils.logDebug(`handleFirewallError called with non-firewall-error response; error number: '${connectionResponse.errorNumber}'`);
                }
                const addFirewallRuleController = new addFirewallRuleWebviewController_1.AddFirewallRuleWebviewController(this._context, this._vscodeWrapper, {
                    serverName: profile.server,
                    errorMessage: connectionResponse.errorMessage,
                }, this.connectionManager.firewallService);
                addFirewallRuleController.panel.reveal();
                const wasCreated = yield addFirewallRuleController.dialogResult;
                return wasCreated === true; // dialog closed is undefined
            }
            else {
                // TODO: Access account which firewall error needs to be added from:
                // Try to match accountId to an account in account storage
                if (profile.accountId) {
                    let account = this._accountStore.getAccount(profile.accountId);
                    this.connectionManager.accountService.setAccount(account);
                    // take that account from account storage and refresh tokens and create firewall rule
                }
                else {
                    // If no match or no accountId present, need to add an azure account
                    let selection = yield this._vscodeWrapper.showInformationMessage(LocalizedConstants.msgPromptRetryFirewallRuleNotSignedIn, LocalizedConstants.azureAddAccount);
                    if (selection === LocalizedConstants.azureAddAccount) {
                        profile =
                            yield this.connectionManager.azureController.populateAccountProperties(profile, this._accountStore, providerSettings_1.default.resources.azureManagementResource);
                    }
                    let account = this._accountStore.getAccount(profile.accountId);
                    this.connectionManager.accountService.setAccount(account);
                }
                const handleResponse = yield this.connectionManager.firewallService.handleFirewallRule(connectionResponse.errorNumber, connectionResponse.errorMessage);
                let success = handleResponse.result;
                if (success) {
                    success = yield this.createFirewallRule(profile.server, handleResponse.ipAddress);
                }
                return success;
            }
        });
    }
    /**
     * Save a connection profile using the connection store
     */
    saveProfile(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._connectionStore.saveProfile(profile);
        });
    }
    promptForCreateProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield connectionProfile_1.ConnectionProfile.createProfile(this._prompter, this._connectionStore, this._context, this.connectionManager.azureController, this._accountStore);
            return profile;
        });
    }
    promptToRetryAndSaveProfile(profile_1) {
        return __awaiter(this, arguments, void 0, function* (profile, isFirewallError = false) {
            const updatedProfile = yield this.promptForRetryCreateProfile(profile, isFirewallError);
            if (updatedProfile) {
                return yield this.validateAndSaveProfile(updatedProfile);
            }
            else {
                return undefined;
            }
        });
    }
    promptForRetryCreateProfile(profile_1) {
        return __awaiter(this, arguments, void 0, function* (profile, isFirewallError = false) {
            // Ask if the user would like to fix the profile
            let errorMessage = isFirewallError
                ? LocalizedConstants.msgPromptRetryFirewallRuleAdded
                : LocalizedConstants.msgPromptRetryCreateProfile;
            let result = yield this._vscodeWrapper.showErrorMessage(errorMessage, LocalizedConstants.retryLabel);
            if (result === LocalizedConstants.retryLabel) {
                const newProfile = yield connectionProfile_1.ConnectionProfile.createProfile(this._prompter, this._connectionStore, this._context, this.connectionManager.azureController, this._accountStore, profile);
                return newProfile;
            }
            else {
                // user cancelled the prompt - throw error so that we know user cancelled
                throw new utils_2.CancelError();
            }
        });
    }
    promptForFirewallRuleCreation(startIpAddress, server) {
        return __awaiter(this, void 0, void 0, function* () {
            function padTo2Digits(num) {
                return num.toString().padStart(2, "0");
            }
            // format as "YYYY-MM-DD_hh-mm-ss" (default Azure rulename format)
            function formatDate(date) {
                return ([
                    date.getFullYear(),
                    padTo2Digits(date.getMonth() + 1),
                    padTo2Digits(date.getDate()),
                ].join("-") +
                    "_" +
                    [
                        padTo2Digits(date.getHours()),
                        padTo2Digits(date.getMinutes()),
                        padTo2Digits(date.getSeconds()),
                    ].join("-"));
            }
            let azureAccountChoices = connectionProfile_1.ConnectionProfile.getAccountChoices(this._accountStore);
            let tenantChoices = [];
            let defaultFirewallRuleName = `ClientIPAddress_${formatDate(new Date())}`;
            let accountAnswer;
            let tenantIdAnswer;
            let firewallRuleNameAnswer;
            let questions = [
                {
                    type: question_1.QuestionTypes.input,
                    name: LocalizedConstants.startIpAddressPrompt,
                    message: LocalizedConstants.startIpAddressPrompt,
                    placeHolder: startIpAddress,
                    default: startIpAddress,
                    validate: (value) => {
                        if (!Number.parseFloat(value) || !value.match(constants.ipAddressRegex)) {
                            return LocalizedConstants.msgInvalidIpAddress;
                        }
                    },
                },
                {
                    type: question_1.QuestionTypes.input,
                    name: LocalizedConstants.endIpAddressPrompt,
                    message: LocalizedConstants.endIpAddressPrompt,
                    placeHolder: startIpAddress,
                    validate: (value) => {
                        if (!Number.parseFloat(value) ||
                            !value.match(constants.ipAddressRegex) ||
                            Number.parseFloat(value) > Number.parseFloat(startIpAddress)) {
                            return LocalizedConstants.msgInvalidIpAddress;
                        }
                    },
                    default: startIpAddress,
                },
                {
                    type: question_1.QuestionTypes.input,
                    name: LocalizedConstants.firewallRuleNamePrompt,
                    message: LocalizedConstants.firewallRuleNamePrompt,
                    placeHolder: defaultFirewallRuleName,
                    validate: (value) => {
                        if (!value.match(constants.ruleNameRegex)) {
                            return LocalizedConstants.msgInvalidRuleName;
                        }
                        firewallRuleNameAnswer = value;
                    },
                    default: defaultFirewallRuleName,
                },
                {
                    type: question_1.QuestionTypes.expand,
                    name: LocalizedConstants.aad,
                    message: LocalizedConstants.azureChooseAccount,
                    choices: azureAccountChoices,
                    onAnswered: (value) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        accountAnswer = value;
                        let account = value;
                        tenantChoices.push(...(_a = account === null || account === void 0 ? void 0 : account.properties) === null || _a === void 0 ? void 0 : _a.tenants.map((t) => ({
                            name: t.displayName,
                            value: t,
                        })));
                        if (tenantChoices.length === 1) {
                            tenantIdAnswer = tenantChoices[0].value.id;
                        }
                    }),
                },
                {
                    type: question_1.QuestionTypes.expand,
                    name: LocalizedConstants.tenant,
                    message: LocalizedConstants.azureChooseTenant,
                    choices: tenantChoices,
                    shouldPrompt: () => tenantChoices.length > 1,
                    onAnswered: (value) => {
                        tenantIdAnswer = value.id;
                    },
                },
            ];
            // Prompt and return the value if the user confirmed
            let answers = yield this._prompter.prompt(questions);
            if (answers) {
                let result = {
                    account: accountAnswer,
                    startIpAddress: answers[LocalizedConstants.startIpAddressPrompt]
                        ? answers[LocalizedConstants.startIpAddressPrompt]
                        : startIpAddress,
                    endIpAddress: answers[LocalizedConstants.endIpAddressPrompt]
                        ? answers[LocalizedConstants.endIpAddressPrompt]
                        : startIpAddress,
                    firewallRuleName: firewallRuleNameAnswer,
                    serverName: server,
                    securityTokenMappings: yield this.connectionManager.accountService.createSecurityTokenMapping(accountAnswer, tenantIdAnswer),
                };
                return result;
            }
            else {
                return undefined;
            }
        });
    }
    createFirewallRule(serverName, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this._vscodeWrapper.showInformationMessage(LocalizedConstants.msgPromptRetryFirewallRuleSignedIn(ipAddress, serverName), LocalizedConstants.createFirewallRuleLabel);
            if (result === LocalizedConstants.createFirewallRuleLabel) {
                const firewallService = this.connectionManager.firewallService;
                let params = yield this.promptForFirewallRuleCreation(ipAddress, serverName);
                if (params) {
                    let firewallResult = yield firewallService.createFirewallRule(params);
                    if (firewallResult.result) {
                        this._vscodeWrapper.showInformationMessage(LocalizedConstants.msgPromptFirewallRuleCreated);
                        return true;
                    }
                    else {
                        Utils.showErrorMsg(firewallResult.errorMessage);
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        });
    }
    promptForRetryConnectWithDifferentCredentials() {
        // Ask if the user would like to fix the profile
        return this._vscodeWrapper
            .showErrorMessage(LocalizedConstants.msgPromptRetryConnectionDifferentCredentials, LocalizedConstants.retryLabel)
            .then((result) => {
            if (result === LocalizedConstants.retryLabel) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    fillOrPromptForMissingInfo(selection) {
        // If a connection string is present, don't prompt for any other info
        if (selection.connectionCreds.connectionString) {
            return new Promise((resolve, reject) => {
                resolve(selection.connectionCreds);
            });
        }
        const passwordEmptyInConfigFile = Utils.isEmpty(selection.connectionCreds.password);
        return this._connectionStore.addSavedPassword(selection).then((sel) => {
            return connectionCredentials_1.ConnectionCredentials.ensureRequiredPropertiesSet(sel.connectionCreds, selection.quickPickItemType === interfaces_1.CredentialsQuickPickItemType.Profile, false, passwordEmptyInConfigFile, this._prompter, this._connectionStore);
        });
    }
    addNewAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.azureController.addAccount(this._accountStore);
        });
    }
    // Prompts the user to pick a profile for removal, then removes from the global saved state
    removeProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            // Flow: Select profile to remove, confirm removal, remove, notify
            let profiles = yield self._connectionStore.getProfilePickListItems(false);
            let profile = yield self.selectProfileForRemoval(profiles);
            let profileRemoved = profile ? yield self._connectionStore.removeProfile(profile) : false;
            if (profileRemoved) {
                // TODO again consider moving information prompts to the prompt package
                this._vscodeWrapper.showInformationMessage(LocalizedConstants.msgProfileRemoved);
            }
            return profileRemoved;
        });
    }
    selectProfileForRemoval(profiles) {
        let self = this;
        if (!profiles || profiles.length === 0) {
            // Inform the user we have no profiles available for deletion
            // TODO: consider moving to prompter if we separate all UI logic from workflows in the future
            this._vscodeWrapper.showErrorMessage(LocalizedConstants.msgNoProfilesSaved);
            return Promise.resolve(undefined);
        }
        let chooseProfile = "ChooseProfile";
        let confirm = "ConfirmRemoval";
        let questions = [
            {
                // 1: what profile should we remove?
                type: question_1.QuestionTypes.expand,
                name: chooseProfile,
                message: LocalizedConstants.msgSelectProfileToRemove,
                matchOptions: { matchOnDescription: true },
                choices: profiles,
            },
            {
                // 2: Confirm removal before proceeding
                type: question_1.QuestionTypes.confirm,
                name: confirm,
                message: LocalizedConstants.confirmRemoveProfilePrompt,
            },
        ];
        // Prompt and return the value if the user confirmed
        return self._prompter.prompt(questions).then((answers) => {
            if (answers && answers[confirm]) {
                let profilePickItem = answers[chooseProfile];
                return profilePickItem.connectionCreds;
            }
            else {
                return undefined;
            }
        });
    }
}
exports.ConnectionUI = ConnectionUI;

//# sourceMappingURL=connectionUI.js.map
