"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessShortcut = exports.msgCannotSaveMultipleSelections = exports.elapsedTimeLabel = exports.lineSelectorFormatted = exports.messagePaneLabel = exports.executeQueryLabel = exports.copyHeadersLabel = exports.copyWithHeadersLabel = exports.copyLabel = exports.selectAll = exports.resultPaneLabel = exports.saveExcelLabel = exports.saveJSONLabel = exports.saveCSVLabel = exports.restoreLabel = exports.maximizeLabel = void 0;
exports.loadLocalizedConstant = loadLocalizedConstant;
/** Note: The new constants in this file should be added to localization\xliff\constants\localizedConstants.enu.xlf so the localized texts get loaded here */
/** Results Pane Labels */
exports.maximizeLabel = "Maximize";
exports.restoreLabel = "Restore";
exports.saveCSVLabel = "Save as CSV";
exports.saveJSONLabel = "Save as JSON";
exports.saveExcelLabel = "Save as Excel";
exports.resultPaneLabel = "Results";
exports.selectAll = "Select all";
exports.copyLabel = "Copy";
exports.copyWithHeadersLabel = "Copy with Headers";
exports.copyHeadersLabel = "Copy All Headers";
/** Messages Pane Labels */
exports.executeQueryLabel = "Executing query...";
exports.messagePaneLabel = "Messages";
exports.lineSelectorFormatted = "Line {0}";
exports.elapsedTimeLabel = "Total execution time: {0}";
/** Warning message for save icons */
exports.msgCannotSaveMultipleSelections = "Save results command cannot be used with multiple selections.";
exports.accessShortcut = "Access through shortcut";
function loadLocalizedConstant(key, value) {
    // Update the value of the property with the name equal to key in this file
    this[key] = value;
}

//# sourceMappingURL=constants.js.map
