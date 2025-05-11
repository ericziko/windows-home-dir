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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyKeybind = void 0;
const utils_1 = require("../utils");
const keys_1 = require("../../keys");
/**
 * Implements the various additional navigation keybindings we want out of slickgrid
 */
class CopyKeybind {
    constructor(uri, resultSetSummary, webViewState, dataProvider) {
        this.dataProvider = dataProvider;
        this.handler = new Slick.EventHandler();
        this.uri = uri;
        this.resultSetSummary = resultSetSummary;
        this.webViewState = webViewState;
    }
    init(grid) {
        this.grid = grid;
        this.handler.subscribe(this.grid.onKeyDown, (e) => this.handleKeyDown(e));
    }
    destroy() {
        this.grid.onKeyDown.unsubscribe();
    }
    handleKeyDown(e) {
        return __awaiter(this, void 0, void 0, function* () {
            let handled = false;
            let platform = yield this.webViewState.extensionRpc.call("getPlatform");
            if (platform === "darwin") {
                // Cmd + C
                if (e.metaKey && e.key === keys_1.Keys.c) {
                    handled = true;
                    yield this.handleCopySelection(this.grid, this.webViewState, this.uri, this.resultSetSummary);
                }
            }
            else {
                if (e.ctrlKey && e.key === keys_1.Keys.c) {
                    handled = true;
                    yield this.handleCopySelection(this.grid, this.webViewState, this.uri, this.resultSetSummary);
                }
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    handleCopySelection(grid, webViewState, uri, resultSetSummary) {
        return __awaiter(this, void 0, void 0, function* () {
            let selectedRanges = grid.getSelectionModel().getSelectedRanges();
            let selection = (0, utils_1.tryCombineSelectionsForResults)(selectedRanges);
            if (this.dataProvider.isDataInMemory) {
                let range = (0, utils_1.selectionToRange)(selection[0]);
                let data = yield this.dataProvider.getRangeAsync(range.start, range.length);
                const dataArray = data.map((map) => {
                    const maxKey = Math.max(...Array.from(Object.keys(map)).map(Number)); // Get the maximum key
                    return Array.from({ length: maxKey + 1 }, (_, index) => ({
                        rowId: index,
                        displayValue: map[index].displayValue || null,
                    }));
                });
                yield this.webViewState.extensionRpc.call("sendToClipboard", {
                    uri: this.uri,
                    data: dataArray,
                    batchId: this.resultSetSummary.batchId,
                    resultId: this.resultSetSummary.id,
                    selection: selection,
                    headersFlag: false,
                });
            }
            else {
                yield webViewState.extensionRpc.call("copySelection", {
                    uri: uri,
                    batchId: resultSetSummary.batchId,
                    resultId: resultSetSummary.id,
                    selection: selection,
                });
            }
        });
    }
}
exports.CopyKeybind = CopyKeybind;

//# sourceMappingURL=copyKeybind.plugin.js.map
