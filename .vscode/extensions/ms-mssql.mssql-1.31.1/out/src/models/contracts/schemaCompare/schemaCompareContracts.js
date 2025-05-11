"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaCompareCancellationRequest = exports.SchemaCompareSaveScmpRequest = exports.SchemaCompareOpenScmpRequest = exports.SchemaCompareIncludeExcludeNodeRequest = exports.SchemaCompareIncludeExcludeAllNodesRequest = exports.SchemaCompareGetDefaultOptionsRequest = exports.SchemaComparePublishProjectChangesRequest = exports.SchemaComparePublishDatabaseChangesRequest = exports.SchemaCompareGenerateScriptRequest = exports.SchemaCompareRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
var SchemaCompareRequest;
(function (SchemaCompareRequest) {
    SchemaCompareRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/compare");
})(SchemaCompareRequest || (exports.SchemaCompareRequest = SchemaCompareRequest = {}));
var SchemaCompareGenerateScriptRequest;
(function (SchemaCompareGenerateScriptRequest) {
    SchemaCompareGenerateScriptRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/generateScript");
})(SchemaCompareGenerateScriptRequest || (exports.SchemaCompareGenerateScriptRequest = SchemaCompareGenerateScriptRequest = {}));
var SchemaComparePublishDatabaseChangesRequest;
(function (SchemaComparePublishDatabaseChangesRequest) {
    SchemaComparePublishDatabaseChangesRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/publishDatabase");
})(SchemaComparePublishDatabaseChangesRequest || (exports.SchemaComparePublishDatabaseChangesRequest = SchemaComparePublishDatabaseChangesRequest = {}));
var SchemaComparePublishProjectChangesRequest;
(function (SchemaComparePublishProjectChangesRequest) {
    SchemaComparePublishProjectChangesRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/publishProject");
})(SchemaComparePublishProjectChangesRequest || (exports.SchemaComparePublishProjectChangesRequest = SchemaComparePublishProjectChangesRequest = {}));
var SchemaCompareGetDefaultOptionsRequest;
(function (SchemaCompareGetDefaultOptionsRequest) {
    SchemaCompareGetDefaultOptionsRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/getDefaultOptions");
})(SchemaCompareGetDefaultOptionsRequest || (exports.SchemaCompareGetDefaultOptionsRequest = SchemaCompareGetDefaultOptionsRequest = {}));
var SchemaCompareIncludeExcludeAllNodesRequest;
(function (SchemaCompareIncludeExcludeAllNodesRequest) {
    SchemaCompareIncludeExcludeAllNodesRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/includeExcludeAllNodes");
})(SchemaCompareIncludeExcludeAllNodesRequest || (exports.SchemaCompareIncludeExcludeAllNodesRequest = SchemaCompareIncludeExcludeAllNodesRequest = {}));
var SchemaCompareIncludeExcludeNodeRequest;
(function (SchemaCompareIncludeExcludeNodeRequest) {
    SchemaCompareIncludeExcludeNodeRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/includeExcludeNode");
})(SchemaCompareIncludeExcludeNodeRequest || (exports.SchemaCompareIncludeExcludeNodeRequest = SchemaCompareIncludeExcludeNodeRequest = {}));
var SchemaCompareOpenScmpRequest;
(function (SchemaCompareOpenScmpRequest) {
    SchemaCompareOpenScmpRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/openScmp");
})(SchemaCompareOpenScmpRequest || (exports.SchemaCompareOpenScmpRequest = SchemaCompareOpenScmpRequest = {}));
var SchemaCompareSaveScmpRequest;
(function (SchemaCompareSaveScmpRequest) {
    SchemaCompareSaveScmpRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/saveScmp");
})(SchemaCompareSaveScmpRequest || (exports.SchemaCompareSaveScmpRequest = SchemaCompareSaveScmpRequest = {}));
var SchemaCompareCancellationRequest;
(function (SchemaCompareCancellationRequest) {
    SchemaCompareCancellationRequest.type = new vscode_languageclient_1.RequestType("schemaCompare/cancel");
})(SchemaCompareCancellationRequest || (exports.SchemaCompareCancellationRequest = SchemaCompareCancellationRequest = {}));

//# sourceMappingURL=schemaCompareContracts.js.map
