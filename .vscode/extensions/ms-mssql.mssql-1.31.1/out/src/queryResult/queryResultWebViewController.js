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
exports.QueryResultWebviewController = void 0;
const vscode = require("vscode");
const qr = require("../sharedInterfaces/queryResult");
const Constants = require("../constants/constants");
const LocalizedConstants = require("../constants/locConstants");
const reactWebviewViewController_1 = require("../controllers/reactWebviewViewController");
const telemetry_1 = require("../telemetry/telemetry");
const telemetry_2 = require("../sharedInterfaces/telemetry");
const crypto_1 = require("crypto");
const webview_1 = require("../sharedInterfaces/webview");
const queryResultWebviewPanelController_1 = require("./queryResultWebviewPanelController");
const utils_1 = require("./utils");
const locConstants_1 = require("../constants/locConstants");
class QueryResultWebviewController extends reactWebviewViewController_1.ReactWebviewViewController {
    constructor(context, vscodeWrapper, executionPlanService, untitledSqlDocumentService) {
        super(context, vscodeWrapper, "queryResult", "queryResult", {
            resultSetSummaries: {},
            messages: [],
            tabStates: {
                resultPaneTab: qr.QueryResultPaneTabs.Messages,
            },
            executionPlanState: {},
            fontSettings: {},
        });
        this.executionPlanService = executionPlanService;
        this.untitledSqlDocumentService = untitledSqlDocumentService;
        this._queryResultStateMap = new Map();
        this._queryResultWebviewPanelControllerMap = new Map();
        this._correlationId = (0, crypto_1.randomUUID)();
        this._selectionSummaryStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 2);
        this.actualPlanStatuses = [];
        void this.initialize();
        if (this.isRichExperiencesEnabled) {
            vscode.window.onDidChangeActiveTextEditor((editor) => {
                var _a, _b;
                const uri = (_b = (_a = editor === null || editor === void 0 ? void 0 : editor.document) === null || _a === void 0 ? void 0 : _a.uri) === null || _b === void 0 ? void 0 : _b.toString(true);
                if (uri && this._queryResultStateMap.has(uri)) {
                    this.state = this.getQueryResultState(uri);
                }
                else {
                    this.state = {
                        resultSetSummaries: {},
                        messages: [],
                        tabStates: undefined,
                        isExecutionPlan: false,
                        executionPlanState: {},
                        fontSettings: {
                            fontSize: this.getFontSizeConfig(),
                            fontFamily: this.getFontFamilyConfig(),
                        },
                        autoSizeColumns: this.getAutoSizeColumnsConfig(),
                    };
                }
            });
            // not the best api but it's the best we can do in VSCode
            this.vscodeWrapper.onDidOpenTextDocument((document) => {
                const uri = document.uri.toString(true);
                if (this._queryResultStateMap.has(uri)) {
                    this._queryResultStateMap.delete(uri);
                }
            });
            this.vscodeWrapper.onDidChangeConfiguration((e) => {
                var _a;
                if (e.affectsConfiguration("mssql.resultsFontFamily")) {
                    for (const [uri, state] of this._queryResultStateMap) {
                        state.fontSettings.fontFamily = this.vscodeWrapper
                            .getConfiguration(Constants.extensionName)
                            .get(Constants.extConfigResultKeys.ResultsFontFamily);
                        this._queryResultStateMap.set(uri, state);
                    }
                }
                if (e.affectsConfiguration("mssql.resultsFontSize")) {
                    for (const [uri, state] of this._queryResultStateMap) {
                        state.fontSettings.fontSize =
                            (_a = this.vscodeWrapper
                                .getConfiguration(Constants.extensionName)
                                .get(Constants.extConfigResultKeys.ResultsFontSize)) !== null && _a !== void 0 ? _a : this.vscodeWrapper
                                .getConfiguration("editor")
                                .get("fontSize");
                        this._queryResultStateMap.set(uri, state);
                    }
                }
                if (e.affectsConfiguration("mssql.resultsGrid.autoSizeColumns")) {
                    for (const [uri, state] of this._queryResultStateMap) {
                        state.autoSizeColumns = this.getAutoSizeColumnsConfig();
                        this._queryResultStateMap.set(uri, state);
                    }
                }
            });
        }
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerRpcHandlers();
        });
    }
    get isRichExperiencesEnabled() {
        return this.vscodeWrapper.getConfiguration().get(Constants.configEnableRichExperiences);
    }
    get isOpenQueryResultsInTabByDefaultEnabled() {
        return this.vscodeWrapper
            .getConfiguration()
            .get(Constants.configOpenQueryResultsInTabByDefault);
    }
    get isDefaultQueryResultToDocumentDoNotShowPromptEnabled() {
        return this.vscodeWrapper
            .getConfiguration()
            .get(Constants.configOpenQueryResultsInTabByDefaultDoNotShowPrompt);
    }
    get shouldShowDefaultQueryResultToDocumentPrompt() {
        return (!this.isOpenQueryResultsInTabByDefaultEnabled &&
            !this.isDefaultQueryResultToDocumentDoNotShowPromptEnabled);
    }
    registerRpcHandlers() {
        this.registerRequestHandler("openInNewTab", (message) => __awaiter(this, void 0, void 0, function* () {
            void this.createPanelController(message.uri);
            if (this.shouldShowDefaultQueryResultToDocumentPrompt) {
                const response = yield this.vscodeWrapper.showInformationMessage(LocalizedConstants.openQueryResultsInTabByDefaultPrompt, LocalizedConstants.alwaysShowInNewTab, LocalizedConstants.keepInQueryPane);
                let telemResponse;
                switch (response) {
                    case LocalizedConstants.alwaysShowInNewTab:
                        telemResponse = "alwaysShowInNewTab";
                        break;
                    case LocalizedConstants.keepInQueryPane:
                        telemResponse = "keepInQueryPane";
                        break;
                    default:
                        telemResponse = "dismissed";
                }
                (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.General, telemetry_2.TelemetryActions.OpenQueryResultsInTabByDefaultPrompt, {
                    response: telemResponse,
                });
                if (response === LocalizedConstants.alwaysShowInNewTab) {
                    yield this.vscodeWrapper
                        .getConfiguration()
                        .update(Constants.configOpenQueryResultsInTabByDefault, true, vscode.ConfigurationTarget.Global);
                }
                // show the prompt only once
                yield this.vscodeWrapper
                    .getConfiguration()
                    .update(Constants.configOpenQueryResultsInTabByDefaultDoNotShowPrompt, true, vscode.ConfigurationTarget.Global);
            }
        }));
        this.registerRequestHandler("getWebviewLocation", () => __awaiter(this, void 0, void 0, function* () {
            return qr.QueryResultWebviewLocation.Panel;
        }));
        (0, utils_1.registerCommonRequestHandlers)(this, this._correlationId);
    }
    createPanelController(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewColumn = (0, utils_1.getNewResultPaneViewColumn)(uri, this.vscodeWrapper);
            if (this._queryResultWebviewPanelControllerMap.has(uri)) {
                this._queryResultWebviewPanelControllerMap.get(uri).revealToForeground();
                return;
            }
            const controller = new queryResultWebviewPanelController_1.QueryResultWebviewPanelController(this._context, this.vscodeWrapper, viewColumn, uri, this._queryResultStateMap.get(uri).title, this);
            controller.state = this.getQueryResultState(uri);
            controller.revealToForeground();
            this._queryResultWebviewPanelControllerMap.set(uri, controller);
            if (this.isVisible()) {
                yield vscode.commands.executeCommand("workbench.action.togglePanel");
            }
        });
    }
    addQueryResultState(uri, title, isExecutionPlan, actualPlanEnabled) {
        let currentState = Object.assign(Object.assign({ resultSetSummaries: {}, messages: [], tabStates: {
                resultPaneTab: qr.QueryResultPaneTabs.Messages,
            }, uri: uri, title: title, isExecutionPlan: isExecutionPlan, actualPlanEnabled: actualPlanEnabled }, (isExecutionPlan && {
            executionPlanState: {
                loadState: webview_1.ApiStatus.Loading,
                executionPlanGraphs: [],
                totalCost: 0,
                xmlPlans: {},
            },
        })), { fontSettings: {
                fontSize: this.getFontSizeConfig(),
                fontFamily: this.getFontFamilyConfig(),
            }, autoSizeColumns: this.getAutoSizeColumnsConfig() });
        this._queryResultStateMap.set(uri, currentState);
    }
    getAutoSizeColumnsConfig() {
        return this.vscodeWrapper
            .getConfiguration(Constants.extensionName)
            .get(Constants.configAutoColumnSizing);
    }
    getFontSizeConfig() {
        var _a;
        return ((_a = this.vscodeWrapper
            .getConfiguration(Constants.extensionName)
            .get(Constants.extConfigResultKeys.ResultsFontSize)) !== null && _a !== void 0 ? _a : this.vscodeWrapper.getConfiguration("editor").get("fontSize"));
    }
    getFontFamilyConfig() {
        return this.vscodeWrapper
            .getConfiguration(Constants.extensionName)
            .get(Constants.extConfigResultKeys.ResultsFontFamily);
    }
    setQueryResultState(uri, state) {
        this._queryResultStateMap.set(uri, state);
    }
    updatePanelState(uri) {
        if (this._queryResultWebviewPanelControllerMap.has(uri)) {
            this._queryResultWebviewPanelControllerMap
                .get(uri)
                .updateState(this.getQueryResultState(uri));
            this._queryResultWebviewPanelControllerMap.get(uri).revealToForeground();
        }
    }
    removePanel(uri) {
        if (this._queryResultWebviewPanelControllerMap.has(uri)) {
            this._queryResultWebviewPanelControllerMap.delete(uri);
        }
    }
    hasPanel(uri) {
        return this._queryResultWebviewPanelControllerMap.has(uri);
    }
    getQueryResultState(uri) {
        var res = this._queryResultStateMap.get(uri);
        if (!res) {
            // This should never happen
            throw new Error(`No query result state found for uri ${uri}`);
        }
        return res;
    }
    addResultSetSummary(uri, resultSetSummary) {
        let state = this.getQueryResultState(uri);
        const batchId = resultSetSummary.batchId;
        const resultId = resultSetSummary.id;
        if (!state.resultSetSummaries[batchId]) {
            state.resultSetSummaries[batchId] = {};
        }
        state.resultSetSummaries[batchId][resultId] = resultSetSummary;
    }
    setSqlOutputContentProvider(provider) {
        this._sqlOutputContentProvider = provider;
    }
    getSqlOutputContentProvider() {
        return this._sqlOutputContentProvider;
    }
    setExecutionPlanService(service) {
        this.executionPlanService = service;
    }
    getExecutionPlanService() {
        return this.executionPlanService;
    }
    setUntitledDocumentService(service) {
        this.untitledSqlDocumentService = service;
    }
    getUntitledDocumentService() {
        return this.untitledSqlDocumentService;
    }
    copyAllMessagesToClipboard(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const messages = uri
                ? (_b = (_a = this.getQueryResultState(uri)) === null || _a === void 0 ? void 0 : _a.messages) === null || _b === void 0 ? void 0 : _b.map((message) => (0, utils_1.messageToString)(message))
                : (_d = (_c = this.state) === null || _c === void 0 ? void 0 : _c.messages) === null || _d === void 0 ? void 0 : _d.map((message) => (0, utils_1.messageToString)(message));
            if (!messages) {
                return;
            }
            const messageText = messages.join("\n");
            yield this.vscodeWrapper.clipboardWriteText(messageText);
        });
    }
    getNumExecutionPlanResultSets(resultSetSummaries, actualPlanEnabled) {
        const summariesLength = (0, utils_1.recordLength)(resultSetSummaries);
        if (!actualPlanEnabled) {
            return summariesLength;
        }
        // count the amount of xml showplans in the result summaries
        let total = 0;
        Object.values(resultSetSummaries).forEach((batch) => {
            Object.values(batch).forEach((result) => {
                // Check if any column in columnInfo has the specific column name
                if (result.columnInfo[0].columnName === Constants.showPlanXmlColumnName) {
                    total++;
                }
            });
        });
        return total;
    }
    updateSelectionSummaryStatusItem(selectionSummary) {
        if (selectionSummary.removeSelectionStats) {
            this._selectionSummaryStatusBarItem.text = "";
            this._selectionSummaryStatusBarItem.hide();
        }
        else {
            // the selection is numeric
            if (selectionSummary.average) {
                this._selectionSummaryStatusBarItem.text = locConstants_1.QueryResult.numericSelectionSummary(selectionSummary.average, selectionSummary.count, selectionSummary.sum);
                this._selectionSummaryStatusBarItem.tooltip =
                    locConstants_1.QueryResult.numericSelectionSummaryTooltip(selectionSummary.average, selectionSummary.count, selectionSummary.distinctCount, selectionSummary.max, selectionSummary.min, selectionSummary.nullCount, selectionSummary.sum);
            }
            else {
                this._selectionSummaryStatusBarItem.text = locConstants_1.QueryResult.nonNumericSelectionSummary(selectionSummary.count, selectionSummary.distinctCount, selectionSummary.nullCount);
                this._selectionSummaryStatusBarItem.tooltip =
                    this._selectionSummaryStatusBarItem.text;
            }
            this._selectionSummaryStatusBarItem.show();
        }
    }
}
exports.QueryResultWebviewController = QueryResultWebviewController;

//# sourceMappingURL=queryResultWebViewController.js.map
