"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellRangeSelector = void 0;
const objects_1 = require("../objects");
const defaultOptions = {
    selectionCss: {
        border: "2px dashed blue",
    },
    offset: {
        top: -1,
        left: -1,
        height: 2,
        width: 2,
    },
    dragClass: "drag",
};
class CellRangeSelector {
    constructor(options) {
        this.options = options;
        this.handler = new Slick.EventHandler();
        this.onBeforeCellRangeSelected = new Slick.Event();
        this.onCellRangeSelected = new Slick.Event();
        this.onAppendCellRangeSelected = new Slick.Event();
        this.options = (0, objects_1.mixin)(this.options, defaultOptions, false);
    }
    init(grid) {
        this.decorator =
            this.options.cellDecorator || new Slick.CellRangeDecorator(grid, this.options);
        this.grid = grid;
        this.canvas = this.grid.getCanvasNode();
        this.isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        this.handler
            .subscribe(this.grid.onDragInit, (e) => this.handleDragInit(e))
            .subscribe(this.grid.onDragStart, (e, dd) => this.handleDragStart(e, dd))
            .subscribe(this.grid.onDrag, (e, dd) => this.handleDrag(e, dd))
            .subscribe(this.grid.onDragEnd, (e, dd) => this.handleDragEnd(e, dd));
    }
    destroy() {
        this.handler.unsubscribeAll();
    }
    getCellDecorator() {
        return this.decorator;
    }
    getCurrentRange() {
        return this.currentlySelectedRange;
    }
    handleDragInit(e) {
        // prevent the grid from cancelling drag'n'drop by default
        e.stopImmediatePropagation();
    }
    handleDragStart(e, dd) {
        var _a, _b, _c, _d;
        let cell = this.grid.getCellFromEvent(e);
        if (this.onBeforeCellRangeSelected.notify(cell) !== false) {
            if (this.grid.canCellBeSelected(cell.row, cell.cell)) {
                this.dragging = true;
                e.stopImmediatePropagation();
            }
        }
        if (!this.dragging) {
            return;
        }
        this.canvas.classList.add(this.options.dragClass);
        this.grid.setActiveCell(cell.row, cell.cell);
        let start = this.grid.getCellFromPoint(dd.startX - ((_b = (_a = jQuery(this.canvas).offset()) === null || _a === void 0 ? void 0 : _a.left) !== null && _b !== void 0 ? _b : 0), dd.startY - ((_d = (_c = jQuery(this.canvas).offset()) === null || _c === void 0 ? void 0 : _c.top) !== null && _d !== void 0 ? _d : 0));
        dd.range = { start: start, end: undefined };
        this.currentlySelectedRange = dd.range;
        return this.decorator.show(new Slick.Range(start.row, start.cell));
    }
    handleDrag(e, dd) {
        var _a, _b, _c, _d;
        if (!this.dragging) {
            return;
        }
        e.stopImmediatePropagation();
        let end = this.grid.getCellFromPoint(e.pageX - ((_b = (_a = jQuery(this.canvas).offset()) === null || _a === void 0 ? void 0 : _a.left) !== null && _b !== void 0 ? _b : 0), e.pageY - ((_d = (_c = jQuery(this.canvas).offset()) === null || _c === void 0 ? void 0 : _c.top) !== null && _d !== void 0 ? _d : 0));
        if (!this.grid.canCellBeSelected(end.row, end.cell)) {
            return;
        }
        dd.range.end = end;
        this.currentlySelectedRange = dd.range;
        this.decorator.show(new Slick.Range(dd.range.start.row, dd.range.start.cell, end.row, end.cell));
    }
    handleDragEnd(e, dd) {
        if (!this.dragging) {
            return;
        }
        this.canvas.classList.remove(this.options.dragClass);
        this.dragging = false;
        e.stopImmediatePropagation();
        this.decorator.hide();
        // if this happens to fast there is a chance we don't have the necessary information to actually do proper selection
        if (!dd || !dd.range || !dd.range.start || !dd.range.end) {
            return;
        }
        let newRange = new Slick.Range(dd.range.start.row, dd.range.start.cell, dd.range.end.row, dd.range.end.cell);
        if (this.isMac) {
            // MacOS uses metaKey instead of ctrlKey
            if (e.metaKey) {
                this.onAppendCellRangeSelected.notify(newRange);
            }
            else {
                this.onCellRangeSelected.notify(newRange);
            }
        }
        else {
            if (e.ctrlKey) {
                this.onAppendCellRangeSelected.notify(newRange);
            }
            else {
                this.onCellRangeSelected.notify(newRange);
            }
        }
    }
}
exports.CellRangeSelector = CellRangeSelector;

//# sourceMappingURL=cellRangeSelector.js.map
