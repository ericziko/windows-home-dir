"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.instanceOfIDisposableDataProvider = instanceOfIDisposableDataProvider;
/**
 * Check whether the object is an instance of IDisposableDataProvider
 */
function instanceOfIDisposableDataProvider(obj) {
    const provider = obj;
    return obj && provider.isDataInMemory !== undefined;
}

//# sourceMappingURL=dataProvider.js.map
