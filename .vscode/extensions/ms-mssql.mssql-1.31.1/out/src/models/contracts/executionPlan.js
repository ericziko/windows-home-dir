"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPlanComparisonRequest = exports.GetExecutionPlanRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
var GetExecutionPlanRequest;
(function (GetExecutionPlanRequest) {
    GetExecutionPlanRequest.type = new vscode_languageclient_1.RequestType("queryExecutionPlan/getExecutionPlan");
})(GetExecutionPlanRequest || (exports.GetExecutionPlanRequest = GetExecutionPlanRequest = {}));
var ExecutionPlanComparisonRequest;
(function (ExecutionPlanComparisonRequest) {
    ExecutionPlanComparisonRequest.type = new vscode_languageclient_1.RequestType("queryExecutionPlan/compareExecutionPlanGraph");
})(ExecutionPlanComparisonRequest || (exports.ExecutionPlanComparisonRequest = ExecutionPlanComparisonRequest = {}));

//# sourceMappingURL=executionPlan.js.map
