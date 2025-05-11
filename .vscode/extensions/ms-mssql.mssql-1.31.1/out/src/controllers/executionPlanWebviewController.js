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
exports.ExecutionPlanWebviewController = void 0;
const vscode = require("vscode");
const webview_1 = require("../sharedInterfaces/webview");
const reactWebviewPanelController_1 = require("./reactWebviewPanelController");
const sharedExecutionPlanUtils_1 = require("./sharedExecutionPlanUtils");
class ExecutionPlanWebviewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, executionPlanService, // public for testing purposes
    untitledSqlDocumentService, executionPlanContents, 
    // needs ts-ignore because linter doesn't recognize that fileName is being used in the call to super
    // @ts-ignore
    xmlPlanFileName) {
        super(context, vscodeWrapper, "executionPlan", "executionPlan", {
            executionPlanState: {
                loadState: webview_1.ApiStatus.Loading,
                executionPlanGraphs: [],
                totalCost: 0,
            },
        }, {
            title: `${xmlPlanFileName}`, // Sets the webview title
            viewColumn: vscode.ViewColumn.Active, // Sets the view column of the webview
            iconPath: {
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "executionPlan_dark.svg"),
                light: vscode.Uri.joinPath(context.extensionUri, "media", "executionPlan_light.svg"),
            },
        });
        this.executionPlanService = executionPlanService;
        this.untitledSqlDocumentService = untitledSqlDocumentService;
        this.executionPlanContents = executionPlanContents;
        void this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state.executionPlanState.loadState = webview_1.ApiStatus.Loading;
            this.updateState();
            this.registerRpcHandlers();
        });
    }
    registerRpcHandlers() {
        this.registerReducer("getExecutionPlan", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            state = yield (0, sharedExecutionPlanUtils_1.createExecutionPlanGraphs)(state, this.executionPlanService, [this.executionPlanContents], "SqlplanFile");
            return Object.assign(Object.assign({}, state), { executionPlanState: Object.assign(Object.assign({}, state.executionPlanState), { executionPlanGraphs: this.state.executionPlanState.executionPlanGraphs }) });
        }));
        this.registerReducer("saveExecutionPlan", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            return (0, sharedExecutionPlanUtils_1.saveExecutionPlan)(state, payload);
        }));
        this.registerReducer("showPlanXml", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            return (0, sharedExecutionPlanUtils_1.showPlanXml)(state, payload);
        }));
        this.registerReducer("showQuery", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            return (0, sharedExecutionPlanUtils_1.showQuery)(state, payload, this.untitledSqlDocumentService);
        }));
        this.registerReducer("updateTotalCost", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            return (0, sharedExecutionPlanUtils_1.updateTotalCost)(state, payload);
        }));
    }
}
exports.ExecutionPlanWebviewController = ExecutionPlanWebviewController;

//# sourceMappingURL=executionPlanWebviewController.js.map
