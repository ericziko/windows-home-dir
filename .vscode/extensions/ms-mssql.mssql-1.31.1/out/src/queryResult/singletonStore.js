"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class QueryResultSingletonStore {
    // Private constructor to prevent instantiation from outside
    constructor() {
        this.store = new Map();
    }
    // Method to get the single instance of the store
    static getInstance() {
        if (!QueryResultSingletonStore.instance) {
            QueryResultSingletonStore.instance = new QueryResultSingletonStore();
        }
        return QueryResultSingletonStore.instance;
    }
    // Method to set a value in the store
    set(key, value) {
        this.store.set(key, value);
    }
    // Method to get a value from the store
    get(key) {
        return this.store.get(key);
    }
    // Method to check if a key exists
    has(key) {
        return this.store.has(key);
    }
    // Method to delete a key-value pair
    delete(key) {
        return this.store.delete(key);
    }
    // Method to clear the store
    clear() {
        this.store.clear();
    }
}
// Export the singleton instance
const store = QueryResultSingletonStore.getInstance();
exports.default = store;

//# sourceMappingURL=singletonStore.js.map
