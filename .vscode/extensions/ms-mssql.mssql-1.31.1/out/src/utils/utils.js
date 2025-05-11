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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelError = void 0;
exports.exists = exists;
exports.getUniqueFilePath = getUniqueFilePath;
exports.getNonce = getNonce;
exports.isIConnectionInfo = isIConnectionInfo;
exports.getErrorMessage = getErrorMessage;
exports.listAllIterator = listAllIterator;
const fs_1 = require("fs");
const vscode = require("vscode");
function exists(path, uri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (uri) {
            const fullPath = vscode.Uri.joinPath(uri, path);
            try {
                yield vscode.workspace.fs.stat(fullPath);
                return true;
            }
            catch (_a) {
                return false;
            }
        }
        else {
            try {
                yield fs_1.promises.access(path);
                return true;
            }
            catch (e) {
                return false;
            }
        }
    });
}
/**
 * Generates a unique URI for a file in the specified folder using the
 * provided basename and file extension
 */
function getUniqueFilePath(folder, basename, fileExtension) {
    return __awaiter(this, void 0, void 0, function* () {
        let uniqueFileName;
        let counter = 1;
        if (yield exists(`${basename}.${fileExtension}`, folder)) {
            while (yield exists(`${basename}${counter}.${fileExtension}`, folder)) {
                counter += 1;
            }
            uniqueFileName = vscode.Uri.joinPath(folder, `${basename}${counter}.${fileExtension}`);
        }
        else {
            uniqueFileName = vscode.Uri.joinPath(folder, `${basename}.${fileExtension}`);
        }
        return uniqueFileName;
    });
}
/**
 * Generates a random nonce value that can be used in a webview
 */
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
class CancelError extends Error {
}
exports.CancelError = CancelError;
function isIConnectionInfo(connectionInfo) {
    return ((connectionInfo && connectionInfo.server && connectionInfo.authenticationType) ||
        connectionInfo.connectionString);
}
/**
 * Consolidates on the error message string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getErrorMessage(error) {
    return error instanceof Error
        ? typeof error.message === "string"
            ? error.message
            : ""
        : typeof error === "string"
            ? error
            : `${JSON.stringify(error, undefined, "\t")}`;
}
// Copied from https://github.com/microsoft/vscode-azuretools/blob/5794d9d2ccbbafdb09d44b2e1883e515077e4a72/azure/src/utils/uiUtils.ts#L26
function listAllIterator(iterator) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, iterator_1, iterator_1_1;
        var _b, e_1, _c, _d;
        const resources = [];
        try {
            for (_a = true, iterator_1 = __asyncValues(iterator); iterator_1_1 = yield iterator_1.next(), _b = iterator_1_1.done, !_b; _a = true) {
                _d = iterator_1_1.value;
                _a = false;
                const r = _d;
                resources.push(r);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_a && !_b && (_c = iterator_1.return)) yield _c.call(iterator_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return resources;
    });
}

//# sourceMappingURL=utils.js.map
