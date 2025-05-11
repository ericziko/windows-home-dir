"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNodeInfo = void 0;
const vscode = require("vscode");
const objectExplorerUtils_1 = require("./objectExplorerUtils");
const Constants = require("../constants/constants");
class TreeNodeInfo extends vscode.TreeItem {
    constructor(label, context, collapsibleState, nodePath, nodeStatus, nodeType, sessionId, connectionInfo, parentNode, filterProperties, objectMetadata, filters) {
        var _a;
        super(label, collapsibleState);
        this._originalLabel = label;
        this.context = context;
        this._nodePath = nodePath;
        this._nodeStatus = nodeStatus;
        this._nodeType = nodeType;
        this._sessionId = sessionId;
        this._parentNode = parentNode;
        this._connectionInfo = connectionInfo;
        this._filterableProperties = filterProperties;
        this._metadata = objectMetadata;
        this._filters = filters;
        this.iconPath = objectExplorerUtils_1.ObjectExplorerUtils.iconPath(this.nodeType);
        if ((_a = this.connectionInfo) === null || _a === void 0 ? void 0 : _a.database) {
            if (this.nodeType === Constants.serverLabel) {
                this.iconPath = objectExplorerUtils_1.ObjectExplorerUtils.iconPath(Constants.database_green);
            }
            if (this.nodeType === Constants.disconnectedServerNodeType) {
                this.iconPath = objectExplorerUtils_1.ObjectExplorerUtils.iconPath(Constants.database_red);
            }
        }
    }
    static fromNodeInfo(nodeInfo, sessionId, parentNode, connectionInfo, label, nodeType) {
        var _a;
        let type = nodeType ? nodeType : nodeInfo.nodeType;
        const treeNodeInfo = new TreeNodeInfo(label ? label : nodeInfo.label, {
            type: type,
            filterable: ((_a = nodeInfo.filterableProperties) === null || _a === void 0 ? void 0 : _a.length) > 0,
            hasFilters: false,
            subType: nodeInfo.objectType,
        }, nodeInfo.isLeaf
            ? vscode.TreeItemCollapsibleState.None
            : type === Constants.serverLabel
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.Collapsed, nodeInfo.nodePath, nodeInfo.nodeStatus, type, sessionId, connectionInfo, parentNode, nodeInfo.filterableProperties, nodeInfo.metadata);
        return treeNodeInfo;
    }
    /** Getters */
    get nodePath() {
        return this._nodePath;
    }
    get nodeStatus() {
        return this._nodeStatus;
    }
    get nodeType() {
        return this._nodeType;
    }
    get sessionId() {
        return this._sessionId;
    }
    get nodeSubType() {
        return this._nodeSubType;
    }
    get isLeaf() {
        return this._isLeaf;
    }
    get errorMessage() {
        return this._errorMessage;
    }
    get parentNode() {
        return this._parentNode;
    }
    /**
     * Returns a **copy** of the node's connection information.
     *
     * ⚠️ Note: This is a **shallow copy**—modifying the returned object will NOT affect the original connection info.
     * If you want to update the actual connection info stored in the node, use the `updateConnectionInfo` method instead.
     */
    get connectionInfo() {
        if (!this._connectionInfo) {
            return undefined;
        }
        return Object.assign({}, this._connectionInfo);
    }
    get metadata() {
        return this._metadata;
    }
    get filterableProperties() {
        return this._filterableProperties;
    }
    get context() {
        return this._convertToTreeNodeContext(this.contextValue);
    }
    get filters() {
        return this._filters;
    }
    /** Setters */
    set nodePath(value) {
        this._nodePath = value;
    }
    set nodeStatus(value) {
        this._nodeStatus = value;
    }
    set nodeType(value) {
        this._nodeType = value;
        this._updateContextValue();
    }
    set nodeSubType(value) {
        this._nodeSubType = value;
    }
    set isLeaf(value) {
        this._isLeaf = value;
    }
    set errorMessage(value) {
        this._errorMessage = value;
    }
    set sessionId(value) {
        this._sessionId = value;
    }
    set parentNode(value) {
        this._parentNode = value;
    }
    set filterableProperties(value) {
        this._filterableProperties = value;
        this._updateContextValue();
    }
    set filters(value) {
        this._filters = value;
        this._updateContextValue();
        this.label =
            value.length > 0
                ? vscode.l10n.t("{0} (filtered)", this._originalLabel)
                : this._originalLabel;
    }
    set context(value) {
        this.contextValue = this._convertToContextValue(value);
    }
    updateConnectionInfo(value) {
        this._connectionInfo = value;
    }
    _updateContextValue() {
        var _a, _b;
        const contextValue = this.context;
        contextValue.filterable = ((_a = this.filterableProperties) === null || _a === void 0 ? void 0 : _a.length) > 0;
        contextValue.hasFilters = ((_b = this.filters) === null || _b === void 0 ? void 0 : _b.length) > 0;
        this.context = contextValue;
    }
    //split the context value with, and is in the form of key=value and convert it to TreeNodeContextValue
    _convertToTreeNodeContext(contextValue) {
        let contextArray = contextValue.split(",");
        let context = {
            filterable: false,
            hasFilters: false,
            type: undefined,
            subType: undefined,
        };
        contextArray.forEach((element) => {
            let keyValuePair = element.split("=");
            context[keyValuePair[0]] = keyValuePair[1];
        });
        return context;
    }
    //convert TreeNodeContextValue to context value string
    _convertToContextValue(context) {
        if (context === undefined) {
            return "";
        }
        let contextValue = "";
        Object.keys(context).forEach((key) => {
            contextValue += key + "=" + context[key] + ",";
        });
        return contextValue;
    }
}
exports.TreeNodeInfo = TreeNodeInfo;

//# sourceMappingURL=treeNodeInfo.js.map
