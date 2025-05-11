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
exports.ReactWebviewViewController = void 0;
const vscode = require("vscode");
const reactWebviewBaseController_1 = require("./reactWebviewBaseController");
/**
 * ReactWebviewViewController is a class that manages a vscode.WebviewView and provides
 * a way to communicate with it. It provides a way to register request handlers and reducers
 * that can be called from the webview. It also provides a way to post notifications to the webview.
 * @template State The type of the state object that the webview will use
 * @template Reducers The type of the reducers that the webview will use
 */
class ReactWebviewViewController extends reactWebviewBaseController_1.ReactWebviewBaseController {
    /**
     * Creates a new ReactWebviewViewController
     * @param _context Extension context
     * @param _sourceFile Source file that the webview will use
     * @param _viewId The id of the view, this should be the same id defined in the package.json
     * @param initialData Initial state object that the webview will use
     */
    constructor(_context, _vscodeWrapper, _sourceFile, _viewId, initialData) {
        super(_context, _vscodeWrapper, _sourceFile, initialData, _viewId);
        this._viewId = _viewId;
    }
    _getWebview() {
        var _a;
        return (_a = this._webviewView) === null || _a === void 0 ? void 0 : _a.webview;
    }
    /**
     * returns if the webview is visible
     */
    isVisible() {
        var _a;
        return (_a = this._webviewView) === null || _a === void 0 ? void 0 : _a.visible;
    }
    /**
     * Displays the webview in the foreground
     */
    revealToForeground() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!((_a = this._webviewView) === null || _a === void 0 ? void 0 : _a.webview)) {
                // If the webview is not yet created, focus will force it to be created and shown.
                // The preserveFocus arg is not documented
                // https://github.com/microsoft/vscode/issues/205766#issuecomment-1994961088
                yield vscode.commands.executeCommand(`${this._viewId}.focus`, {
                    preserveFocus: true,
                });
            }
            (_b = this._webviewView) === null || _b === void 0 ? void 0 : _b.show(true);
        });
    }
    resolveWebviewView(webviewView, context, _token) {
        this._loadStartTime = Date.now();
        this._webviewView = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri],
        };
        this._webviewView.onDidDispose(() => {
            this.dispose();
        });
        this._webviewView.webview.html = this._getHtmlTemplate();
        this.registerDisposable(this._webviewView.webview.onDidReceiveMessage(this._webviewMessageHandler));
        this.initializeBase();
    }
}
exports.ReactWebviewViewController = ReactWebviewViewController;

//# sourceMappingURL=reactWebviewViewController.js.map
