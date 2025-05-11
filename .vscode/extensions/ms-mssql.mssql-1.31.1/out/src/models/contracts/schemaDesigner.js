"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaDesignerRequests = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
var SchemaDesignerRequests;
(function (SchemaDesignerRequests) {
    let CreateSession;
    (function (CreateSession) {
        CreateSession.type = new vscode_languageclient_1.RequestType("schemaDesigner/createSession");
    })(CreateSession = SchemaDesignerRequests.CreateSession || (SchemaDesignerRequests.CreateSession = {}));
    let DisposeSession;
    (function (DisposeSession) {
        DisposeSession.type = new vscode_languageclient_1.RequestType("schemaDesigner/disposeSession");
    })(DisposeSession = SchemaDesignerRequests.DisposeSession || (SchemaDesignerRequests.DisposeSession = {}));
    let GenerateScript;
    (function (GenerateScript) {
        GenerateScript.type = new vscode_languageclient_1.RequestType("schemaDesigner/generateScript");
    })(GenerateScript = SchemaDesignerRequests.GenerateScript || (SchemaDesignerRequests.GenerateScript = {}));
    let SchemaReady;
    (function (SchemaReady) {
        SchemaReady.type = new vscode_languageclient_1.NotificationType("schemaDesigner/schemaReady");
    })(SchemaReady = SchemaDesignerRequests.SchemaReady || (SchemaDesignerRequests.SchemaReady = {}));
    let GetReport;
    (function (GetReport) {
        GetReport.type = new vscode_languageclient_1.RequestType("schemaDesigner/getReport");
    })(GetReport = SchemaDesignerRequests.GetReport || (SchemaDesignerRequests.GetReport = {}));
    let PublishSession;
    (function (PublishSession) {
        PublishSession.type = new vscode_languageclient_1.RequestType("schemaDesigner/publishSession");
    })(PublishSession = SchemaDesignerRequests.PublishSession || (SchemaDesignerRequests.PublishSession = {}));
})(SchemaDesignerRequests || (exports.SchemaDesignerRequests = SchemaDesignerRequests = {}));

//# sourceMappingURL=schemaDesigner.js.map
