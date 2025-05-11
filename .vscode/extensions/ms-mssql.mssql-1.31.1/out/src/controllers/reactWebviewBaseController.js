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
exports.DefaultWebviewNotifications = exports.ReactWebviewBaseController = void 0;
const vscode = require("vscode");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const telemetry_2 = require("../telemetry/telemetry");
const utils_1 = require("../utils/utils");
const logger_1 = require("../models/logger");
const vscodeWrapper_1 = require("./vscodeWrapper");
/**
 * ReactWebviewBaseController is a class that manages a vscode.Webview and provides
 * a way to communicate with it. It provides a way to register request handlers and reducers
 * that can be called from the webview. It also provides a way to post notifications to the webview.
 * @template State The type of the state object that the webview will use
 * @template Reducers The type of the reducers that the webview will use
 */
class ReactWebviewBaseController {
    /**
     * Creates a new ReactWebviewPanelController
     * @param _context The context of the extension
     * @param _sourceFile The source file that the webview will use
     * @param _initialData The initial state object that the webview will use
     */
    constructor(_context, vscodeWrapper, _sourceFile, _initialData, viewId) {
        this._context = _context;
        this.vscodeWrapper = vscodeWrapper;
        this._sourceFile = _sourceFile;
        this._initialData = _initialData;
        this._disposables = [];
        this._isDisposed = false;
        this._webviewRequestHandlers = {};
        this._reducers = {};
        this._isFirstLoad = true;
        this._loadStartTime = Date.now();
        this._endLoadActivity = (0, telemetry_2.startActivity)(telemetry_1.TelemetryViews.WebviewController, telemetry_1.TelemetryActions.Load);
        this._onDisposed = new vscode.EventEmitter();
        this.onDisposed = this._onDisposed.event;
        this._webviewMessageHandler = (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.type === "request") {
                const endActivity = (0, telemetry_2.startActivity)(telemetry_1.TelemetryViews.WebviewController, telemetry_1.TelemetryActions.WebviewRequest);
                const handler = this._webviewRequestHandlers[message.method];
                if (handler) {
                    try {
                        const result = yield handler(message.params);
                        this.postMessage({
                            type: "response",
                            id: message.id,
                            result,
                        });
                        endActivity.end(telemetry_1.ActivityStatus.Succeeded, {
                            type: this._sourceFile,
                            method: message.method,
                            reducer: message.method === "action" ? message.params.type : undefined,
                        });
                    }
                    catch (error) {
                        endActivity.endFailed(error, false, "RequestHandlerFailed", "RequestHandlerFailed", {
                            type: this._sourceFile,
                            method: message.method,
                            reducer: message.method === "action" ? message.params.type : undefined,
                        });
                        throw error;
                    }
                }
                else {
                    const error = new Error(`No handler registered for method ${message.method}`);
                    endActivity.endFailed(error, true, "NoHandlerRegistered", "NoHandlerRegistered", {
                        type: this._sourceFile,
                        method: message.method,
                    });
                    throw error;
                }
            }
        });
        if (!vscodeWrapper) {
            vscodeWrapper = new vscodeWrapper_1.default();
        }
        this.logger = logger_1.Logger.create(vscodeWrapper.outputChannel, viewId);
    }
    initializeBase() {
        this.state = this._initialData;
        this._registerDefaultRequestHandlers();
        this.setupTheming();
    }
    registerDisposable(disposable) {
        this._disposables.push(disposable);
    }
    _getHtmlTemplate() {
        const nonce = (0, utils_1.getNonce)();
        const baseUrl = this._getWebview().asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, "out", "src", "reactviews", "assets"));
        const baseUrlString = baseUrl.toString() + "/";
        return `
		<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>mssqlwebview</title>
					<base href="${baseUrlString}"> <!-- Required for loading relative resources in the webview -->
				<style>
					html, body {
						margin: 0;
						padding: 0px;
  						width: 100%;
  						height: 100%;
					}
				</style>
				</head>
				<body>
					<link rel="stylesheet" href="${this._sourceFile}.css">
					<div id="root"></div>
				  	<script type="module" nonce="${nonce}" src="${this._sourceFile}.js"></script> <!-- since our bundles are in esm format we need to use type="module" -->
				</body>
			</html>
		`;
    }
    setupTheming() {
        this._disposables.push(vscode.window.onDidChangeActiveColorTheme((theme) => {
            this.postNotification(DefaultWebviewNotifications.onDidChangeTheme, theme.kind);
        }));
        this.postNotification(DefaultWebviewNotifications.onDidChangeTheme, vscode.window.activeColorTheme.kind);
    }
    _registerDefaultRequestHandlers() {
        this._webviewRequestHandlers["getState"] = () => {
            return this.state;
        };
        this._webviewRequestHandlers["action"] = (action) => __awaiter(this, void 0, void 0, function* () {
            const reducer = this._reducers[action.type];
            if (reducer) {
                this.state = yield reducer(this.state, action.payload);
            }
            else {
                throw new Error(`No reducer registered for action ${action.type}`);
            }
        });
        this._webviewRequestHandlers["getTheme"] = () => {
            return vscode.window.activeColorTheme.kind;
        };
        this._webviewRequestHandlers["loadStats"] = (message) => {
            const timeStamp = message.loadCompleteTimeStamp;
            const timeToLoad = timeStamp - this._loadStartTime;
            if (this._isFirstLoad) {
                console.log(`Load stats for ${this._sourceFile}` + "\n" + `Total time: ${timeToLoad} ms`);
                this._endLoadActivity.end(telemetry_1.ActivityStatus.Succeeded, {
                    type: this._sourceFile,
                });
                this._isFirstLoad = false;
            }
        };
        this._webviewRequestHandlers["sendActionEvent"] = (message) => {
            (0, telemetry_2.sendActionEvent)(message.telemetryView, message.telemetryAction, message.additionalProps, message.additionalMeasurements);
        };
        this._webviewRequestHandlers["sendErrorEvent"] = (message) => {
            (0, telemetry_2.sendErrorEvent)(message.telemetryView, message.telemetryAction, message.error, message.includeErrorMessage, message.errorCode, message.errorType, message.additionalProps, message.additionalMeasurements);
        };
        this._webviewRequestHandlers["getLocalization"] = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = vscode.l10n.uri) === null || _a === void 0 ? void 0 : _a.fsPath) {
                const file = yield vscode.workspace.fs.readFile(vscode.l10n.uri);
                const fileContents = Buffer.from(file).toString();
                return fileContents;
            }
            else {
                return undefined;
            }
        });
        this._webviewRequestHandlers["executeCommand"] = (message) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!(message === null || message === void 0 ? void 0 : message.command)) {
                console.log("No command provided to execute");
                return;
            }
            const args = (_a = message === null || message === void 0 ? void 0 : message.args) !== null && _a !== void 0 ? _a : [];
            return yield vscode.commands.executeCommand(message.command, ...args);
        });
        this._webviewRequestHandlers["getPlatform"] = () => __awaiter(this, void 0, void 0, function* () {
            return process.platform;
        });
        this._webviewRequestHandlers["log"] = (message) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.logger[(_a = message.level) !== null && _a !== void 0 ? _a : "log"](message.message);
        });
    }
    /**
     * Register a request handler that the webview can call and get a response from.
     * @param method The method name that the webview will use to call the handler
     * @param handler The handler that will be called when the method is called
     */
    registerRequestHandler(method, handler) {
        this._webviewRequestHandlers[method] = handler;
    }
    /**
     * Reducers are methods that can be called from the webview to modify the state of the webview.
     * This method registers a reducer that can be called from the webview.
     * @param method The method name that the webview will use to call the reducer
     * @param reducer The reducer that will be called when the method is called
     * @template Method The key of the reducer that is being registered
     */
    registerReducer(method, reducer) {
        this._reducers[method] = reducer;
    }
    /**
     * Gets the state object that the webview is using
     */
    get state() {
        return this._state;
    }
    /**
     * Sets the state object that the webview is using. This will update the state in the webview
     * and may cause the webview to re-render.
     * @param value The new state object
     */
    set state(value) {
        this._state = value;
        this.postNotification(DefaultWebviewNotifications.updateState, value);
    }
    /**
     * Updates the state in the webview
     * @param state The new state object.  If not provided, `this.state` is used.
     */
    updateState(state) {
        this.state = state !== null && state !== void 0 ? state : this.state;
    }
    /**
     * Gets whether the controller has been disposed
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Posts a notification to the webview
     * @param method The method name that the webview will use to handle the notification
     * @param params The parameters that will be passed to the method
     */
    postNotification(method, params) {
        this.postMessage({ type: "notification", method, params });
    }
    /**
     * Posts a message to the webview
     * @param message The message to post to the webview
     */
    postMessage(message) {
        var _a;
        if (!this._isDisposed) {
            (_a = this._getWebview()) === null || _a === void 0 ? void 0 : _a.postMessage(message);
        }
    }
    /**
     * Disposes the controller
     */
    dispose() {
        this._onDisposed.fire();
        this._disposables.forEach((d) => d.dispose());
        this._isDisposed = true;
    }
}
exports.ReactWebviewBaseController = ReactWebviewBaseController;
var DefaultWebviewNotifications;
(function (DefaultWebviewNotifications) {
    DefaultWebviewNotifications["updateState"] = "updateState";
    DefaultWebviewNotifications["onDidChangeTheme"] = "onDidChangeTheme";
})(DefaultWebviewNotifications || (exports.DefaultWebviewNotifications = DefaultWebviewNotifications = {}));

//# sourceMappingURL=reactWebviewBaseController.js.map
