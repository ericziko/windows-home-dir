"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisposeTableDesignerRequest = exports.TableDesignerGenerateChangePreviewReportRequest = exports.TableDesignerGenerateScriptRequest = exports.PublishTableDesignerChangesRequest = exports.ProcessTableDesignerEditRequest = exports.InitializeTableDesignerRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
var InitializeTableDesignerRequest;
(function (InitializeTableDesignerRequest) {
    InitializeTableDesignerRequest.type = new vscode_languageclient_1.RequestType("tabledesigner/initialize");
})(InitializeTableDesignerRequest || (exports.InitializeTableDesignerRequest = InitializeTableDesignerRequest = {}));
var ProcessTableDesignerEditRequest;
(function (ProcessTableDesignerEditRequest) {
    ProcessTableDesignerEditRequest.type = new vscode_languageclient_1.RequestType("tabledesigner/processedit");
})(ProcessTableDesignerEditRequest || (exports.ProcessTableDesignerEditRequest = ProcessTableDesignerEditRequest = {}));
var PublishTableDesignerChangesRequest;
(function (PublishTableDesignerChangesRequest) {
    PublishTableDesignerChangesRequest.type = new vscode_languageclient_1.RequestType("tabledesigner/publish");
})(PublishTableDesignerChangesRequest || (exports.PublishTableDesignerChangesRequest = PublishTableDesignerChangesRequest = {}));
var TableDesignerGenerateScriptRequest;
(function (TableDesignerGenerateScriptRequest) {
    TableDesignerGenerateScriptRequest.type = new vscode_languageclient_1.RequestType("tabledesigner/script");
})(TableDesignerGenerateScriptRequest || (exports.TableDesignerGenerateScriptRequest = TableDesignerGenerateScriptRequest = {}));
var TableDesignerGenerateChangePreviewReportRequest;
(function (TableDesignerGenerateChangePreviewReportRequest) {
    TableDesignerGenerateChangePreviewReportRequest.type = new vscode_languageclient_1.RequestType("tabledesigner/generatepreviewreport");
})(TableDesignerGenerateChangePreviewReportRequest || (exports.TableDesignerGenerateChangePreviewReportRequest = TableDesignerGenerateChangePreviewReportRequest = {}));
var DisposeTableDesignerRequest;
(function (DisposeTableDesignerRequest) {
    DisposeTableDesignerRequest.type = new vscode_languageclient_1.RequestType("tabledesigner/dispose");
})(DisposeTableDesignerRequest || (exports.DisposeTableDesignerRequest = DisposeTableDesignerRequest = {}));

//# sourceMappingURL=tableDesigner.js.map
