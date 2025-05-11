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
exports.getNewResultPaneViewColumn = getNewResultPaneViewColumn;
exports.registerCommonRequestHandlers = registerCommonRequestHandlers;
exports.recordLength = recordLength;
exports.messageToString = messageToString;
const Constants = require("../constants/constants");
const vscode = require("vscode");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const webview_1 = require("../sharedInterfaces/webview");
const sharedExecutionPlanUtils_1 = require("../controllers/sharedExecutionPlanUtils");
const telemetry_2 = require("../telemetry/telemetry");
const qr = require("../sharedInterfaces/queryResult");
const queryResultWebviewPanelController_1 = require("./queryResultWebviewPanelController");
const queryResultWebViewController_1 = require("./queryResultWebViewController");
const singletonStore_1 = require("./singletonStore");
function getNewResultPaneViewColumn(uri, vscodeWrapper) {
    // // Find configuration options
    let config = vscodeWrapper.getConfiguration(Constants.extensionConfigSectionName, uri);
    let splitPaneSelection = config[Constants.configSplitPaneSelection];
    let viewColumn;
    switch (splitPaneSelection) {
        case "current":
            viewColumn = vscodeWrapper.activeTextEditor.viewColumn;
            break;
        case "end":
            viewColumn = vscode.ViewColumn.Three;
            break;
        // default case where splitPaneSelection is next or anything else
        default:
            // if there's an active text editor
            if (vscodeWrapper.isEditingSqlFile) {
                viewColumn = vscodeWrapper.activeTextEditor.viewColumn;
                if (viewColumn === vscode.ViewColumn.One) {
                    viewColumn = vscode.ViewColumn.Two;
                }
                else {
                    viewColumn = vscode.ViewColumn.Three;
                }
            }
            else {
                // otherwise take default results column
                viewColumn = vscode.ViewColumn.Two;
            }
    }
    return viewColumn;
}
function registerCommonRequestHandlers(webviewController, correlationId) {
    let webviewViewController = webviewController instanceof queryResultWebViewController_1.QueryResultWebviewController
        ? webviewController
        : webviewController.getQueryResultWebviewViewController();
    webviewController.registerRequestHandler("getRows", (message) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield webviewViewController
            .getSqlOutputContentProvider()
            .rowRequestHandler(message.uri, message.batchId, message.resultId, message.rowStart, message.numberOfRows);
        let currentState = webviewViewController.getQueryResultState(message.uri);
        if (currentState.isExecutionPlan &&
            currentState.resultSetSummaries[message.batchId] &&
            // check if the current result set is the result set that contains the xml plan
            currentState.resultSetSummaries[message.batchId][message.resultId].columnInfo[0]
                .columnName === Constants.showPlanXmlColumnName) {
            currentState.executionPlanState.xmlPlans[`${message.batchId},${message.resultId}`] =
                result.rows[0][0].displayValue;
        }
        // if we are on the last result set and still don't have any xml plans
        // then we should not show the query plan. for example, this happens
        // if user runs actual plan with all print statements
        else if (
        // check that we're on the last batch
        message.batchId === recordLength(currentState.resultSetSummaries) - 1 &&
            // check that we're on the last result within the batch
            message.resultId ===
                recordLength(currentState.resultSetSummaries[message.batchId]) - 1 &&
            // check that there's we have no xml plans
            (!((_a = currentState.executionPlanState) === null || _a === void 0 ? void 0 : _a.xmlPlans) ||
                !recordLength(currentState.executionPlanState.xmlPlans))) {
            currentState.isExecutionPlan = false;
            currentState.actualPlanEnabled = false;
        }
        webviewViewController.setQueryResultState(message.uri, currentState);
        return result;
    }));
    webviewController.registerRequestHandler("setEditorSelection", (message) => __awaiter(this, void 0, void 0, function* () {
        if (!message.uri || !message.selectionData) {
            console.warn(`Invalid setEditorSelection request.  Uri: ${message.uri}; selectionData: ${JSON.stringify(message.selectionData)}`);
            return;
        }
        return yield webviewViewController
            .getSqlOutputContentProvider()
            .editorSelectionRequestHandler(message.uri, message.selectionData);
    }));
    webviewController.registerRequestHandler("saveResults", (message) => __awaiter(this, void 0, void 0, function* () {
        (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.QueryResult, telemetry_1.TelemetryActions.SaveResults, {
            correlationId: correlationId,
            format: message.format,
            selection: message.selection,
            origin: message.origin,
        });
        return yield webviewViewController
            .getSqlOutputContentProvider()
            .saveResultsRequestHandler(message.uri, message.batchId, message.resultId, message.format, message.selection);
    }));
    webviewController.registerRequestHandler("sendToClipboard", (message) => __awaiter(this, void 0, void 0, function* () {
        (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.QueryResult, telemetry_1.TelemetryActions.CopyResults, {
            correlationId: correlationId,
        });
        return webviewViewController
            .getSqlOutputContentProvider()
            .sendToClipboard(message.uri, message.data, message.batchId, message.resultId, message.selection, message.headersFlag);
    }));
    webviewController.registerRequestHandler("copySelection", (message) => __awaiter(this, void 0, void 0, function* () {
        (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.QueryResult, telemetry_1.TelemetryActions.CopyResults, {
            correlationId: correlationId,
        });
        return yield webviewViewController
            .getSqlOutputContentProvider()
            .copyRequestHandler(message.uri, message.batchId, message.resultId, message.selection, false);
    }));
    webviewController.registerRequestHandler("copyWithHeaders", (message) => __awaiter(this, void 0, void 0, function* () {
        (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.QueryResult, telemetry_1.TelemetryActions.CopyResultsHeaders, {
            correlationId: correlationId,
            format: undefined,
            selection: undefined,
            origin: undefined,
        });
        return yield webviewViewController.getSqlOutputContentProvider().copyRequestHandler(message.uri, message.batchId, message.resultId, message.selection, true);
    }));
    webviewController.registerRequestHandler("copyHeaders", (message) => __awaiter(this, void 0, void 0, function* () {
        (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.QueryResult, telemetry_1.TelemetryActions.CopyHeaders, {
            correlationId: correlationId,
        });
        return yield webviewViewController
            .getSqlOutputContentProvider()
            .copyHeadersRequestHandler(message.uri, message.batchId, message.resultId, message.selection);
    }));
    // Register request handlers for query result filters
    webviewController.registerRequestHandler("getFilters", (message) => __awaiter(this, void 0, void 0, function* () {
        return singletonStore_1.default.get(message.uri);
    }));
    webviewController.registerRequestHandler("setFilters", (message) => __awaiter(this, void 0, void 0, function* () {
        singletonStore_1.default.set(message.uri, message.filters);
        return true;
    }));
    webviewController.registerRequestHandler("deleteFilter", (message) => __awaiter(this, void 0, void 0, function* () {
        singletonStore_1.default.delete(message.uri);
        return true;
    }));
    webviewController.registerRequestHandler("setSelectionSummary", (message) => __awaiter(this, void 0, void 0, function* () {
        const controller = webviewController instanceof queryResultWebviewPanelController_1.QueryResultWebviewPanelController
            ? webviewController.getQueryResultWebviewViewController()
            : webviewController;
        controller.updateSelectionSummaryStatusItem(message.summary);
    }));
    webviewController.registerReducer("setResultTab", (state, payload) => __awaiter(this, void 0, void 0, function* () {
        state.tabStates.resultPaneTab = payload.tabId;
        return state;
    }));
    webviewController.registerReducer("getExecutionPlan", (state, payload) => __awaiter(this, void 0, void 0, function* () {
        // because this is an overridden call, this makes sure it is being
        // called properly
        if (!("uri" in payload))
            return state;
        const currentResultState = webviewViewController.getQueryResultState(payload.uri);
        // Ensure execution plan state exists and execution plan graphs have not loaded
        if (currentResultState.executionPlanState &&
            currentResultState.executionPlanState.executionPlanGraphs.length === 0 &&
            // Check for non-empty XML plans and result summaries
            recordLength(currentResultState.executionPlanState.xmlPlans) &&
            recordLength(currentResultState.resultSetSummaries) &&
            // Verify XML plans match expected number of result sets
            recordLength(currentResultState.executionPlanState.xmlPlans) ===
                webviewViewController.getNumExecutionPlanResultSets(currentResultState.resultSetSummaries, currentResultState.actualPlanEnabled)) {
            state = (yield (0, sharedExecutionPlanUtils_1.createExecutionPlanGraphs)(state, webviewViewController.getExecutionPlanService(), Object.values(currentResultState.executionPlanState.xmlPlans), "QueryResults"));
            state.executionPlanState.loadState = webview_1.ApiStatus.Loaded;
            state.tabStates.resultPaneTab = qr.QueryResultPaneTabs.ExecutionPlan;
        }
        return state;
    }));
    webviewController.registerReducer("openFileThroughLink", (state, payload) => __awaiter(this, void 0, void 0, function* () {
        // TO DO: add formatting? ADS doesn't do this, but it may be nice...
        const newDoc = yield vscode.workspace.openTextDocument({
            content: payload.content,
            language: payload.type,
        });
        void vscode.window.showTextDocument(newDoc);
        return state;
    }));
    webviewController.registerReducer("saveExecutionPlan", (state, payload) => __awaiter(this, void 0, void 0, function* () {
        return (yield (0, sharedExecutionPlanUtils_1.saveExecutionPlan)(state, payload));
    }));
    webviewController.registerReducer("showPlanXml", (state, payload) => __awaiter(this, void 0, void 0, function* () {
        return (yield (0, sharedExecutionPlanUtils_1.showPlanXml)(state, payload));
    }));
    webviewController.registerReducer("showQuery", (state, payload) => __awaiter(this, void 0, void 0, function* () {
        return (yield (0, sharedExecutionPlanUtils_1.showQuery)(state, payload, webviewViewController.getUntitledDocumentService()));
    }));
    webviewController.registerReducer("updateTotalCost", (state, payload) => __awaiter(this, void 0, void 0, function* () {
        return (yield (0, sharedExecutionPlanUtils_1.updateTotalCost)(state, payload));
    }));
}
function recordLength(record) {
    return Object.keys(record).length;
}
function messageToString(message) {
    var _a;
    if ((_a = message.link) === null || _a === void 0 ? void 0 : _a.text) {
        return `${message.message}${message.link.text}`;
    }
    return message.message;
}

//# sourceMappingURL=utils.js.map
