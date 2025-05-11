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
exports.ObjectExplorerFilter = exports.ObjectExplorerFilterReactWebviewController = void 0;
const vscode = require("vscode");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const reactWebviewPanelController_1 = require("../controllers/reactWebviewPanelController");
const crypto_1 = require("crypto");
const telemetry_2 = require("../telemetry/telemetry");
class ObjectExplorerFilterReactWebviewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, data) {
        super(context, vscodeWrapper, "objectExplorerFilter", "objectExplorerFilter", data !== null && data !== void 0 ? data : {
            filterProperties: [],
            existingFilters: [],
            nodePath: "",
        }, {
            title: vscode.l10n.t("Object Explorer Filter (Preview)"),
            viewColumn: vscode.ViewColumn.Beside,
            iconPath: {
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "filter_dark.svg"),
                light: vscode.Uri.joinPath(context.extensionUri, "media", "filter_light.svg"),
            },
        });
        this._onSubmit = new vscode.EventEmitter();
        this.onSubmit = this._onSubmit.event;
        this._onCancel = new vscode.EventEmitter();
        this.onCancel = this._onCancel.event;
        this.registerReducer("submit", (state, payload) => {
            this._onSubmit.fire(payload.filters);
            this.panel.dispose();
            return state;
        });
        this.registerReducer("cancel", (state) => {
            this._onCancel.fire();
            this.panel.dispose();
            return state;
        });
    }
    loadData(data) {
        this.state = data;
    }
}
exports.ObjectExplorerFilterReactWebviewController = ObjectExplorerFilterReactWebviewController;
class ObjectExplorerFilter {
    /**
     * This method is used to get the filters from the user for the given treeNode.
     * @param context The extension context
     * @param treeNode The treeNode for which the filters are needed
     * @returns The filters that the user has selected or undefined if the user has cancelled the operation.
     */
    static getFilters(context, vscodeWrapper, treeNode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, _reject) => {
                const correlationId = (0, crypto_1.randomUUID)();
                (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.ObjectExplorerFilter, telemetry_1.TelemetryActions.Open, {
                    nodeType: treeNode.nodeType,
                    correlationId,
                });
                if (!this._filterWebviewController || this._filterWebviewController.isDisposed) {
                    this._filterWebviewController = new ObjectExplorerFilterReactWebviewController(context, vscodeWrapper, {
                        filterProperties: treeNode.filterableProperties,
                        existingFilters: treeNode.filters,
                        nodePath: treeNode.nodePath,
                    });
                }
                else {
                    this._filterWebviewController.loadData({
                        filterProperties: treeNode.filterableProperties,
                        existingFilters: treeNode.filters,
                        nodePath: treeNode.nodePath,
                    });
                }
                this._filterWebviewController.revealToForeground();
                this._filterWebviewController.onSubmit((e) => {
                    if (e) {
                        (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.ObjectExplorerFilter, telemetry_1.TelemetryActions.Submit, {
                            nodeType: treeNode.nodeType,
                            correlationId,
                            filters: JSON.stringify(e.map((e) => e.name)),
                        }, {
                            filterCount: e.length,
                        });
                    }
                    resolve(e);
                });
                this._filterWebviewController.onCancel(() => {
                    (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.ObjectExplorerFilter, telemetry_1.TelemetryActions.Cancel, {
                        nodeType: treeNode.nodeType,
                        correlationId,
                    });
                    resolve(undefined);
                });
                this._filterWebviewController.onDisposed(() => {
                    (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.ObjectExplorerFilter, telemetry_1.TelemetryActions.Cancel, {
                        nodeType: treeNode.nodeType,
                        correlationId,
                    });
                    resolve(undefined);
                });
            });
        });
    }
}
exports.ObjectExplorerFilter = ObjectExplorerFilter;

//# sourceMappingURL=objectExplorerFilter.js.map
