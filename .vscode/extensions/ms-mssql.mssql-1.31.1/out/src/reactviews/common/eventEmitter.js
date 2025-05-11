"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEventEmitter = void 0;
class TypedEventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }
    off(event, listener) {
        var _a;
        this.listeners[event] = (_a = this.listeners[event]) === null || _a === void 0 ? void 0 : _a.filter((l) => l !== listener);
    }
    emit(event, ...args) {
        var _a;
        (_a = this.listeners[event]) === null || _a === void 0 ? void 0 : _a.forEach((listener) => listener(...args));
    }
    once(event, listener) {
        const onceWrapper = ((...args) => {
            this.off(event, onceWrapper);
            listener(...args);
        });
        this.on(event, onceWrapper);
    }
}
exports.TypedEventEmitter = TypedEventEmitter;

//# sourceMappingURL=eventEmitter.js.map
