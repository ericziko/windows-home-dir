"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryExecutionOptionsParams = exports.QueryExecuteOptionsRequest = exports.QueryExecuteSubsetResult = exports.ResultSetSubset = exports.DbCellValue = exports.QueryExecuteSubsetParams = exports.QueryExecuteSubsetRequest = exports.ExecutionPlanOptions = exports.QueryExecuteResult = exports.QueryExecuteStatementParams = exports.QueryExecuteParams = exports.QueryExecuteStatementRequest = exports.QueryExecuteRequest = exports.QueryExecuteMessageParams = exports.QueryExecuteMessageNotification = exports.QueryExecuteResultSetCompleteNotificationParams = exports.QueryExecuteResultSetCompleteNotification = exports.QueryExecuteBatchCompleteNotification = exports.QueryExecuteBatchStartNotification = exports.QueryExecuteBatchNotificationParams = exports.QueryExecuteCompleteNotificationResult = exports.QueryExecuteCompleteNotification = exports.BatchSummary = exports.ResultSetSummary = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
class ResultSetSummary {
}
exports.ResultSetSummary = ResultSetSummary;
class BatchSummary {
}
exports.BatchSummary = BatchSummary;
// ------------------------------- < Query Execution Complete Notification > ------------------------------------
var QueryExecuteCompleteNotification;
(function (QueryExecuteCompleteNotification) {
    QueryExecuteCompleteNotification.type = new vscode_languageclient_1.NotificationType("query/complete");
})(QueryExecuteCompleteNotification || (exports.QueryExecuteCompleteNotification = QueryExecuteCompleteNotification = {}));
class QueryExecuteCompleteNotificationResult {
}
exports.QueryExecuteCompleteNotificationResult = QueryExecuteCompleteNotificationResult;
// Query Batch Notification -----------------------------------------------------------------------
class QueryExecuteBatchNotificationParams {
}
exports.QueryExecuteBatchNotificationParams = QueryExecuteBatchNotificationParams;
// ------------------------------- < Query Batch Start  Notification > ------------------------------------
var QueryExecuteBatchStartNotification;
(function (QueryExecuteBatchStartNotification) {
    QueryExecuteBatchStartNotification.type = new vscode_languageclient_1.NotificationType("query/batchStart");
})(QueryExecuteBatchStartNotification || (exports.QueryExecuteBatchStartNotification = QueryExecuteBatchStartNotification = {}));
// ------------------------------- < Query Batch Complete Notification > ------------------------------------
var QueryExecuteBatchCompleteNotification;
(function (QueryExecuteBatchCompleteNotification) {
    QueryExecuteBatchCompleteNotification.type = new vscode_languageclient_1.NotificationType("query/batchComplete");
})(QueryExecuteBatchCompleteNotification || (exports.QueryExecuteBatchCompleteNotification = QueryExecuteBatchCompleteNotification = {}));
// Query ResultSet Complete Notification -----------------------------------------------------------
var QueryExecuteResultSetCompleteNotification;
(function (QueryExecuteResultSetCompleteNotification) {
    QueryExecuteResultSetCompleteNotification.type = new vscode_languageclient_1.NotificationType("query/resultSetComplete");
})(QueryExecuteResultSetCompleteNotification || (exports.QueryExecuteResultSetCompleteNotification = QueryExecuteResultSetCompleteNotification = {}));
class QueryExecuteResultSetCompleteNotificationParams {
}
exports.QueryExecuteResultSetCompleteNotificationParams = QueryExecuteResultSetCompleteNotificationParams;
// ------------------------------- < Query Message Notification > ------------------------------------
var QueryExecuteMessageNotification;
(function (QueryExecuteMessageNotification) {
    QueryExecuteMessageNotification.type = new vscode_languageclient_1.NotificationType("query/message");
})(QueryExecuteMessageNotification || (exports.QueryExecuteMessageNotification = QueryExecuteMessageNotification = {}));
class QueryExecuteMessageParams {
}
exports.QueryExecuteMessageParams = QueryExecuteMessageParams;
// ------------------------------- < Query Execution Request > ------------------------------------
var QueryExecuteRequest;
(function (QueryExecuteRequest) {
    QueryExecuteRequest.type = new vscode_languageclient_1.RequestType("query/executeDocumentSelection");
})(QueryExecuteRequest || (exports.QueryExecuteRequest = QueryExecuteRequest = {}));
var QueryExecuteStatementRequest;
(function (QueryExecuteStatementRequest) {
    QueryExecuteStatementRequest.type = new vscode_languageclient_1.RequestType("query/executedocumentstatement");
})(QueryExecuteStatementRequest || (exports.QueryExecuteStatementRequest = QueryExecuteStatementRequest = {}));
class QueryExecuteParams {
}
exports.QueryExecuteParams = QueryExecuteParams;
class QueryExecuteStatementParams {
}
exports.QueryExecuteStatementParams = QueryExecuteStatementParams;
class QueryExecuteResult {
}
exports.QueryExecuteResult = QueryExecuteResult;
class ExecutionPlanOptions {
}
exports.ExecutionPlanOptions = ExecutionPlanOptions;
// ------------------------------- < Query Results Request > ------------------------------------
var QueryExecuteSubsetRequest;
(function (QueryExecuteSubsetRequest) {
    QueryExecuteSubsetRequest.type = new vscode_languageclient_1.RequestType("query/subset");
})(QueryExecuteSubsetRequest || (exports.QueryExecuteSubsetRequest = QueryExecuteSubsetRequest = {}));
class QueryExecuteSubsetParams {
}
exports.QueryExecuteSubsetParams = QueryExecuteSubsetParams;
class DbCellValue {
}
exports.DbCellValue = DbCellValue;
class ResultSetSubset {
}
exports.ResultSetSubset = ResultSetSubset;
class QueryExecuteSubsetResult {
}
exports.QueryExecuteSubsetResult = QueryExecuteSubsetResult;
// ------------------------------- < Query Execution Options Request > ------------------------------------
var QueryExecuteOptionsRequest;
(function (QueryExecuteOptionsRequest) {
    QueryExecuteOptionsRequest.type = new vscode_languageclient_1.RequestType("query/setexecutionoptions");
})(QueryExecuteOptionsRequest || (exports.QueryExecuteOptionsRequest = QueryExecuteOptionsRequest = {}));
class QueryExecutionOptionsParams {
}
exports.QueryExecutionOptionsParams = QueryExecutionOptionsParams;

//# sourceMappingURL=queryExecute.js.map
