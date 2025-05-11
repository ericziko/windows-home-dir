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
exports.ConnectionConfig = void 0;
const Constants = require("../constants/constants");
const LocalizedConstants = require("../constants/locConstants");
const Utils = require("../models/utils");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
const protocol_1 = require("../protocol");
const connectionProfile_1 = require("../models/connectionProfile");
const logger_1 = require("../models/logger");
const connectionInfo_1 = require("../models/connectionInfo");
/**
 * Implements connection profile file storage.
 */
class ConnectionConfig {
    /**
     * Constructor.
     */
    constructor(_vscodeWrapper) {
        this._vscodeWrapper = _vscodeWrapper;
        this.initialized = new protocol_1.Deferred();
        this.RootGroupName = "ROOT";
        if (!this._vscodeWrapper) {
            this._vscodeWrapper = new vscodeWrapper_1.default();
        }
        this._logger = logger_1.Logger.create(this._vscodeWrapper.outputChannel, "ConnectionConfig");
        void this.assignMissingIds();
    }
    getRootGroup() {
        const groups = this.getGroupsFromSettings();
        return groups.find((group) => group.name === this.RootGroupName);
    }
    assignMissingIds() {
        return __awaiter(this, void 0, void 0, function* () {
            let madeChanges = false;
            // Connection groups
            const groups = this.getGroupsFromSettings();
            // ensure ROOT group exists
            let rootGroup = this.getRootGroup();
            if (!rootGroup) {
                rootGroup = {
                    name: this.RootGroupName,
                    id: Utils.generateGuid(),
                };
                this._logger.logDebug(`Adding missing ROOT group to connection groups`);
                madeChanges = true;
                groups.push(rootGroup);
            }
            // Clean up connection groups
            for (const group of groups) {
                if (group.id === rootGroup.id) {
                    continue;
                }
                // ensure each group has an ID
                if (!group.id) {
                    group.id = Utils.generateGuid();
                    madeChanges = true;
                    this._logger.logDebug(`Adding missing ID to connection group '${group.name}'`);
                }
                // ensure each group is in a group
                if (!group.groupId) {
                    group.groupId = rootGroup.id;
                    madeChanges = true;
                    this._logger.logDebug(`Adding missing parentId to connection '${group.name}'`);
                }
            }
            // Clean up connection profiles
            const profiles = this.getProfilesFromSettings();
            for (const profile of profiles) {
                if (this.populateMissingIds(profile)) {
                    this._logger.logDebug(`Adding missing group ID or connection ID to connection '${(0, connectionInfo_1.getConnectionDisplayName)(profile)}'`);
                }
            }
            // Save the changes to settings
            if (madeChanges) {
                this._logger.logDebug(`Updates made to connection profiles and groups.  Writing all ${groups.length} group(s) and ${profiles.length} profile(s) to settings.`);
                yield this.writeConnectionGroupsToSettings(groups);
                yield this.writeProfilesToSettings(profiles);
            }
            this.initialized.resolve();
        });
    }
    /**
     * Populate missing connection ID and group ID for a connection profile.
     * @returns true if the profile was modified, false otherwise.
     */
    populateMissingIds(profile) {
        let modified = false;
        // ensure each profile is in a group
        if (profile.groupId === undefined) {
            const rootGroup = this.getRootGroup();
            if (rootGroup) {
                profile.groupId = rootGroup.id;
                modified = true;
            }
        }
        // ensure each profile has an ID
        if (profile.id === undefined) {
            connectionProfile_1.ConnectionProfile.addIdIfMissing(profile);
            modified = true;
        }
        return modified;
    }
    /**
     * Add a new connection to the connection config.
     */
    addConnection(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            this.populateMissingIds(profile);
            let profiles = this.getProfilesFromSettings();
            // Remove the profile if already set
            profiles = profiles.filter((value) => !Utils.isSameProfile(value, profile));
            profiles.push(profile);
            return yield this.writeProfilesToSettings(profiles);
        });
    }
    /**
     * Get a list of all connections in the connection config. Connections returned
     * are sorted first by whether they were found in the user/workspace settings,
     * and next alphabetically by profile/server name.
     */
    getConnections(getWorkspaceConnections) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialized;
            let profiles = [];
            // Read from user settings
            let userProfiles = this.getProfilesFromSettings();
            userProfiles.sort(this.compareConnectionProfile);
            profiles = profiles.concat(userProfiles);
            if (getWorkspaceConnections) {
                // Read from workspace settings
                let workspaceProfiles = this.getProfilesFromSettings(false);
                workspaceProfiles.sort(this.compareConnectionProfile);
                profiles = profiles.concat(workspaceProfiles);
            }
            if (profiles.length > 0) {
                profiles = profiles.filter((conn) => {
                    // filter any connection missing a connection string and server name or the sample that's shown by default
                    return (conn.connectionString ||
                        (!!conn.server && conn.server !== LocalizedConstants.SampleServerName));
                });
            }
            return profiles;
        });
    }
    /**
     * Remove an existing connection from the connection config.
     */
    removeConnection(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            let profiles = this.getProfilesFromSettings();
            // Remove the profile if already set
            let found = false;
            profiles = profiles.filter((value) => {
                if (Utils.isSameProfile(value, profile)) {
                    // remove just this profile
                    found = true;
                    return false;
                }
                else {
                    return true;
                }
            });
            yield this.writeProfilesToSettings(profiles);
            return found;
        });
    }
    /**
     * Get all profiles from the settings.
     * This is public for testing only.
     * @param global When `true` profiles come from user settings, otherwise from workspace settings.  Default is `true`.
     * @returns the set of connection profiles found in the settings.
     */
    getProfilesFromSettings(global = true) {
        return this.getArrayFromSettings(Constants.connectionsArrayName, global);
    }
    getGroupsFromSettings(global = true) {
        return this.getArrayFromSettings(Constants.connectionGroupsArrayName, global);
    }
    getArrayFromSettings(configSection, global = true) {
        let configuration = this._vscodeWrapper.getConfiguration(Constants.extensionName, this._vscodeWrapper.activeTextEditorUri);
        let configValue = configuration.inspect(configSection);
        if (global) {
            // only return the global values if that's what's requested
            return configValue.globalValue || [];
        }
        else {
            // otherwise, return the combination of the workspace and workspace folder values
            return (configValue.workspaceValue || []).concat(configValue.workspaceFolderValue || []);
        }
    }
    /**
     * Replace existing profiles in the user settings with a new set of profiles.
     * @param profiles the set of profiles to insert into the settings file.
     */
    writeProfilesToSettings(profiles) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save the file
            yield this._vscodeWrapper.setConfiguration(Constants.extensionName, Constants.connectionsArrayName, profiles);
        });
    }
    /**
     * Replace existing connection groups in the user settings with a new set of connection groups.
     * @param connGroups the set of connection groups to insert into the settings file.
     */
    writeConnectionGroupsToSettings(connGroups) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save the file
            yield this._vscodeWrapper.setConfiguration(Constants.extensionName, Constants.connectionGroupsArrayName, connGroups);
        });
    }
    /** Compare function for sorting by profile name if available, otherwise fall back to server name or connection string */
    compareConnectionProfile(connA, connB) {
        const nameA = connA.profileName
            ? connA.profileName
            : connA.server
                ? connA.server
                : connA.connectionString;
        const nameB = connB.profileName
            ? connB.profileName
            : connB.server
                ? connB.server
                : connB.connectionString;
        return nameA.localeCompare(nameB);
    }
}
exports.ConnectionConfig = ConnectionConfig;

//# sourceMappingURL=connectionconfig.js.map
