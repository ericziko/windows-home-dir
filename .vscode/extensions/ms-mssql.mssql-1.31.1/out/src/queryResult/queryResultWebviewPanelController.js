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
exports.QueryResultWebviewPanelController = void 0;
const vscode = require("vscode");
const qr = require("../sharedInterfaces/queryResult");
const crypto_1 = require("crypto");
const reactWebviewPanelController_1 = require("../controllers/reactWebviewPanelController");
const utils_1 = require("./utils");
class QueryResultWebviewPanelController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, _viewColumn, _uri, title, _queryResultWebviewViewController) {
        super(context, vscodeWrapper, "queryResult", "queryResult", {
            resultSetSummaries: {},
            messages: [],
            tabStates: {
                resultPaneTab: qr.QueryResultPaneTabs.Messages,
            },
            executionPlanState: {},
            fontSettings: {},
        }, {
            title: vscode.l10n.t({
                message: "{0} (Preview)",
                args: [title],
                comment: "{0} is the editor title",
            }),
            viewColumn: _viewColumn,
            preserveFocus: true,
            iconPath: {
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "revealQueryResult.svg"),
                light: vscode.Uri.joinPath(context.extensionUri, "media", "revealQueryResult.svg"),
            },
        });
        this._viewColumn = _viewColumn;
        this._uri = _uri;
        this._queryResultWebviewViewController = _queryResultWebviewViewController;
        this._correlationId = (0, crypto_1.randomUUID)();
        void this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerRpcHandlers();
        });
    }
    registerRpcHandlers() {
        this.registerRequestHandler("getWebviewLocation", () => __awaiter(this, void 0, void 0, function* () {
            return qr.QueryResultWebviewLocation.Document;
        }));
        (0, utils_1.registerCommonRequestHandlers)(this, this._correlationId);
    }
    dispose() {
        super.dispose();
        this._queryResultWebviewViewController.removePanel(this._uri);
    }
    revealToForeground() {
        this.panel.reveal(this._viewColumn, true);
    }
    getQueryResultWebviewViewController() {
        return this._queryResultWebviewViewController;
    }
}
exports.QueryResultWebviewPanelController = QueryResultWebviewPanelController;

//# sourceMappingURL=queryResultWebviewPanelController.js.map
