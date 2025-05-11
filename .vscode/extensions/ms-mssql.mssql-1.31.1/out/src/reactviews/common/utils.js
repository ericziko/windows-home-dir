"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseButton = void 0;
exports.formatString = formatString;
exports.resolveVscodeThemeType = resolveVscodeThemeType;
exports.themeType = themeType;
exports.removeDuplicates = removeDuplicates;
exports.deepClone = deepClone;
exports.getCoreRPCs = getCoreRPCs;
const webview_1 = require("../../sharedInterfaces/webview");
/**
 * Format a string. Behaves like C#'s string.Format() function.
 */
function formatString(str, ...args) {
    // This is based on code originally from https://github.com/Microsoft/vscode/blob/master/src/vs/nls.js
    // License: https://github.com/Microsoft/vscode/blob/master/LICENSE.txt
    let result;
    if (args.length === 0) {
        result = str;
    }
    else {
        result = str.replace(/\{(\d+)\}/g, (match, rest) => {
            let index = rest[0];
            return typeof args[index] !== "undefined" ? args[index] : match;
        });
    }
    return result;
}
/**
 * Get the css string representation of a ColorThemeKind
 * @param themeKind The ColorThemeKind to convert
 */
function resolveVscodeThemeType(themeKind) {
    switch (themeKind) {
        case webview_1.ColorThemeKind.Dark:
            return "vs-dark";
        case webview_1.ColorThemeKind.HighContrast:
            return "hc-black";
        default: // Both hc-light and light themes are treated as light.
            return "light";
    }
}
function themeType(themeKind) {
    const themeType = resolveVscodeThemeType(themeKind);
    if (themeType !== "light") {
        return "dark";
    }
    return themeType;
}
/** Removes duplicate values from an array */
function removeDuplicates(array) {
    return Array.from(new Set(array));
}
/** from vscode: https://github.com/microsoft/vscode/blob/5bd3d12fb18047ae33ac4b171dee3cd044b6f3d4/src/vs/base/common/objects.ts#L8 */
function deepClone(obj) {
    if (!obj || typeof obj !== "object") {
        return obj;
    }
    if (obj instanceof RegExp) {
        return obj;
    }
    const result = Array.isArray(obj) ? [] : {};
    Object.entries(obj).forEach(([key, value]) => {
        result[key] = value && typeof value === "object" ? deepClone(value) : value;
    });
    return result;
}
function getCoreRPCs(webviewState) {
    return {
        log(message, level) {
            webviewState.extensionRpc.log(message, level);
        },
        sendActionEvent(event) {
            webviewState.extensionRpc.sendActionEvent(event);
        },
        sendErrorEvent(event) {
            webviewState.extensionRpc.sendErrorEvent(event);
        },
    };
}
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["LeftClick"] = 0] = "LeftClick";
    MouseButton[MouseButton["Middle"] = 1] = "Middle";
    MouseButton[MouseButton["RightClick"] = 2] = "RightClick";
})(MouseButton || (exports.MouseButton = MouseButton = {}));

//# sourceMappingURL=utils.js.map
