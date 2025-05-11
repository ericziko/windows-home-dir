"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTableStyles = exports.SortProperties = void 0;
var SortProperties;
(function (SortProperties) {
    SortProperties["ASC"] = "ASC";
    SortProperties["DESC"] = "DESC";
    SortProperties["NONE"] = "NONE";
})(SortProperties || (exports.SortProperties = SortProperties = {}));
exports.defaultTableStyles = {
    listFocusBackground: "var(--vscode-list-focusBackground)",
    listFocusForeground: "var(--vscode-list-focusForeground)",
    listActiveSelectionBackground: "var(--vscode-list-activeSelectionBackground)",
    listActiveSelectionForeground: "var(--vscode-list-activeSelectionForeground)",
    listFocusAndSelectionBackground: "var(--vscode-list-activeSelectionBackground)", // "var(--vscode-list-focusAndSelectionBackground)"  not defined
    listFocusAndSelectionForeground: "var(--vscode-list-activeSelectionForeground)", // "var(--vscode-list-focusAndSelectionBackground)"  not defined
    listInactiveFocusBackground: undefined,
    listInactiveSelectionBackground: "var(--vscode-list-inactiveSelectionBackground)",
    listInactiveSelectionForeground: undefined,
    listHoverBackground: "var(--vscode-list-hoverBackground)",
    listHoverForeground: "var(--vscode-list-hoverForeground)",
    listDropBackground: "var(--vscode-list-dropBackground)",
    listFocusOutline: "var(--vscode-contrastActiveBorder)",
    listSelectionOutline: "var(--vscode-contrastActiveBorder)",
    listHoverOutline: "var(--vscode-contrastActiveBorder)",
    listInactiveFocusOutline: "var(--vscode-list-inactiveFocusOutline)",
    tableHeaderBackground: "var(--vscode-keybindingTable-headerBackground)",
    tableHeaderForeground: "var(--vscode-foreground)",
};

//# sourceMappingURL=interfaces.js.map
