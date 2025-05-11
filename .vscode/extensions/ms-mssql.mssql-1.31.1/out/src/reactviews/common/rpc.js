"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewRpc = void 0;
/**
 * RPC to communicate with the extension.
 * @template Reducers interface that contains definitions for all reducers and their payloads.
 */
class WebviewRpc {
    static getInstance(vscodeApi) {
        if (!WebviewRpc._instance) {
            WebviewRpc._instance = new WebviewRpc(vscodeApi);
        }
        return WebviewRpc._instance;
    }
    constructor(_vscodeApi) {
        this._vscodeApi = _vscodeApi;
        this._rpcRequestId = 0;
        this._rpcHandlers = {};
        this._methodSubscriptions = {};
        window.addEventListener("message", (event) => {
            const message = event.data;
            if (message.type === "response") {
                const { id, result, error } = message;
                if (this._rpcHandlers[id]) {
                    if (error) {
                        this._rpcHandlers[id].reject(error);
                    }
                    else {
                        this._rpcHandlers[id].resolve(result);
                    }
                    delete this._rpcHandlers[id];
                }
            }
            if (message.type === "notification") {
                const { method, params } = message;
                if (this._methodSubscriptions[method]) {
                    Object.values(this._methodSubscriptions[method]).forEach((cb) => cb(params));
                }
            }
        });
    }
    /**
     * Call a method on the extension. Use this method when you expect a response object from the extension.
     * @param method name of the method to call
     * @param params parameters to pass to the method
     * @returns a promise that resolves to the result of the method call
     */
    call(method, params) {
        const id = this._rpcRequestId++;
        this._vscodeApi.postMessage({ type: "request", id, method, params });
        return new Promise((resolve, reject) => {
            this._rpcHandlers[id] = { resolve, reject };
        });
    }
    /**
     * Call reducers defined for the webview. Use this for actions that modify the state of the webview.
     * @param method name of the method to call
     * @param payload parameters to pass to the method
     * @template MethodName name of the method to call. Must be a key of the Reducers interface.
     */
    action(method, payload) {
        void this.call("action", { type: method, payload });
    }
    subscribe(callerId, method, callback) {
        if (!this._methodSubscriptions[method]) {
            this._methodSubscriptions[method] = {};
        }
        this._methodSubscriptions[method][callerId] = callback;
    }
    sendActionEvent(event) {
        void this.call("sendActionEvent", event);
    }
    sendErrorEvent(event) {
        void this.call("sendErrorEvent", event);
    }
    log(message, level) {
        void this.call("log", { message, level });
    }
}
exports.WebviewRpc = WebviewRpc;

//# sourceMappingURL=rpc.js.map
