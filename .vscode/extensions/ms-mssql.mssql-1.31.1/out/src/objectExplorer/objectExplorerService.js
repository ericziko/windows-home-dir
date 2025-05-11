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
exports.ObjectExplorerService = void 0;
const vscode = require("vscode");
const createSessionRequest_1 = require("../models/contracts/objectExplorer/createSessionRequest");
const expandNodeRequest_1 = require("../models/contracts/objectExplorer/expandNodeRequest");
const vscode_1 = require("vscode");
const refreshSessionRequest_1 = require("../models/contracts/objectExplorer/refreshSessionRequest");
const closeSessionRequest_1 = require("../models/contracts/objectExplorer/closeSessionRequest");
const treeNodeInfo_1 = require("./treeNodeInfo");
const interfaces_1 = require("../models/interfaces");
const LocalizedConstants = require("../constants/locConstants");
const addConnectionTreeNode_1 = require("./addConnectionTreeNode");
const accountSignInTreeNode_1 = require("./accountSignInTreeNode");
const connectTreeNode_1 = require("./connectTreeNode");
const protocol_1 = require("../protocol");
const Constants = require("../constants/constants");
const objectExplorerUtils_1 = require("./objectExplorerUtils");
const Utils = require("../models/utils");
const connectionCredentials_1 = require("../models/connectionCredentials");
const connectionProfile_1 = require("../models/connectionProfile");
const providerSettings_1 = require("../azure/providerSettings");
const telemetry_1 = require("../telemetry/telemetry");
const AzureConstants = require("../azure/constants");
const ConnInfo = require("../models/connectionInfo");
const telemetry_2 = require("../sharedInterfaces/telemetry");
const getSessionIdRequest_1 = require("../models/contracts/objectExplorer/getSessionIdRequest");
const logger_1 = require("../models/logger");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
function getParentNode(node) {
    node = node.parentNode;
    if (!(node instanceof treeNodeInfo_1.TreeNodeInfo)) {
        vscode.window.showErrorMessage(LocalizedConstants.nodeErrorMessage);
        throw new Error(`Parent node was not TreeNodeInfo.`);
    }
    return node;
}
class ObjectExplorerService {
    constructor(_vscodeWrapper, _connectionManager, _objectExplorerProvider) {
        this._vscodeWrapper = _vscodeWrapper;
        this._connectionManager = _connectionManager;
        this._objectExplorerProvider = _objectExplorerProvider;
        if (!_vscodeWrapper) {
            this._vscodeWrapper = new vscodeWrapper_1.default();
        }
        this._client = this._connectionManager.client;
        this._logger = logger_1.Logger.create(this._vscodeWrapper.outputChannel, "ObjectExplorerService");
        this._treeNodeToChildrenMap = new Map();
        this._rootTreeNodeArray = new Array();
        this._sessionIdToConnectionProfileMap = new Map();
        this._sessionIdToNodeLabelMap = new Map();
        this._sessionIdToPromiseMap = new Map();
        this._expandParamsToPromiseMap = new Map();
        this._expandParamsToTreeNodeInfoMap = new Map();
        this._client.onNotification(createSessionRequest_1.CreateSessionCompleteNotification.type, this.handleSessionCreatedNotification());
        this._client.onNotification(expandNodeRequest_1.ExpandCompleteNotification.type, this.handleExpandSessionNotification());
    }
    handleSessionCreatedNotification() {
        const self = this;
        const handler = (result) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (self._currentNode instanceof connectTreeNode_1.ConnectTreeNode) {
                self.currentNode = getParentNode(self.currentNode);
            }
            if (result.success) {
                let nodeLabel = (_a = this._sessionIdToNodeLabelMap.get(result.sessionId)) !== null && _a !== void 0 ? _a : this.getConnectionLabel(self._currentNode.connectionInfo);
                // if no node label, check if it has a name in saved profiles
                // in case this call came from new query
                // let savedConnections =
                // this._connectionManager.connectionStore.readAllConnections();
                let nodeConnection = this._sessionIdToConnectionProfileMap.get(result.sessionId);
                // set connection and other things
                let node;
                if (self._currentNode && self._currentNode.sessionId === result.sessionId) {
                    node = treeNodeInfo_1.TreeNodeInfo.fromNodeInfo(result.rootNode, result.sessionId, undefined, self._currentNode.connectionInfo, nodeLabel, Constants.serverLabel);
                }
                else {
                    node = treeNodeInfo_1.TreeNodeInfo.fromNodeInfo(result.rootNode, result.sessionId, undefined, nodeConnection, nodeLabel, Constants.serverLabel);
                }
                // make a connection if not connected already
                const nodeUri = this.getNodeIdentifier(node);
                if (!this._connectionManager.isConnected(nodeUri) &&
                    !this._connectionManager.isConnecting(nodeUri)) {
                    const profile = node.connectionInfo;
                    yield this._connectionManager.connect(nodeUri, profile);
                }
                self.updateNode(node);
                self._objectExplorerProvider.objectExplorerExists = true;
                const promise = self._sessionIdToPromiseMap.get(result.sessionId);
                // remove the sign in node once the session is created
                if (self._treeNodeToChildrenMap.has(node)) {
                    self._treeNodeToChildrenMap.delete(node);
                }
                return promise === null || promise === void 0 ? void 0 : promise.resolve(node);
            }
            else {
                // create session failure
                if ((_c = (_b = self._currentNode) === null || _b === void 0 ? void 0 : _b.connectionInfo) === null || _c === void 0 ? void 0 : _c.password) {
                    const profile = this._currentNode.connectionInfo;
                    profile.password = "";
                    this._currentNode.updateConnectionInfo(profile);
                }
                let error = LocalizedConstants.connectErrorLabel;
                let errorNumber;
                if (result.errorNumber) {
                    errorNumber = result.errorNumber;
                }
                if (result.errorMessage) {
                    error += `: ${result.errorMessage}`;
                }
                if (errorNumber === Constants.errorSSLCertificateValidationFailed) {
                    void self._connectionManager.showInstructionTextAsWarning(self._currentNode.connectionInfo, (updatedProfile) => __awaiter(this, void 0, void 0, function* () {
                        void self.reconnectProfile(self._currentNode, updatedProfile);
                    }));
                }
                else if (objectExplorerUtils_1.ObjectExplorerUtils.isFirewallError(result.errorNumber)) {
                    // handle session failure because of firewall issue
                    let handleFirewallResult = yield self._connectionManager.firewallService.handleFirewallRule(Constants.errorFirewallRule, result.errorMessage);
                    if (handleFirewallResult.result && handleFirewallResult.ipAddress) {
                        const profile = self._currentNode.connectionInfo;
                        self.updateNode(self._currentNode);
                        void self._connectionManager.connectionUI.handleFirewallError(profile, result);
                    }
                }
                else if (self._currentNode.connectionInfo.authenticationType === Constants.azureMfa &&
                    self.needsAccountRefresh(result, self._currentNode.connectionInfo.user)) {
                    let profile = self._currentNode.connectionInfo;
                    let account = this._connectionManager.accountStore.getAccount(profile.accountId);
                    yield this.refreshAccount(account, profile);
                    // Do not await when performing reconnect to allow
                    // OE node to expand after connection is established.
                    void this.reconnectProfile(self._currentNode, profile);
                }
                else {
                    self._connectionManager.vscodeWrapper.showErrorMessage(error);
                }
                const promise = self._sessionIdToPromiseMap.get(result.sessionId);
                if (promise) {
                    return promise.resolve(undefined);
                }
            }
        });
        return handler;
    }
    reconnectProfile(node, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            node.updateConnectionInfo(profile);
            this.updateNode(node);
            let fileUri = this.getNodeIdentifier(node);
            if (yield this._connectionManager.connectionStore.saveProfile(profile)) {
                const res = yield this._connectionManager.connect(fileUri, profile);
                if (yield this._connectionManager.handleConnectionResult(res, fileUri, profile)) {
                    void this.refreshNode(node);
                }
            }
            else {
                this._connectionManager.vscodeWrapper.showErrorMessage(LocalizedConstants.msgPromptProfileUpdateFailed);
            }
        });
    }
    needsAccountRefresh(result, username) {
        let email = (username === null || username === void 0 ? void 0 : username.includes(" - "))
            ? username.substring(username.indexOf("-") + 2)
            : username;
        return (result.errorMessage.includes(AzureConstants.AADSTS70043) ||
            result.errorMessage.includes(AzureConstants.AADSTS50173) ||
            result.errorMessage.includes(AzureConstants.AADSTS50020) ||
            result.errorMessage.includes(AzureConstants.mdsUserAccountNotReceived) ||
            result.errorMessage.includes(Utils.formatString(AzureConstants.mdsUserAccountNotFound, email)));
    }
    getParentFromExpandParams(params) {
        for (let key of this._expandParamsToTreeNodeInfoMap.keys()) {
            if (key.sessionId === params.sessionId && key.nodePath === params.nodePath) {
                return this._expandParamsToTreeNodeInfoMap.get(key);
            }
        }
        return undefined;
    }
    /**
     * Handler for async response from SQL Tools Service.
     * Public only for testing
     */
    handleExpandSessionNotification() {
        const self = this;
        const handler = (result) => {
            var _a, _b, _c;
            if (!result) {
                return undefined;
            }
            if (result.nodes && !result.errorMessage) {
                // successfully received children from SQL Tools Service
                const credentials = self._sessionIdToConnectionProfileMap.get(result.sessionId);
                const expandParams = {
                    sessionId: result.sessionId,
                    nodePath: result.nodePath,
                };
                const parentNode = self.getParentFromExpandParams(expandParams);
                const children = result.nodes.map((node) => treeNodeInfo_1.TreeNodeInfo.fromNodeInfo(node, result.sessionId, parentNode, credentials));
                self._treeNodeToChildrenMap.set(parentNode, children);
                (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.ObjectExplorer, telemetry_2.TelemetryActions.ExpandNode, {
                    nodeType: (_b = (_a = parentNode === null || parentNode === void 0 ? void 0 : parentNode.context) === null || _a === void 0 ? void 0 : _a.subType) !== null && _b !== void 0 ? _b : "",
                    isErrored: (!!result.errorMessage).toString(),
                }, {
                    nodeCount: (_c = result === null || result === void 0 ? void 0 : result.nodes.length) !== null && _c !== void 0 ? _c : 0,
                });
                for (let key of self._expandParamsToPromiseMap.keys()) {
                    if (key.sessionId === expandParams.sessionId &&
                        key.nodePath === expandParams.nodePath) {
                        let promise = self._expandParamsToPromiseMap.get(key);
                        promise.resolve(children);
                        self._expandParamsToPromiseMap.delete(key);
                        self._expandParamsToTreeNodeInfoMap.delete(key);
                        return;
                    }
                }
            }
            else {
                // failure to expand node; display error
                if (result.errorMessage) {
                    self._connectionManager.vscodeWrapper.showErrorMessage(result.errorMessage);
                }
                const expandParams = {
                    sessionId: result.sessionId,
                    nodePath: result.nodePath,
                };
                const parentNode = self.getParentFromExpandParams(expandParams);
                const errorNode = objectExplorerUtils_1.ObjectExplorerUtils.createErrorTreeItem(result.errorMessage);
                self._treeNodeToChildrenMap.set(parentNode, [errorNode]);
                for (let key of self._expandParamsToPromiseMap.keys()) {
                    if (key.sessionId === expandParams.sessionId &&
                        key.nodePath === expandParams.nodePath) {
                        let promise = self._expandParamsToPromiseMap.get(key);
                        promise.resolve([errorNode]);
                        self._expandParamsToPromiseMap.delete(key);
                        self._expandParamsToTreeNodeInfoMap.delete(key);
                        return;
                    }
                }
            }
        };
        return handler;
    }
    expandNode(node, sessionId, promise) {
        return __awaiter(this, void 0, void 0, function* () {
            const expandParams = {
                sessionId: sessionId,
                nodePath: node.nodePath,
                filters: node.filters,
            };
            this._expandParamsToPromiseMap.set(expandParams, promise);
            this._expandParamsToTreeNodeInfoMap.set(expandParams, node);
            const response = yield this._connectionManager.client.sendRequest(expandNodeRequest_1.ExpandRequest.type, expandParams);
            if (response) {
                return response;
            }
            else {
                yield this._connectionManager.vscodeWrapper.showErrorMessage(LocalizedConstants.msgUnableToExpand);
                this._expandParamsToPromiseMap.delete(expandParams);
                this._expandParamsToTreeNodeInfoMap.delete(expandParams);
                promise.resolve(undefined);
                return undefined;
            }
        });
    }
    updateNode(node) {
        if (node instanceof connectTreeNode_1.ConnectTreeNode) {
            node = getParentNode(node);
        }
        for (let rootTreeNode of this._rootTreeNodeArray) {
            if (Utils.isSameConnectionInfo(node.connectionInfo, rootTreeNode.connectionInfo)) {
                const index = this._rootTreeNodeArray.indexOf(rootTreeNode);
                delete this._rootTreeNodeArray[index];
                this._rootTreeNodeArray[index] = node;
                return;
            }
        }
        this._rootTreeNodeArray.push(node);
    }
    /**
     * Clean all children of the node
     * @param node Node to cleanup
     */
    cleanNodeChildren(node) {
        if (this._treeNodeToChildrenMap.has(node)) {
            let stack = this._treeNodeToChildrenMap.get(node);
            while (stack.length > 0) {
                let child = stack.pop();
                if (this._treeNodeToChildrenMap.has(child)) {
                    stack.concat(this._treeNodeToChildrenMap.get(child));
                }
                this._treeNodeToChildrenMap.delete(child);
            }
            this._treeNodeToChildrenMap.delete(node);
        }
    }
    /**
     * Sort the array based on server names
     * Public only for testing purposes
     * @param array array that needs to be sorted
     */
    sortByServerName(array) {
        const sortedNodeArray = array.sort((a, b) => {
            const labelA = typeof a.label === "string" ? a.label : a.label.label;
            const labelB = typeof b.label === "string" ? b.label : b.label.label;
            return labelA.toLowerCase().localeCompare(labelB.toLowerCase());
        });
        return sortedNodeArray;
    }
    /**
     * Get nodes from saved connections
     */
    getSavedConnectionNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            let savedConnections = yield this._connectionManager.connectionStore.readAllConnections();
            for (const conn of savedConnections) {
                let nodeLabel = this.getConnectionLabel(conn);
                const connectionDetails = connectionCredentials_1.ConnectionCredentials.createConnectionDetails(conn);
                const response = yield this._connectionManager.client.sendRequest(getSessionIdRequest_1.GetSessionIdRequest.type, connectionDetails);
                this._sessionIdToNodeLabelMap.set(response.sessionId, nodeLabel);
                let node = new treeNodeInfo_1.TreeNodeInfo(nodeLabel, ObjectExplorerService.disconnectedNodeContextValue, vscode_1.TreeItemCollapsibleState.Collapsed, undefined, undefined, Constants.disconnectedServerNodeType, undefined, conn, undefined, undefined);
                result.push(node);
            }
            return result;
        });
    }
    static get disconnectedNodeContextValue() {
        return {
            type: Constants.disconnectedServerNodeType,
            filterable: false,
            hasFilters: false,
            subType: "",
        };
    }
    /**
     * Clean up expansion promises for a node
     * @param node The selected node
     */
    cleanExpansionPromise(node) {
        for (const key of this._expandParamsToPromiseMap.keys()) {
            if (key.sessionId === node.sessionId && key.nodePath === node.nodePath) {
                this._expandParamsToPromiseMap.delete(key);
                this._expandParamsToTreeNodeInfoMap.delete(key);
            }
        }
    }
    /**
     * Helper to show the Add Connection node; only displayed when there are no saved connections
     */
    getAddConnectionNode() {
        this._rootTreeNodeArray = [];
        this._objectExplorerProvider.objectExplorerExists = true;
        return [new addConnectionTreeNode_1.AddConnectionTreeNode()];
    }
    /**
     * Handles a generic OE create session failure by creating a
     * sign in node
     */
    createSignInNode(element) {
        const signInNode = new accountSignInTreeNode_1.AccountSignInTreeNode(element);
        this._treeNodeToChildrenMap.set(element, [signInNode]);
        return [signInNode];
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element) {
                this._logger.logDebug(`Getting children for node '${element.nodePath}'`);
                // set current node for very first expansion of disconnected node
                if (this._currentNode !== element) {
                    this._currentNode = element;
                }
                // get cached children
                if (this._treeNodeToChildrenMap.has(element)) {
                    return this._treeNodeToChildrenMap.get(element);
                }
                else {
                    // check if session exists
                    if (element.sessionId) {
                        // clean created session promise
                        this._sessionIdToPromiseMap.delete(element.sessionId);
                        // node expansion
                        let promise = new protocol_1.Deferred();
                        yield this.expandNode(element, element.sessionId, promise);
                        let children = yield promise;
                        if (children) {
                            // clean expand session promise
                            this.cleanExpansionPromise(element);
                            if (children.length === 0) {
                                return [objectExplorerUtils_1.ObjectExplorerUtils.createNoItemsTreeItem()];
                            }
                            return children;
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        const sessionPromise = new protocol_1.Deferred();
                        const sessionId = yield this.createSession(sessionPromise, element.connectionInfo);
                        // if the session was not created, show the sign in node
                        if (!sessionId) {
                            return this.createSignInNode(element);
                        }
                        const node = yield sessionPromise;
                        // If the session was created but the connected node was not created, show sign in node
                        if (!node) {
                            return this.createSignInNode(element);
                        }
                        else {
                            this._objectExplorerProvider.refresh(undefined);
                        }
                    }
                }
            }
            else {
                this._logger.logDebug("Getting root OE nodes");
                // retrieve saved connections first when opening object explorer for the first time
                let savedConnections = yield this._connectionManager.connectionStore.readAllConnections();
                // if there are no saved connections, show the add connection node
                if (savedConnections.length === 0) {
                    this._logger.logDebug("No saved connections found; displaying 'Add Connection' node");
                    return this.getAddConnectionNode();
                }
                // if OE doesn't exist the first time, then build the nodes off of saved connections
                if (!this._objectExplorerProvider.objectExplorerExists) {
                    // if there are actually saved connections
                    this._rootTreeNodeArray = yield this.getSavedConnectionNodes();
                    this._logger.logDebug(`No current OE; created OE root with ${this._rootTreeNodeArray.length}`);
                    this._objectExplorerProvider.objectExplorerExists = true;
                    return this.sortByServerName(this._rootTreeNodeArray);
                }
                else {
                    this._logger.logDebug(`Returning cached OE root nodes (${this._rootTreeNodeArray.length})`);
                    // otherwise returned the cached nodes
                    return this.sortByServerName(this._rootTreeNodeArray);
                }
            }
        });
    }
    /**
     * Create an OE session for the given connection credentials
     * otherwise prompt the user to select a connection to make an
     * OE out of
     * @param connectionProfile Connection Credentials for a node
     */
    createSession(promise, connectionCredentials, _context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!connectionCredentials) {
                const connectionUI = this._connectionManager.connectionUI;
                connectionCredentials = yield connectionUI.createAndSaveProfile();
                (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.ObjectExplorer, telemetry_2.TelemetryActions.CreateConnection, undefined, undefined, connectionCredentials, this._connectionManager.getServerInfo(connectionCredentials));
            }
            if (connectionCredentials) {
                const connectionProfile = connectionCredentials;
                if (!connectionProfile.id) {
                    connectionProfile.id = Utils.generateGuid();
                }
                // connection string based credential
                if (connectionProfile.connectionString) {
                    if (connectionProfile.savePassword) {
                        // look up connection string
                        let connectionString = yield this._connectionManager.connectionStore.lookupPassword(connectionProfile, true);
                        connectionProfile.connectionString = connectionString;
                    }
                }
                else {
                    if (connectionCredentials_1.ConnectionCredentials.isPasswordBasedCredential(connectionProfile)) {
                        // show password prompt if SQL Login and password isn't saved
                        let password = connectionProfile.password;
                        if (Utils.isEmpty(password)) {
                            // if password isn't saved
                            if (!connectionProfile.savePassword) {
                                // prompt for password
                                password =
                                    yield this._connectionManager.connectionUI.promptForPassword();
                                if (!password) {
                                    promise.resolve(undefined);
                                    return undefined;
                                }
                            }
                            else {
                                // look up saved password
                                password =
                                    yield this._connectionManager.connectionStore.lookupPassword(connectionProfile);
                                if (connectionProfile.authenticationType !== Constants.azureMfa) {
                                    connectionProfile.azureAccountToken = undefined;
                                }
                            }
                            connectionProfile.password = password;
                        }
                    }
                    else if (connectionProfile.authenticationType ===
                        Utils.authTypeToString(interfaces_1.AuthenticationTypes.Integrated)) {
                        connectionProfile.azureAccountToken = undefined;
                    }
                    else if (connectionProfile.authenticationType === Constants.azureMfa) {
                        let azureController = this._connectionManager.azureController;
                        let account = this._connectionManager.accountStore.getAccount(connectionProfile.accountId);
                        let needsRefresh = false;
                        if (!account) {
                            needsRefresh = true;
                        }
                        else if (azureController.isSqlAuthProviderEnabled()) {
                            connectionProfile.user = account.displayInfo.displayName;
                            connectionProfile.email = account.displayInfo.email;
                            // Update profile after updating user/email
                            yield this._connectionManager.connectionUI.saveProfile(connectionProfile);
                            if (!azureController.isAccountInCache(account)) {
                                needsRefresh = true;
                            }
                        }
                        if (!connectionProfile.azureAccountToken &&
                            (!azureController.isSqlAuthProviderEnabled() || needsRefresh)) {
                            void this.refreshAccount(account, connectionProfile);
                        }
                    }
                }
                const connectionDetails = connectionCredentials_1.ConnectionCredentials.createConnectionDetails(connectionProfile);
                const sessionIdResponse = yield this._connectionManager.client.sendRequest(getSessionIdRequest_1.GetSessionIdRequest.type, connectionDetails);
                const nodeLabel = (_a = connectionProfile.profileName) !== null && _a !== void 0 ? _a : ConnInfo.getConnectionDisplayName(connectionProfile);
                this._sessionIdToNodeLabelMap.set(sessionIdResponse.sessionId, nodeLabel);
                const response = yield this._connectionManager.client.sendRequest(createSessionRequest_1.CreateSessionRequest.type, connectionDetails);
                if (response) {
                    this._sessionIdToConnectionProfileMap.set(response.sessionId, connectionProfile);
                    this._sessionIdToPromiseMap.set(response.sessionId, promise);
                    return response.sessionId;
                }
                else {
                    this._client.logger.error("No response received for session creation request");
                }
            }
            else {
                this._client.logger.error("Connection could not be made, as credentials not available.");
                // no connection was made
                promise.resolve(undefined);
                return undefined;
            }
        });
    }
    refreshAccount(account, connectionCredentials) {
        return __awaiter(this, void 0, void 0, function* () {
            let azureController = this._connectionManager.azureController;
            let profile = new connectionProfile_1.ConnectionProfile(connectionCredentials);
            let azureAccountToken = yield azureController.refreshAccessToken(account, this._connectionManager.accountStore, connectionCredentials.tenantId, providerSettings_1.default.resources.databaseResource);
            if (!azureAccountToken) {
                this._client.logger.verbose("Access token could not be refreshed for connection profile.");
                let errorMessage = LocalizedConstants.msgAccountRefreshFailed;
                yield this._connectionManager.vscodeWrapper
                    .showErrorMessage(errorMessage, LocalizedConstants.refreshTokenLabel)
                    .then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (result === LocalizedConstants.refreshTokenLabel) {
                        let updatedProfile = yield azureController.populateAccountProperties(profile, this._connectionManager.accountStore, providerSettings_1.default.resources.databaseResource);
                        connectionCredentials.azureAccountToken = updatedProfile.azureAccountToken;
                        connectionCredentials.expiresOn = updatedProfile.expiresOn;
                    }
                    else {
                        this._client.logger.error("Credentials not refreshed by user.");
                        return undefined;
                    }
                }));
            }
            else {
                connectionCredentials.azureAccountToken = azureAccountToken.token;
                connectionCredentials.expiresOn = azureAccountToken.expiresOn;
            }
        });
    }
    getConnectionCredentials(sessionId) {
        if (this._sessionIdToConnectionProfileMap.has(sessionId)) {
            return this._sessionIdToConnectionProfileMap.get(sessionId);
        }
        return undefined;
    }
    removeObjectExplorerNode(node_1) {
        return __awaiter(this, arguments, void 0, function* (node, isDisconnect = false) {
            yield this.closeSession(node);
            const nodeUri = this.getNodeIdentifier(node);
            yield this._connectionManager.disconnect(nodeUri);
            if (!isDisconnect) {
                const index = this._rootTreeNodeArray.indexOf(node, 0);
                if (index > -1) {
                    this._rootTreeNodeArray.splice(index, 1);
                }
            }
            else {
                node.nodeType = Constants.disconnectedServerNodeType;
                node.context = ObjectExplorerService.disconnectedNodeContextValue;
                node.sessionId = undefined;
                if (!node.connectionInfo.savePassword) {
                    const profile = node.connectionInfo;
                    profile.password = "";
                    node.updateConnectionInfo(profile);
                }
                const label = typeof node.label === "string" ? node.label : node.label.label;
                // make a new node to show disconnected behavior
                let disconnectedNode = new treeNodeInfo_1.TreeNodeInfo(label, ObjectExplorerService.disconnectedNodeContextValue, node.collapsibleState, node.nodePath, node.nodeStatus, Constants.disconnectedServerNodeType, undefined, node.connectionInfo, node.parentNode, undefined);
                this.updateNode(disconnectedNode);
                this._currentNode = disconnectedNode;
                this._treeNodeToChildrenMap.set(this._currentNode, [
                    new connectTreeNode_1.ConnectTreeNode(this._currentNode),
                ]);
            }
            const connectionDetails = connectionCredentials_1.ConnectionCredentials.createConnectionDetails(node.connectionInfo);
            const sessionIdResponse = yield this._connectionManager.client.sendRequest(getSessionIdRequest_1.GetSessionIdRequest.type, connectionDetails);
            this._sessionIdToNodeLabelMap.delete(sessionIdResponse.sessionId);
            this.cleanNodeChildren(node);
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.ObjectExplorer, isDisconnect ? telemetry_2.TelemetryActions.RemoveConnection : telemetry_2.TelemetryActions.Disconnect, {
                nodeType: node.nodeType,
            }, undefined, node.connectionInfo, this._connectionManager.getServerInfo(node.connectionInfo));
        });
    }
    removeConnectionNodes(connections) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let conn of connections) {
                for (let node of this._rootTreeNodeArray) {
                    if (Utils.isSameConnectionInfo(node.connectionInfo, conn)) {
                        yield this.removeObjectExplorerNode(node);
                    }
                }
            }
        });
    }
    refreshNode(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshParams = {
                sessionId: node.sessionId,
                nodePath: node.nodePath,
                filters: node.filters,
            };
            let response = yield this._connectionManager.client.sendRequest(refreshSessionRequest_1.RefreshRequest.type, refreshParams);
            this._expandParamsToTreeNodeInfoMap.set(refreshParams, node);
            if (response) {
                this._treeNodeToChildrenMap.delete(node);
            }
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.ObjectExplorer, telemetry_2.TelemetryActions.Refresh, {
                nodeType: node.nodeType,
            }, undefined, node.connectionInfo, this._connectionManager.getServerInfo(node.connectionInfo));
            return this._objectExplorerProvider.refresh(node);
        });
    }
    signInNodeServer(node) {
        if (this._treeNodeToChildrenMap.has(node)) {
            this._treeNodeToChildrenMap.delete(node);
        }
    }
    addDisconnectedNode(connectionCredentials) {
        const label = this.getConnectionLabel(connectionCredentials);
        const node = new treeNodeInfo_1.TreeNodeInfo(label, ObjectExplorerService.disconnectedNodeContextValue, vscode.TreeItemCollapsibleState.Collapsed, undefined, undefined, Constants.disconnectedServerNodeType, undefined, connectionCredentials, undefined, undefined);
        this.updateNode(node);
    }
    /**
     * Sends a close session request
     * @param node
     */
    closeSession(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!node.sessionId) {
                return;
            }
            const closeSessionParams = {
                sessionId: node.sessionId,
            };
            const response = yield this._connectionManager.client.sendRequest(closeSessionRequest_1.CloseSessionRequest.type, closeSessionParams);
            if (response && response.success) {
                if (response.sessionId !== node.sessionId) {
                    this._client.logger.error("Session ID mismatch in closeSession() response");
                }
                this._sessionIdToConnectionProfileMap.delete(node.sessionId);
                this._sessionIdToPromiseMap.delete(node.sessionId);
                const nodeUri = this.getNodeIdentifier(node);
                yield this._connectionManager.disconnect(nodeUri);
                this.cleanNodeChildren(node);
                return;
            }
        });
    }
    getNodeIdentifier(node) {
        if (node.sessionId) {
            return node.sessionId;
        }
        else {
            this._client.logger.error("Node does not have a session ID");
            return objectExplorerUtils_1.ObjectExplorerUtils.getNodeUri(node); // TODO: can this removed entirely?  ideally, every node has a session ID associated with it
        }
    }
    deleteChildren(node) {
        if (this._treeNodeToChildrenMap.has(node)) {
            this._treeNodeToChildrenMap.delete(node);
        }
    }
    getConnectionLabel(nodeConnectionInfo) {
        return ConnInfo.getSimpleConnectionDisplayName(nodeConnectionInfo) ===
            nodeConnectionInfo.server
            ? ConnInfo.getConnectionDisplayName(nodeConnectionInfo)
            : ConnInfo.getSimpleConnectionDisplayName(nodeConnectionInfo);
    }
    //#region Getters and Setters
    get currentNode() {
        return this._currentNode;
    }
    get rootTreeNodeArray() {
        return this._rootTreeNodeArray;
    }
    get rootNodeConnections() {
        const connections = this._rootTreeNodeArray.map((node) => node.connectionInfo);
        return connections;
    }
    set currentNode(node) {
        this._currentNode = node;
    }
}
exports.ObjectExplorerService = ObjectExplorerService;

//# sourceMappingURL=objectExplorerService.js.map
