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
exports.ConnectionStore = void 0;
const Constants = require("../constants/constants");
const LocalizedConstants = require("../constants/locConstants");
const ConnInfo = require("./connectionInfo");
const Utils = require("../models/utils");
const validationException_1 = require("../utils/validationException");
const connectionCredentials_1 = require("../models/connectionCredentials");
const interfaces_1 = require("../models/interfaces");
const connectionconfig_1 = require("../connectionconfig/connectionconfig");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
/**
 * Manages the connections list including saved profiles and the most recently used connections
 *
 * @export
 * @class ConnectionStore
 */
class ConnectionStore {
    constructor(_context, _logger, _credentialStore, _connectionConfig, _vscodeWrapper) {
        this._context = _context;
        this._logger = _logger;
        this._credentialStore = _credentialStore;
        this._connectionConfig = _connectionConfig;
        this._vscodeWrapper = _vscodeWrapper;
        if (!this.vscodeWrapper) {
            this.vscodeWrapper = new vscodeWrapper_1.default();
        }
        if (!this._connectionConfig) {
            this._connectionConfig = new connectionconfig_1.ConnectionConfig();
        }
    }
    get initialized() {
        return this._connectionConfig.initialized;
    }
    static get CRED_PREFIX() {
        return "Microsoft.SqlTools";
    }
    static get CRED_SEPARATOR() {
        return "|";
    }
    static get CRED_SERVER_PREFIX() {
        return "server:";
    }
    static get CRED_DB_PREFIX() {
        return "db:";
    }
    static get CRED_USER_PREFIX() {
        return "user:";
    }
    static get CRED_ITEMTYPE_PREFIX() {
        return "itemtype:";
    }
    static get CRED_CONNECTION_STRING_PREFIX() {
        return "isConnectionString:";
    }
    static get CRED_PROFILE_USER() {
        return interfaces_1.CredentialsQuickPickItemType[interfaces_1.CredentialsQuickPickItemType.Profile];
    }
    static get CRED_MRU_USER() {
        return interfaces_1.CredentialsQuickPickItemType[interfaces_1.CredentialsQuickPickItemType.Mru];
    }
    static formatCredentialIdForCred(creds, itemType) {
        if (Utils.isEmpty(creds)) {
            throw new validationException_1.default("Missing Connection which is required");
        }
        let itemTypeString = ConnectionStore.CRED_PROFILE_USER;
        if (itemType) {
            itemTypeString = interfaces_1.CredentialsQuickPickItemType[itemType];
        }
        return ConnectionStore.formatCredentialId(creds.server, creds.database, creds.user, itemTypeString);
    }
    /**
     * Creates a formatted credential usable for uniquely identifying a SQL Connection.
     * This string can be decoded but is not optimized for this.
     * @static
     * @param server name of the server - required
     * @param database name of the database - optional
     * @param user name of the user - optional
     * @param itemType type of the item (MRU or Profile) - optional
     * @returns formatted string with server, DB and username
     */
    static formatCredentialId(server, database, user, itemType, isConnectionString) {
        if (Utils.isEmpty(server) && !isConnectionString) {
            throw new validationException_1.default("Missing Server Name, which is required");
        }
        let cred = [ConnectionStore.CRED_PREFIX];
        if (!itemType) {
            itemType = ConnectionStore.CRED_PROFILE_USER;
        }
        ConnectionStore.pushIfNonEmpty(itemType, ConnectionStore.CRED_ITEMTYPE_PREFIX, cred);
        ConnectionStore.pushIfNonEmpty(server, ConnectionStore.CRED_SERVER_PREFIX, cred);
        ConnectionStore.pushIfNonEmpty(database, ConnectionStore.CRED_DB_PREFIX, cred);
        ConnectionStore.pushIfNonEmpty(user, ConnectionStore.CRED_USER_PREFIX, cred);
        if (isConnectionString) {
            ConnectionStore.pushIfNonEmpty("true", ConnectionStore.CRED_CONNECTION_STRING_PREFIX, cred);
        }
        return cred.join(ConnectionStore.CRED_SEPARATOR);
    }
    get connectionConfig() {
        return this._connectionConfig;
    }
    static pushIfNonEmpty(value, prefix, arr) {
        if (Utils.isNotEmpty(value)) {
            arr.push(prefix.concat(value));
        }
    }
    get vscodeWrapper() {
        return this._vscodeWrapper;
    }
    set vscodeWrapper(value) {
        this._vscodeWrapper = value;
    }
    /**
     * Load connections from MRU and profile list and return them as a formatted picklist.
     * Note: connections will not include password value
     *
     * @returns
     */
    getPickListItems() {
        return __awaiter(this, void 0, void 0, function* () {
            let pickListItems = yield this.getConnectionQuickpickItems(false);
            pickListItems.push({
                label: `$(add) ${LocalizedConstants.CreateProfileFromConnectionsListLabel}`,
                connectionCreds: undefined,
                quickPickItemType: interfaces_1.CredentialsQuickPickItemType.NewConnection,
            });
            return pickListItems;
        });
    }
    /**
     * Gets all connection profiles stored in the user settings
     * Note: connections will not include password value
     *
     * @returns
     */
    getProfilePickListItems(getWorkspaceProfiles) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.loadProfiles(getWorkspaceProfiles);
        });
    }
    addSavedPassword(credentialsItem) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            if (typeof credentialsItem.connectionCreds["savePassword"] === "undefined" ||
                credentialsItem.connectionCreds["savePassword"] === false) {
                // Don't try to lookup a saved password if savePassword is set to false for the credential
                return credentialsItem;
                // Note that 'emptyPasswordInput' property is only present for connection profiles
            }
            else if (self.shouldLookupSavedPassword(credentialsItem.connectionCreds)) {
                let credentialId = ConnectionStore.formatCredentialIdForCred(credentialsItem.connectionCreds, credentialsItem.quickPickItemType);
                const savedCred = yield self._credentialStore.readCredential(credentialId);
                if (savedCred) {
                    credentialsItem.connectionCreds.password = savedCred.password;
                    return credentialsItem;
                }
                else {
                    throw new Error("No saved password found");
                }
            }
            else {
                // Already have a password, no need to look up
                return credentialsItem;
            }
        });
    }
    /**
     * Lookup credential store
     * @param connectionCredentials Connection credentials of profile for password lookup
     */
    lookupPassword(connectionCredentials_2) {
        return __awaiter(this, arguments, void 0, function* (connectionCredentials, isConnectionString = false) {
            const credentialId = ConnectionStore.formatCredentialId(connectionCredentials.server, connectionCredentials.database, connectionCredentials.user, ConnectionStore.CRED_PROFILE_USER, isConnectionString);
            const savedCredential = yield this._credentialStore.readCredential(credentialId);
            if (savedCredential && savedCredential.password) {
                return savedCredential.password;
            }
            else {
                return undefined;
            }
        });
    }
    /**
     * public for testing purposes. Validates whether a password should be looked up from the credential store or not
     *
     * @param connectionCreds
     * @returns
     * @memberof ConnectionStore
     */
    shouldLookupSavedPassword(connectionCreds) {
        if (connectionCredentials_1.ConnectionCredentials.isPasswordBasedCredential(connectionCreds)) {
            // Only lookup if password isn't saved in the profile, and if it was not explicitly defined
            // as a blank password
            return Utils.isEmpty(connectionCreds.password) && !connectionCreds.emptyPasswordInput;
        }
        return false;
    }
    /**
     * Saves a connection profile to the user settings.
     * Password values are stored to a separate credential store if the "savePassword" option is true
     *
     * @param profile the profile to save
     * @param whether the plaintext password should be written to the settings file
     * @returns a Promise that returns the original profile, for help in chaining calls
     */
    saveProfile(profile, forceWritePlaintextPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            this._connectionConfig.populateMissingIds(profile);
            // Add the profile to the saved list, taking care to clear out the password field if necessary
            let savedProfile;
            if (profile.authenticationType === Utils.authTypeToString(interfaces_1.AuthenticationTypes.AzureMFA)) {
                savedProfile = Object.assign({}, profile, {
                    azureAccountToken: "",
                });
            }
            else {
                if (forceWritePlaintextPassword) {
                    savedProfile = Object.assign({}, profile);
                }
                else {
                    savedProfile = Object.assign({}, profile, { password: "" });
                }
            }
            yield this._connectionConfig.addConnection(savedProfile);
            if (yield this.saveProfilePasswordIfNeeded(profile)) {
                ConnInfo.fixupConnectionCredentials(profile);
            }
            return profile;
        });
    }
    /**
     * Gets the list of recently used connections. These will not include the password - a separate call to
     * {addSavedPassword} is needed to fill that before connecting
     *
     * @returns the array of connections, empty if none are found
     */
    getRecentlyUsedConnections() {
        let configValues = this._context.globalState.get(Constants.configRecentConnections);
        if (!configValues) {
            configValues = [];
        }
        return configValues;
    }
    /**
     * Adds a connection to the recently used list.
     * Password values are stored to a separate credential store if the "savePassword" option is true
     *
     * @param conn the connection to add
     * @returns a Promise that returns when the connection was saved
     */
    addRecentlyUsed(conn) {
        const self = this;
        return new Promise((resolve, reject) => {
            // Get all profiles
            let configValues = self.getRecentlyUsedConnections();
            let maxConnections = self.getMaxRecentConnectionsCount();
            // Remove the connection from the list if it already exists
            configValues = configValues.filter((value) => !Utils.isSameProfile(value, conn));
            // Add the connection to the front of the list, taking care to clear out the password field
            let savedConn = Object.assign({}, conn, {
                password: "",
            });
            configValues.unshift(savedConn);
            // Remove last element if needed
            if (configValues.length > maxConnections) {
                configValues = configValues.slice(0, maxConnections);
            }
            self._context.globalState.update(Constants.configRecentConnections, configValues).then(() => __awaiter(this, void 0, void 0, function* () {
                // Only save if we successfully added the profile and if savePassword
                if (conn.savePassword) {
                    yield self.doSaveCredential(conn, interfaces_1.CredentialsQuickPickItemType.Mru);
                }
                // And resolve / reject at the end of the process
                resolve(undefined);
            }), (err) => {
                reject(err);
            });
        });
    }
    /**
     * Clear all recently used connections from the MRU list.
     * @returns a boolean value indicating whether the credentials were deleted successfully.
     */
    clearRecentlyUsed() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get all recent connection profiles and delete the associated credentials.
            const mruList = this.getRecentlyUsedConnections();
            let deleteCredentialSuccess = true;
            for (const connection of mruList) {
                const credentialId = ConnectionStore.formatCredentialId(connection.server, connection.database, connection.user, ConnectionStore.CRED_MRU_USER);
                try {
                    yield this._credentialStore.deleteCredential(credentialId);
                }
                catch (err) {
                    deleteCredentialSuccess = false;
                    this._logger.log(LocalizedConstants.deleteCredentialError, credentialId, err);
                }
            }
            // Update the MRU list to be empty
            yield this._context.globalState.update(Constants.configRecentConnections, []);
            return deleteCredentialSuccess;
        });
    }
    /**
     * Remove a connection profile from the recently used list.
     * @param conn connection profile to remove
     * @param keepCredentialStore Whether keep the credential store after a profile removal.  Defaults to false.
     */
    removeRecentlyUsed(conn, keepCredentialStore = false) {
        const self = this;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            // Get all profiles
            let configValues = self.getRecentlyUsedConnections();
            // Remove the connection from the list if it already exists
            configValues = configValues.filter((value) => !Utils.isSameProfile(value, conn));
            // Remove any saved password
            if (conn.savePassword && !keepCredentialStore) {
                let credentialId = ConnectionStore.formatCredentialId(conn.server, conn.database, conn.user, ConnectionStore.CRED_MRU_USER);
                yield self._credentialStore.deleteCredential(credentialId);
            }
            // Update the MRU list
            self._context.globalState.update(Constants.configRecentConnections, configValues).then(() => {
                // And resolve / reject at the end of the process
                resolve(undefined);
            }, (err) => {
                reject(err);
            });
        }));
    }
    saveProfilePasswordIfNeeded(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!profile.savePassword) {
                return Promise.resolve(true);
            }
            return yield this.doSaveCredential(profile, interfaces_1.CredentialsQuickPickItemType.Profile);
        });
    }
    saveProfileWithConnectionString(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!profile.connectionString) {
                return Promise.resolve(true);
            }
            return yield this.doSaveCredential(profile, interfaces_1.CredentialsQuickPickItemType.Profile, true);
        });
    }
    doSaveCredential(conn_1, type_1) {
        return __awaiter(this, arguments, void 0, function* (conn, type, isConnectionString = false) {
            let self = this;
            let password = isConnectionString ? conn.connectionString : conn.password;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (Utils.isNotEmpty(password)) {
                    let credType = type === interfaces_1.CredentialsQuickPickItemType.Mru
                        ? ConnectionStore.CRED_MRU_USER
                        : ConnectionStore.CRED_PROFILE_USER;
                    let credentialId = ConnectionStore.formatCredentialId(conn.server, conn.database, conn.user, credType, isConnectionString);
                    yield self._credentialStore
                        .saveCredential(credentialId, password)
                        .then((result) => {
                        resolve(result);
                    })
                        .catch((err) => {
                        // Bubble up error if there was a problem executing the set command
                        reject(err);
                    });
                }
                else {
                    resolve(true);
                }
            }));
        });
    }
    /**
     * Removes a profile from the user settings and deletes any related password information
     * from the credential store
     *
     * @param profile the profile to be removed
     * @param keepCredentialStore Whether to keep the credential store after a profile removal. Defaults to false.
     * @returns true if successful
     */
    removeProfile(profile_1) {
        return __awaiter(this, arguments, void 0, function* (profile, keepCredentialStore = false) {
            let profileFound = yield this._connectionConfig.removeConnection(profile);
            if (profileFound) {
                // Remove the profile from the recently used list if necessary
                yield this.removeRecentlyUsed(profile, keepCredentialStore);
                // Now remove password from credential store. Currently do not care about status unless an error occurred
                if (profile.savePassword === true && !keepCredentialStore) {
                    let credentialId = ConnectionStore.formatCredentialId(profile.server, profile.database, profile.user, ConnectionStore.CRED_PROFILE_USER);
                    this._credentialStore.deleteCredential(credentialId).then(undefined, (rejected) => {
                        throw new Error(rejected);
                    });
                }
                return profileFound;
            }
        });
    }
    createQuickPickItem(item, itemType) {
        return {
            label: ConnInfo.getSimpleConnectionDisplayName(item),
            description: ConnInfo.getPicklistDescription(item),
            detail: ConnInfo.getPicklistDetails(item),
            connectionCreds: item,
            quickPickItemType: itemType,
        };
    }
    /**
     * Deletes the password for a connection from the credential store
     * @param connectionCredential
     */
    deleteCredential(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            let credentialId = ConnectionStore.formatCredentialId(profile.server, profile.database, profile.user, ConnectionStore.CRED_PROFILE_USER);
            return yield this._credentialStore.deleteCredential(credentialId);
        });
    }
    /**
     * Removes password from a saved profile and credential store
     */
    removeProfilePassword(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            // if the password is saved in the credential store, remove it
            let profile = connection;
            profile.password = "";
            yield this.saveProfile(profile);
        });
    }
    readAllConnections() {
        return __awaiter(this, arguments, void 0, function* (includeRecentConnections = false) {
            let connResults = [];
            const connections = yield this._connectionConfig.getConnections(true);
            const configConnections = connections.map((c) => {
                const conn = c;
                conn.profileSource = interfaces_1.CredentialsQuickPickItemType.Profile;
                return conn;
            });
            connResults = connResults.concat(configConnections);
            if (includeRecentConnections) {
                const recentConnections = this.getRecentlyUsedConnections().map((c) => {
                    const conn = c;
                    conn.profileSource = interfaces_1.CredentialsQuickPickItemType.Mru;
                    return conn;
                });
                connResults = connResults.concat(recentConnections);
            }
            // TODO re-add deduplication logic from old method
            this._logger.logDebug(`readAllConnections: ${connResults.length} connections${includeRecentConnections ? ` (${configConnections.length} from config, ${connResults.length - configConnections.length} from recent)` : "; excluded recent"})`);
            return connResults;
        });
    }
    getConnectionQuickpickItems() {
        return __awaiter(this, arguments, void 0, function* (includeRecentConnections = false) {
            let output = [];
            const connections = yield this.readAllConnections(includeRecentConnections);
            output = connections.map((c) => {
                return this.createQuickPickItem(c, c.profileSource);
            });
            return output;
        });
    }
    loadProfiles(loadWorkspaceProfiles) {
        return __awaiter(this, void 0, void 0, function* () {
            let connections = yield this._connectionConfig.getConnections(loadWorkspaceProfiles);
            let quickPickItems = connections.map((c) => this.createQuickPickItem(c, interfaces_1.CredentialsQuickPickItemType.Profile));
            return quickPickItems;
        });
    }
    getMaxRecentConnectionsCount() {
        let config = this._vscodeWrapper.getConfiguration(Constants.extensionConfigSectionName);
        let maxConnections = config[Constants.configMaxRecentConnections];
        if (typeof maxConnections !== "number" || maxConnections <= 0) {
            maxConnections = 5;
        }
        return maxConnections;
    }
}
exports.ConnectionStore = ConnectionStore;

//# sourceMappingURL=connectionStore.js.map
