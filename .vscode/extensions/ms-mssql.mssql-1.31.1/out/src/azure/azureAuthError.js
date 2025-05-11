"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureAuthError = void 0;
class AzureAuthError extends Error {
    constructor(localizedMessage, originalMessage, originalException) {
        super(localizedMessage);
        this.originalMessage = originalMessage;
        this.originalException = originalException;
    }
    /**
     * The original message and exception for displaying extra information
     */
    get originalMessageAndException() {
        return JSON.stringify({
            originalMessage: this.originalMessage,
            originalException: this.originalException,
        }, undefined, 2);
    }
}
exports.AzureAuthError = AzureAuthError;

//# sourceMappingURL=azureAuthError.js.map
