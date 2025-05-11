"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectExplorerUtils = void 0;
const path = require("path");
const treeNodeInfo_1 = require("./treeNodeInfo");
const Constants = require("../constants/constants");
const LocalizedConstants = require("../constants/locConstants");
class ObjectExplorerUtils {
    static iconPath(label) {
        if (label) {
            if (label === Constants.disconnectedServerNodeType) {
                // if disconnected
                label = `${Constants.serverLabel}_red`;
            }
            else if (label === Constants.serverLabel) {
                // if connected
                label += "_green";
            }
            return path.join(ObjectExplorerUtils.rootPath, `${label}.svg`);
        }
    }
    static createNoItemsTreeItem() {
        return {
            label: LocalizedConstants.ObjectExplorer.NoItems,
            accessibilityInformation: {
                label: LocalizedConstants.ObjectExplorer.NoItems,
            },
            tooltip: LocalizedConstants.ObjectExplorer.NoItems,
            iconPath: {
                light: ObjectExplorerUtils.iconPath("NoItems_light"),
                dark: ObjectExplorerUtils.iconPath("NoItems_dark"),
            },
        };
    }
    static createErrorTreeItem(errorMessage) {
        return {
            label: LocalizedConstants.ObjectExplorer.ErrorLoadingRefreshToTryAgain,
            accessibilityInformation: {
                label: errorMessage,
            },
            tooltip: errorMessage,
            iconPath: {
                light: ObjectExplorerUtils.iconPath("Error_light"),
                dark: ObjectExplorerUtils.iconPath("Error_dark"),
            },
        };
    }
    static getNodeUri(node) {
        let profile;
        if (node instanceof treeNodeInfo_1.TreeNodeInfo) {
            profile = node.connectionInfo;
        }
        else {
            profile = node.parentNode.connectionInfo;
        }
        return ObjectExplorerUtils.getNodeUriFromProfile(profile);
    }
    // TODO: this function emulates one in STS; replace with call to STS to avoid mixups
    static getNodeUriFromProfile(profile) {
        let uri;
        if (profile.connectionString) {
            let fields = profile.connectionString
                .split(";")
                .filter((s) => !s.toLowerCase().includes("password"));
            uri = fields.join(";");
            return uri;
        }
        if (profile.authenticationType === Constants.sqlAuthentication) {
            uri = `${profile.server}_${profile.database}_${profile.user}_${profile.profileName}`;
        }
        else {
            uri = `${profile.server}_${profile.database}_${profile.profileName}`;
        }
        return uri;
    }
    /**
     * Gets the database name for the node - which is the database name of the connection for a server node, the database name
     * for nodes at or under a database node or a default value if it's neither of those.
     * @param node The node to get the database name of
     * @returns The database name
     */
    static getDatabaseName(node) {
        // We're on a server node so just use the database directly from the connection string
        if (node.nodeType === Constants.serverLabel ||
            node.nodeType === Constants.disconnectedServerNodeType) {
            return node.connectionInfo.database;
        }
        // Otherwise find the name from the node metadata - going up through the parents of the node
        // until we find the database node (so anything under a database node will get the name of
        // the database it's nested in)
        while (node) {
            if (node.metadata) {
                if (node.metadata.metadataTypeName === Constants.databaseString) {
                    return node.metadata.name;
                }
            }
            node = node.parentNode;
        }
        return LocalizedConstants.defaultDatabaseLabel;
    }
    static isFirewallError(errorCode) {
        return errorCode === Constants.errorFirewallRule;
    }
}
exports.ObjectExplorerUtils = ObjectExplorerUtils;
ObjectExplorerUtils.rootPath = path.join(__dirname, "objectTypes");

//# sourceMappingURL=objectExplorerUtils.js.map
