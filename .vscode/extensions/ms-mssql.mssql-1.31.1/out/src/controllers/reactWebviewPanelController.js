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
exports.ReactWebviewPanelController = void 0;
const locConstants = require("../constants/locConstants");
const vscode = require("vscode");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const reactWebviewBaseController_1 = require("./reactWebviewBaseController");
const telemetry_2 = require("../telemetry/telemetry");
const protocol_1 = require("../protocol");
/**
 * ReactWebviewPanelController is a class that manages a vscode.WebviewPanel and provides
 * a way to communicate with it. It provides a way to register request handlers and reducers
 * that can be called from the webview. It also provides a way to post notifications to the webview.
 * @template State The type of the state object that the webview will use
 * @template Reducers The type of the reducers that the webview will use
 */
class ReactWebviewPanelController extends reactWebviewBaseController_1.ReactWebviewBaseController {
    /**
     * Creates a new ReactWebviewPanelController
     * @param _context The context of the extension
     * @param title The title of the webview panel
     * @param sourceFile The source file that the webview will use
     * @param initialData The initial state object that the webview will use
     * @param viewColumn The view column that the webview will be displayed in
     * @param _iconPath The icon path that the webview will use
     */
    constructor(_context, vscodeWrapper, sourceFile, _viewId, initialData, _options) {
        super(_context, vscodeWrapper, sourceFile, initialData, _viewId);
        this._options = _options;
        this.dialogResult = new protocol_1.Deferred();
        this.createWebviewPanel();
        // This call sends messages to the Webview so it's called after the Webview creation.
        this.initializeBase();
    }
    createWebviewPanel() {
        this._panel = vscode.window.createWebviewPanel("mssql-react-webview", this._options.title, {
            viewColumn: this._options.viewColumn,
            preserveFocus: this._options.preserveFocus,
        }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(this._context.extensionPath)],
        });
        this._panel.webview.html = this._getHtmlTemplate();
        this._panel.iconPath = this._options.iconPath;
        this.registerDisposable(this._panel.webview.onDidReceiveMessage(this._webviewMessageHandler));
        this.registerDisposable(this._panel.onDidDispose(() => __awaiter(this, void 0, void 0, function* () {
            let prompt;
            if (this._options.showRestorePromptAfterClose) {
                prompt = yield this.showRestorePrompt();
            }
            if (prompt) {
                yield prompt.run();
                return;
            }
            this.dispose();
        })));
    }
    _getWebview() {
        return this._panel.webview;
    }
    /**
     * Gets the vscode.WebviewPanel that the controller is managing
     */
    get panel() {
        return this._panel;
    }
    /**
     * Displays the webview in the foreground
     * @param viewColumn The view column that the webview will be displayed in
     */
    revealToForeground(viewColumn = vscode.ViewColumn.One) {
        this._panel.reveal(viewColumn, true);
    }
    showRestorePrompt() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vscode.window.showInformationMessage(locConstants.Webview.webviewRestorePrompt(this._options.title), {
                modal: true,
            }, {
                title: locConstants.Webview.Restore,
                run: () => __awaiter(this, void 0, void 0, function* () {
                    (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.WebviewController, telemetry_1.TelemetryActions.Restore, {}, {});
                    yield this.createWebviewPanel();
                    this._panel.reveal(this._options.viewColumn);
                }),
            });
        });
    }
    set showRestorePromptAfterClose(value) {
        this._options.showRestorePromptAfterClose = value;
    }
    dispose() {
        // Ensure that the promise is resolved, regardless of how the panel is disposed.
        // If it has already been resolved/rejected, this won't change that.
        this.dialogResult.resolve(undefined);
        super.dispose();
    }
}
exports.ReactWebviewPanelController = ReactWebviewPanelController;

//# sourceMappingURL=reactWebviewPanelController.js.map
