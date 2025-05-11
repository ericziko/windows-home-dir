"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
class EventManager {
    constructor() {
        this.eventListeners = [];
    }
    /** Method to add an event listener and track it */
    addEventListener(target, type, handler) {
        target.addEventListener(type, handler);
        this.eventListeners.push({ target, type, handler });
    }
    /** Method to remove all tracked event listeners */
    clearEventListeners() {
        for (const { target, type, handler } of this.eventListeners) {
            target.removeEventListener(type, handler);
        }
        this.eventListeners = []; // Clear the registry
    }
}
exports.EventManager = EventManager;

//# sourceMappingURL=eventManager.js.map
