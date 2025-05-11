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
exports.ContextMenu = void 0;
const locConstants_1 = require("../../../../common/locConstants");
const utils_1 = require("../utils");
require("./contextMenu.css");
class ContextMenu {
    constructor(uri, resultSetSummary, queryResultContext, webViewState, dataProvider) {
        this.uri = uri;
        this.resultSetSummary = resultSetSummary;
        this.queryResultContext = queryResultContext;
        this.webViewState = webViewState;
        this.dataProvider = dataProvider;
        this.handler = new Slick.EventHandler();
        this.activeContextMenu = null;
        this.uri = uri;
        this.resultSetSummary = resultSetSummary;
        this.webViewState = webViewState;
    }
    init(grid) {
        this.grid = grid;
        this.handler.subscribe(this.grid.onContextMenu, (e) => this.handleContextMenu(e));
        this.handler.subscribe(this.grid.onHeaderClick, (e) => this.headerClickHandler(e));
    }
    destroy() {
        this.handler.unsubscribeAll();
    }
    headerClickHandler(e) {
        if (!jQuery(e.target).closest("#contextMenu").length) {
            if (this.activeContextMenu) {
                this.activeContextMenu.hide();
            }
        }
    }
    handleContextMenu(e) {
        e.preventDefault();
        let mouseEvent = e;
        const $contextMenu = jQuery(`<ul id="contextMenu">` +
            `<li data-action="select-all" class="contextMenu">${locConstants_1.locConstants.queryResult.selectAll}</li>` +
            `<li data-action="copy" class="contextMenu">${locConstants_1.locConstants.queryResult.copy}</li>` +
            `<li data-action="copy-with-headers" class="contextMenu">${locConstants_1.locConstants.queryResult.copyWithHeaders}</li>` +
            `<li data-action="copy-headers" class="contextMenu">${locConstants_1.locConstants.queryResult.copyHeaders}</li>` +
            `</ul>`);
        // Remove any existing context menus to avoid duplication
        jQuery("#contextMenu").remove();
        // Append the menu to the body and set its position
        jQuery("body").append($contextMenu);
        let cell = this.grid.getCellFromEvent(e);
        $contextMenu
            .data("row", cell.row)
            .css("top", mouseEvent.pageY)
            .css("left", mouseEvent.pageX)
            .show();
        this.activeContextMenu = $contextMenu;
        jQuery("body").one("click", () => {
            $contextMenu.hide();
            this.activeContextMenu = null;
        });
        $contextMenu.on("click", "li", (event) => __awaiter(this, void 0, void 0, function* () {
            const action = jQuery(event.target).data("action");
            yield this.handleMenuAction(action);
            $contextMenu.hide(); // Hide the menu after an action is clicked
            this.activeContextMenu = null;
        }));
    }
    handleMenuAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            let selectedRanges = this.grid.getSelectionModel().getSelectedRanges();
            let selection = (0, utils_1.tryCombineSelectionsForResults)(selectedRanges);
            switch (action) {
                case "select-all":
                    this.queryResultContext.log("Select All action triggered");
                    const data = this.grid.getData();
                    let selectionModel = this.grid.getSelectionModel();
                    selectionModel.setSelectedRanges([
                        new Slick.Range(0, 0, data.length - 1, this.grid.getColumns().length - 1),
                    ]);
                    break;
                case "copy":
                    this.queryResultContext.log("Copy action triggered");
                    if (this.dataProvider.isDataInMemory) {
                        this.queryResultContext.log("Sorted/filtered grid detected, fetching data from data provider");
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
                        yield this.webViewState.extensionRpc.call("copySelection", {
                            uri: this.uri,
                            batchId: this.resultSetSummary.batchId,
                            resultId: this.resultSetSummary.id,
                            selection: selection,
                        });
                    }
                    break;
                case "copy-with-headers":
                    this.queryResultContext.log("Copy with headers action triggered");
                    if (this.dataProvider.isDataInMemory) {
                        this.queryResultContext.log("Sorted/filtered grid detected, fetching data from data provider");
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
                            headersFlag: true,
                        });
                    }
                    else {
                        yield this.webViewState.extensionRpc.call("copyWithHeaders", {
                            uri: this.uri,
                            batchId: this.resultSetSummary.batchId,
                            resultId: this.resultSetSummary.id,
                            selection: selection,
                        });
                    }
                    break;
                case "copy-headers":
                    this.queryResultContext.log("Copy Headers action triggered");
                    yield this.webViewState.extensionRpc.call("copyHeaders", {
                        uri: this.uri,
                        batchId: this.resultSetSummary.batchId,
                        resultId: this.resultSetSummary.id,
                        selection: selection,
                    });
                    break;
                default:
                    console.warn("Unknown action:", action);
            }
        });
    }
}
exports.ContextMenu = ContextMenu;

//# sourceMappingURL=contextMenu.plugin.js.map
