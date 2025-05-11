"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitMessages = exports.saveAsExcelIcon = exports.saveAsJsonIcon = exports.saveAsCsvIcon = void 0;
exports.hasResultsOrMessages = hasResultsOrMessages;
const webview_1 = require("../../../sharedInterfaces/webview");
const saveAsCsvIcon = (theme) => {
    return theme === webview_1.ColorThemeKind.Light
        ? require("../../media/saveCsv.svg")
        : require("../../media/saveCsv_inverse.svg");
};
exports.saveAsCsvIcon = saveAsCsvIcon;
const saveAsJsonIcon = (theme) => {
    return theme === webview_1.ColorThemeKind.Light
        ? require("../../media/saveJson.svg")
        : require("../../media/saveJson_inverse.svg");
};
exports.saveAsJsonIcon = saveAsJsonIcon;
const saveAsExcelIcon = (theme) => {
    return theme === webview_1.ColorThemeKind.Light
        ? require("../../media/saveExcel.svg")
        : require("../../media/saveExcel_inverse.svg");
};
exports.saveAsExcelIcon = saveAsExcelIcon;
function hasResultsOrMessages(state) {
    return Object.keys(state.resultSetSummaries).length > 0 || state.messages.length > 0;
}
/**
 * Splits messages containing newline characters into separate messages while preserving original properties.
 * @param messages - Array messages to process
 * @returns Array of messages with newline characters split into separate messages
 */
const splitMessages = (messages) => {
    return messages.flatMap((message) => {
        const lines = message.message.split(/\r?\n/);
        return lines.map((line) => {
            let newMessage = Object.assign({}, message);
            newMessage.message = line;
            return newMessage;
        });
    });
};
exports.splitMessages = splitMessages;

//# sourceMappingURL=queryResultUtils.js.map
