"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSessionIdResponse = exports.GetSessionIdRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
/**
 * A unique session ID used for all Object Explorer connection subtree mappings.
 * Guaranteed to be unique if any property of the connection details differs (except password).
 */
var GetSessionIdRequest;
(function (GetSessionIdRequest) {
    GetSessionIdRequest.type = new vscode_languageclient_1.RequestType("objectexplorer/getsessionid");
})(GetSessionIdRequest || (exports.GetSessionIdRequest = GetSessionIdRequest = {}));
/**
 * Contains a sessionId to be used when requesting
 * expansion of nodes
 */
class GetSessionIdResponse {
}
exports.GetSessionIdResponse = GetSessionIdResponse;

//# sourceMappingURL=getSessionIdRequest.js.map
