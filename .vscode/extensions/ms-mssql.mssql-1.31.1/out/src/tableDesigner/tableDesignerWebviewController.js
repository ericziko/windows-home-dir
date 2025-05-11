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
exports.TableDesignerWebviewController = void 0;
const vscode = require("vscode");
const crypto_1 = require("crypto");
const reactWebviewPanelController_1 = require("../controllers/reactWebviewPanelController");
const designer = require("../sharedInterfaces/tableDesigner");
const tableDesignerTabDefinition_1 = require("./tableDesignerTabDefinition");
const telemetry_1 = require("../telemetry/telemetry");
const telemetry_2 = require("../sharedInterfaces/telemetry");
const locConstants_1 = require("../constants/locConstants");
const userSurvey_1 = require("../nps/userSurvey");
const utils_1 = require("../utils/utils");
class TableDesignerWebviewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, _tableDesignerService, _connectionManager, _untitledSqlDocumentService, _targetNode, _objectExplorerProvider, _objectExplorerTree) {
        super(context, vscodeWrapper, "tableDesigner", "tableDesigner", {
            apiState: {
                editState: designer.LoadState.NotStarted,
                generateScriptState: designer.LoadState.NotStarted,
                previewState: designer.LoadState.NotStarted,
                publishState: designer.LoadState.NotStarted,
                initializeState: designer.LoadState.Loading,
            },
        }, {
            title: "Table Designer",
            viewColumn: vscode.ViewColumn.Active,
            iconPath: {
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "tableDesignerEditor_dark.svg"),
                light: vscode.Uri.joinPath(context.extensionUri, "media", "tableDesignerEditor_light.svg"),
            },
            showRestorePromptAfterClose: false,
        });
        this._tableDesignerService = _tableDesignerService;
        this._connectionManager = _connectionManager;
        this._untitledSqlDocumentService = _untitledSqlDocumentService;
        this._targetNode = _targetNode;
        this._objectExplorerProvider = _objectExplorerProvider;
        this._objectExplorerTree = _objectExplorerTree;
        this._isEdit = false;
        this._correlationId = (0, crypto_1.randomUUID)();
        void this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._targetNode) {
                yield vscode.window.showErrorMessage("Unable to find object explorer node");
                return;
            }
            this._isEdit =
                this._targetNode.nodeType === "Table" || this._targetNode.nodeType === "View"
                    ? true
                    : false;
            this.showRestorePromptAfterClose = !this._isEdit; // Show restore prompt only for new table creation.
            const targetDatabase = this.getDatabaseNameForNode(this._targetNode);
            // get database name from connection string
            const databaseName = targetDatabase ? targetDatabase : "master";
            // clone connection info and set database name
            const connectionInfo = this._targetNode.connectionInfo;
            connectionInfo.database = databaseName;
            let connectionString;
            try {
                const connectionDetails = yield this._connectionManager.createConnectionDetails(connectionInfo);
                connectionString = yield this._connectionManager.getConnectionString(connectionDetails, true, true);
                if (!connectionString || connectionString === "") {
                    yield vscode.window.showErrorMessage("Unable to find connection string for the connection");
                    return;
                }
            }
            catch (e) {
                yield vscode.window.showErrorMessage("Unable to find connection string for the connection: " + (0, utils_1.getErrorMessage)(e));
                return;
            }
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.Initialize, this._correlationId, {
                correlationId: this._correlationId,
                isEdit: this._isEdit.toString(),
            });
            yield this._connectionManager.confirmEntraTokenValidity(connectionInfo);
            try {
                let tableInfo;
                if (this._isEdit) {
                    tableInfo = {
                        id: (0, crypto_1.randomUUID)(),
                        isNewTable: false,
                        title: this._targetNode.label,
                        tooltip: `${connectionInfo.server} - ${databaseName} - ${this._targetNode.label}`,
                        server: connectionInfo.server,
                        database: databaseName,
                        connectionString: connectionString,
                        accessToken: connectionInfo.azureAccountToken
                            ? connectionInfo.azureAccountToken
                            : undefined,
                        schema: this._targetNode.metadata.schema,
                        name: this._targetNode.metadata.name,
                    };
                }
                else {
                    tableInfo = {
                        id: (0, crypto_1.randomUUID)(),
                        isNewTable: true,
                        title: "New Table",
                        tooltip: `${connectionInfo.server} - ${databaseName} - New Table`,
                        server: connectionInfo.server,
                        database: databaseName,
                        accessToken: connectionInfo.azureAccountToken
                            ? connectionInfo.azureAccountToken
                            : undefined,
                        connectionString: connectionString,
                    };
                }
                this.panel.title = tableInfo.title;
                const initializeResult = yield this._tableDesignerService.initializeTableDesigner(tableInfo);
                endActivity.end(telemetry_2.ActivityStatus.Succeeded);
                initializeResult.tableInfo.database = databaseName !== null && databaseName !== void 0 ? databaseName : "master";
                this.state = {
                    tableInfo: tableInfo,
                    view: (0, tableDesignerTabDefinition_1.getDesignerView)(initializeResult.view),
                    model: initializeResult.viewModel,
                    issues: initializeResult.issues,
                    isValid: true,
                    tabStates: {
                        mainPaneTab: designer.DesignerMainPaneTabs.Columns,
                        resultPaneTab: designer.DesignerResultPaneTabs.Script,
                    },
                    apiState: Object.assign(Object.assign({}, this.state.apiState), { initializeState: designer.LoadState.Loaded }),
                };
            }
            catch (e) {
                endActivity.endFailed(e, false);
                this.state.apiState.initializeState = designer.LoadState.Error;
                this.state = this.state;
            }
            this.registerRpcHandlers();
        });
    }
    getDatabaseNameForNode(node) {
        var _a;
        if (((_a = node.metadata) === null || _a === void 0 ? void 0 : _a.metadataTypeName) === "Database") {
            return node.metadata.name;
        }
        else {
            if (node.parentNode) {
                return this.getDatabaseNameForNode(node.parentNode);
            }
        }
        return "";
    }
    dispose() {
        this._tableDesignerService.disposeTableDesigner(this.state.tableInfo);
        super.dispose();
        (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.Close, {
            correlationId: this._correlationId,
        });
    }
    registerRpcHandlers() {
        this.registerReducer("processTableEdit", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const editResponse = yield this._tableDesignerService.processTableEdit(payload.table, payload.tableChangeInfo);
                (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.Edit, {
                    type: payload.tableChangeInfo.type.toString(),
                    source: payload.tableChangeInfo.source,
                    correlationId: this._correlationId,
                });
                if (((_a = editResponse.issues) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                    state.tabStates.resultPaneTab = designer.DesignerResultPaneTabs.Script;
                }
                else {
                    state.tabStates.resultPaneTab = designer.DesignerResultPaneTabs.Issues;
                }
                this.showRestorePromptAfterClose = true;
                const afterEditState = Object.assign(Object.assign({}, state), { view: editResponse.view ? (0, tableDesignerTabDefinition_1.getDesignerView)(editResponse.view) : state.view, model: editResponse.viewModel, issues: editResponse.issues, isValid: editResponse.isValid, apiState: Object.assign(Object.assign({}, state.apiState), { editState: designer.LoadState.Loaded }) });
                return afterEditState;
            }
            catch (e) {
                vscode.window.showErrorMessage(e.message);
                return state;
            }
        }));
        this.registerReducer("publishChanges", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.Publish, this._correlationId, {
                correlationId: this._correlationId,
            });
            this.state = Object.assign(Object.assign({}, this.state), { apiState: Object.assign(Object.assign({}, this.state.apiState), { publishState: designer.LoadState.Loading }) });
            try {
                const publishResponse = yield this._tableDesignerService.publishChanges(payload.table);
                endActivity.end(telemetry_2.ActivityStatus.Succeeded);
                state = Object.assign(Object.assign({}, state), { tableInfo: publishResponse.newTableInfo, view: (0, tableDesignerTabDefinition_1.getDesignerView)(publishResponse.view), model: publishResponse.viewModel, apiState: Object.assign(Object.assign({}, state.apiState), { publishState: designer.LoadState.Loaded, previewState: designer.LoadState.NotStarted }) });
                this.panel.title = state.tableInfo.title;
                this.showRestorePromptAfterClose = false;
                userSurvey_1.UserSurvey.getInstance().promptUserForNPSFeedback();
            }
            catch (e) {
                state = Object.assign(Object.assign({}, state), { apiState: Object.assign(Object.assign({}, state.apiState), { publishState: designer.LoadState.Error }), publishingError: e.toString() });
                endActivity.endFailed(e, false);
            }
            let targetNode = this._targetNode;
            // In case of table edit, we need to refresh the tables folder to get the new updated table
            if (this._targetNode.context.subType !== "Tables") {
                targetNode = this._targetNode.parentNode; // Setting the target node to the parent node to refresh the tables folder
            }
            if (targetNode) {
                yield this._objectExplorerTree.reveal(targetNode, {
                    expand: true,
                    select: true,
                });
                yield this._objectExplorerProvider.refreshNode(targetNode);
                yield this._objectExplorerProvider.refresh(targetNode);
            }
            return state;
        }));
        this.registerReducer("generateScript", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            this.state = Object.assign(Object.assign({}, this.state), { apiState: Object.assign(Object.assign({}, this.state.apiState), { generateScriptState: designer.LoadState.Loading }) });
            const script = yield this._tableDesignerService.generateScript(payload.table);
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.GenerateScript, {
                correlationId: this._correlationId,
            });
            state = Object.assign(Object.assign({}, state), { apiState: Object.assign(Object.assign({}, state.apiState), { generateScriptState: designer.LoadState.Loaded }) });
            yield this._untitledSqlDocumentService.newQuery(script);
            userSurvey_1.UserSurvey.getInstance().promptUserForNPSFeedback();
            return state;
        }));
        this.registerReducer("generatePreviewReport", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            this.state = Object.assign(Object.assign({}, this.state), { apiState: Object.assign(Object.assign({}, this.state.apiState), { previewState: designer.LoadState.Loading, publishState: designer.LoadState.NotStarted }), publishingError: undefined });
            const previewReport = yield this._tableDesignerService.generatePreviewReport(payload.table);
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.GenerateScript, {
                correlationId: this._correlationId,
            });
            state = Object.assign(Object.assign({}, state), { apiState: Object.assign(Object.assign({}, state.apiState), { previewState: previewReport.schemaValidationError
                        ? designer.LoadState.Error
                        : designer.LoadState.Loaded, publishState: designer.LoadState.NotStarted }), generatePreviewReportResult: previewReport });
            return state;
        }));
        this.registerReducer("initializeTableDesigner", (state) => __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            return state;
        }));
        this.registerReducer("scriptAsCreate", (state) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this._untitledSqlDocumentService.newQuery((_a = state.model["script"].value) !== null && _a !== void 0 ? _a : "");
            return state;
        }));
        this.registerReducer("copyScriptAsCreateToClipboard", (state) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield vscode.env.clipboard.writeText((_a = state.model["script"].value) !== null && _a !== void 0 ? _a : "");
            yield vscode.window.showInformationMessage(locConstants_1.scriptCopiedToClipboard);
            return state;
        }));
        this.registerReducer("setTab", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            state.tabStates.mainPaneTab = payload.tabId;
            return state;
        }));
        this.registerReducer("setPropertiesComponents", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            state.propertiesPaneData = payload.components;
            return state;
        }));
        this.registerReducer("setResultTab", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            state.tabStates.resultPaneTab = payload.tabId;
            return state;
        }));
        this.registerReducer("closeDesigner", (state) => __awaiter(this, void 0, void 0, function* () {
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.Close, {
                correlationId: this._correlationId,
            });
            this.panel.dispose();
            return state;
        }));
        this.registerReducer("continueEditing", (state) => __awaiter(this, void 0, void 0, function* () {
            this.state.apiState.publishState = designer.LoadState.NotStarted;
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.TableDesigner, telemetry_2.TelemetryActions.ContinueEditing, {
                correlationId: this._correlationId,
            });
            return state;
        }));
        this.registerReducer("copyPublishErrorToClipboard", (state) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield vscode.env.clipboard.writeText((_a = state.publishingError) !== null && _a !== void 0 ? _a : "");
            void vscode.window.showInformationMessage(locConstants_1.copied);
            return state;
        }));
    }
}
exports.TableDesignerWebviewController = TableDesignerWebviewController;

//# sourceMappingURL=tableDesignerWebviewController.js.map
