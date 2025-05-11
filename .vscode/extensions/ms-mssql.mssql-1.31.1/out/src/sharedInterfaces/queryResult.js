"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResultWebviewLocation = exports.QueryResultPaneTabs = exports.QueryResultSaveAsTrigger = exports.QueryResultLoadState = void 0;
var QueryResultLoadState;
(function (QueryResultLoadState) {
    QueryResultLoadState["Loading"] = "Loading";
    QueryResultLoadState["Loaded"] = "Loaded";
    QueryResultLoadState["Error"] = "Error";
})(QueryResultLoadState || (exports.QueryResultLoadState = QueryResultLoadState = {}));
var QueryResultSaveAsTrigger;
(function (QueryResultSaveAsTrigger) {
    QueryResultSaveAsTrigger["ContextMenu"] = "ContextMenu";
    QueryResultSaveAsTrigger["Toolbar"] = "Toolbar";
})(QueryResultSaveAsTrigger || (exports.QueryResultSaveAsTrigger = QueryResultSaveAsTrigger = {}));
var QueryResultPaneTabs;
(function (QueryResultPaneTabs) {
    QueryResultPaneTabs["Results"] = "results";
    QueryResultPaneTabs["Messages"] = "messages";
    QueryResultPaneTabs["ExecutionPlan"] = "executionPlan";
})(QueryResultPaneTabs || (exports.QueryResultPaneTabs = QueryResultPaneTabs = {}));
var QueryResultWebviewLocation;
(function (QueryResultWebviewLocation) {
    QueryResultWebviewLocation["Panel"] = "panel";
    QueryResultWebviewLocation["Document"] = "document";
})(QueryResultWebviewLocation || (exports.QueryResultWebviewLocation = QueryResultWebviewLocation = {}));

//# sourceMappingURL=queryResult.js.map
