"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavePublishProfileRequest = exports.ValidateStreamingJobRequest = exports.GetOptionsFromProfileRequest = exports.GenerateDeployPlanRequest = exports.GenerateDeployScriptRequest = exports.DeployRequest = exports.ExtractRequest = exports.ImportRequest = exports.ExportRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
var ExportRequest;
(function (ExportRequest) {
    ExportRequest.type = new vscode_languageclient_1.RequestType("dacfx/export");
})(ExportRequest || (exports.ExportRequest = ExportRequest = {}));
var ImportRequest;
(function (ImportRequest) {
    ImportRequest.type = new vscode_languageclient_1.RequestType("dacfx/import");
})(ImportRequest || (exports.ImportRequest = ImportRequest = {}));
var ExtractRequest;
(function (ExtractRequest) {
    ExtractRequest.type = new vscode_languageclient_1.RequestType("dacfx/extract");
})(ExtractRequest || (exports.ExtractRequest = ExtractRequest = {}));
var DeployRequest;
(function (DeployRequest) {
    DeployRequest.type = new vscode_languageclient_1.RequestType("dacfx/deploy");
})(DeployRequest || (exports.DeployRequest = DeployRequest = {}));
var GenerateDeployScriptRequest;
(function (GenerateDeployScriptRequest) {
    GenerateDeployScriptRequest.type = new vscode_languageclient_1.RequestType("dacfx/generateDeploymentScript");
})(GenerateDeployScriptRequest || (exports.GenerateDeployScriptRequest = GenerateDeployScriptRequest = {}));
var GenerateDeployPlanRequest;
(function (GenerateDeployPlanRequest) {
    GenerateDeployPlanRequest.type = new vscode_languageclient_1.RequestType("dacfx/generateDeployPlan");
})(GenerateDeployPlanRequest || (exports.GenerateDeployPlanRequest = GenerateDeployPlanRequest = {}));
var GetOptionsFromProfileRequest;
(function (GetOptionsFromProfileRequest) {
    GetOptionsFromProfileRequest.type = new vscode_languageclient_1.RequestType("dacfx/getOptionsFromProfile");
})(GetOptionsFromProfileRequest || (exports.GetOptionsFromProfileRequest = GetOptionsFromProfileRequest = {}));
var ValidateStreamingJobRequest;
(function (ValidateStreamingJobRequest) {
    ValidateStreamingJobRequest.type = new vscode_languageclient_1.RequestType("dacfx/validateStreamingJob");
})(ValidateStreamingJobRequest || (exports.ValidateStreamingJobRequest = ValidateStreamingJobRequest = {}));
var SavePublishProfileRequest;
(function (SavePublishProfileRequest) {
    SavePublishProfileRequest.type = new vscode_languageclient_1.RequestType("dacfx/savePublishProfile");
})(SavePublishProfileRequest || (exports.SavePublishProfileRequest = SavePublishProfileRequest = {}));

//# sourceMappingURL=dacFxContracts.js.map
