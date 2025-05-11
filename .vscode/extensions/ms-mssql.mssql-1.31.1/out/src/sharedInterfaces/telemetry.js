"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityStatus = exports.TelemetryActions = exports.TelemetryViews = void 0;
var TelemetryViews;
(function (TelemetryViews) {
    TelemetryViews["ObjectExplorer"] = "ObjectExplorer";
    TelemetryViews["CommandPalette"] = "CommandPalette";
    TelemetryViews["SqlProjects"] = "SqlProjects";
    TelemetryViews["QueryEditor"] = "QueryEditor";
    TelemetryViews["QueryResult"] = "QueryResult";
    TelemetryViews["ResultsGrid"] = "ResultsGrid";
    TelemetryViews["ConnectionPrompt"] = "ConnectionPrompt";
    TelemetryViews["WebviewController"] = "WebviewController";
    TelemetryViews["ObjectExplorerFilter"] = "ObjectExplorerFilter";
    TelemetryViews["TableDesigner"] = "TableDesigner";
    TelemetryViews["SchemaCompare"] = "SchemaCompare";
    TelemetryViews["UserSurvey"] = "UserSurvey";
    TelemetryViews["General"] = "General";
    TelemetryViews["ConnectionDialog"] = "ConnectionDialog";
    TelemetryViews["ExecutionPlan"] = "ExecutionPlan";
    TelemetryViews["AddFirewallRule"] = "AddFirewallRule";
})(TelemetryViews || (exports.TelemetryViews = TelemetryViews = {}));
var TelemetryActions;
(function (TelemetryActions) {
    TelemetryActions["Compare"] = "Compare";
    TelemetryActions["Switch"] = "Switch";
    TelemetryActions["OpenScmp"] = "OpenScmp";
    TelemetryActions["SaveScmp"] = "SaveScmp";
    TelemetryActions["OptionsChanged"] = "OptionsChanged";
    TelemetryActions["ResetOptions"] = "ResetOptions";
    TelemetryActions["Activated"] = "Activated";
    TelemetryActions["GenerateScript"] = "GenerateScript";
    TelemetryActions["Refresh"] = "Refresh";
    TelemetryActions["CreateProject"] = "CreateProject";
    TelemetryActions["RemoveConnection"] = "RemoveConnection";
    TelemetryActions["Disconnect"] = "Disconnect";
    TelemetryActions["NewQuery"] = "NewQuery";
    TelemetryActions["RunQuery"] = "RunQuery";
    TelemetryActions["QueryExecutionCompleted"] = "QueryExecutionCompleted";
    TelemetryActions["RunResultPaneAction"] = "RunResultPaneAction";
    TelemetryActions["CreateConnection"] = "CreateConnection";
    TelemetryActions["CreateConnectionResult"] = "CreateConnectionResult";
    TelemetryActions["ExpandNode"] = "ExpandNode";
    TelemetryActions["ResultPaneAction"] = "ResultPaneAction";
    TelemetryActions["Load"] = "Load";
    TelemetryActions["WebviewRequest"] = "WebviewRequest";
    TelemetryActions["Open"] = "Open";
    TelemetryActions["Submit"] = "Submit";
    TelemetryActions["Cancel"] = "Cancel";
    TelemetryActions["Initialize"] = "Initialize";
    TelemetryActions["Edit"] = "Edit";
    TelemetryActions["Publish"] = "Publish";
    TelemetryActions["ContinueEditing"] = "ContinueEditing";
    TelemetryActions["Close"] = "Close";
    TelemetryActions["SurveySubmit"] = "SurveySubmit";
    TelemetryActions["SaveResults"] = "SaveResults";
    TelemetryActions["CopyResults"] = "CopyResults";
    TelemetryActions["CopyResultsHeaders"] = "CopyResultsHeaders";
    TelemetryActions["CopyHeaders"] = "CopyHeaders";
    TelemetryActions["EnableRichExperiencesPrompt"] = "EnableRichExperiencesPrompt";
    TelemetryActions["OpenQueryResultsInTabByDefaultPrompt"] = "OpenQueryResultsInTabByDefaultPrompt";
    TelemetryActions["OpenQueryResult"] = "OpenQueryResult";
    TelemetryActions["Restore"] = "Restore";
    TelemetryActions["LoadConnection"] = "LoadConnection";
    TelemetryActions["LoadAzureServers"] = "LoadAzureServers";
    TelemetryActions["LoadConnectionProperties"] = "LoadConnectionProperties";
    TelemetryActions["LoadRecentConnections"] = "LoadRecentConnections";
    TelemetryActions["LoadAzureSubscriptions"] = "LoadAzureSubscriptions";
    TelemetryActions["OpenExecutionPlan"] = "OpenExecutionPlan";
    TelemetryActions["LoadAzureAccountsForEntraAuth"] = "LoadAzureAccountsForEntraAuth";
    TelemetryActions["LoadAzureTenantsForEntraAuth"] = "LoadAzureTenantsForEntraAuth";
    TelemetryActions["LoadConnections"] = "LoadConnections";
    TelemetryActions["AddFirewallRule"] = "AddFirewallRule";
    TelemetryActions["SubmitGithubIssue"] = "SubmitGithubIssue";
    TelemetryActions["AutoColumnSize"] = "AutoColumnSize";
    TelemetryActions["DisableLanguageServiceForNonTSqlFiles"] = "DisableLanguageServiceForNonTSqlFiles";
    TelemetryActions["LoadFromConnectionString"] = "LoadFromConnectionString";
})(TelemetryActions || (exports.TelemetryActions = TelemetryActions = {}));
/**
 * The status of an activity
 */
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["Succeeded"] = "Succeeded";
    ActivityStatus["Pending"] = "Pending";
    ActivityStatus["Failed"] = "Failed";
    ActivityStatus["Canceled"] = "Canceled";
})(ActivityStatus || (exports.ActivityStatus = ActivityStatus = {}));

//# sourceMappingURL=telemetry.js.map
