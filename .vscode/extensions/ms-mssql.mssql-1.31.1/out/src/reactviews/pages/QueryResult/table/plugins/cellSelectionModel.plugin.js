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
exports.CellSelectionModel = void 0;
exports.selectionSummaryHelper = selectionSummaryHelper;
// Drag select selection model gist taken from https://gist.github.com/skoon/5312536
// heavily modified
const cellRangeSelector_1 = require("./cellRangeSelector");
// import { convertJQueryKeyDownEvent } from 'sql/base/browser/dom';
const tableDataView_1 = require("../tableDataView");
const objects_1 = require("../objects");
const react_components_1 = require("@fluentui/react-components");
const keys_1 = require("../../keys");
const defaults = {
    hasRowSelector: false,
};
class CellSelectionModel {
    constructor(options = defaults, webViewState) {
        this.options = options;
        this.ranges = [];
        this._handler = new Slick.EventHandler();
        this.onSelectedRangesChanged = new Slick.Event();
        this.webViewState = webViewState;
        this.options = (0, objects_1.mixin)(this.options, defaults, false);
        if (this.options.cellRangeSelector) {
            this.selector = this.options.cellRangeSelector;
        }
        else {
            // this is added by the node requires above
            this.selector = new cellRangeSelector_1.CellRangeSelector({
                selectionCss: {
                    border: `3px dashed ${react_components_1.tokens.colorStrokeFocus1}`,
                },
            });
        }
    }
    init(grid) {
        this.grid = grid;
        this.isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        this._handler.subscribe(this.grid.onKeyDown, (e) => this.handleKeyDown(e));
        this._handler.subscribe(this.grid.onAfterKeyboardNavigation, (_e) => this.handleAfterKeyboardNavigationEvent());
        this._handler.subscribe(this.grid.onClick, (e, args) => __awaiter(this, void 0, void 0, function* () { return yield this.handleCellClick(e, args); }));
        this._handler.subscribe(this.grid.onHeaderClick, (e, args) => this.handleHeaderClick(e, args));
        this.grid.registerPlugin(this.selector);
        this._handler.subscribe(this.selector.onCellRangeSelected, (e, range) => __awaiter(this, void 0, void 0, function* () { return yield this.handleCellRangeSelected(e, range, false); }));
        this._handler.subscribe(this.selector.onAppendCellRangeSelected, (e, range) => __awaiter(this, void 0, void 0, function* () { return yield this.handleCellRangeSelected(e, range, true); }));
        this._handler.subscribe(this.selector.onBeforeCellRangeSelected, (e, cell) => this.handleBeforeCellRangeSelected(e, cell));
    }
    destroy() {
        this._handler.unsubscribeAll();
        this.grid.unregisterPlugin(this.selector);
    }
    removeInvalidRanges(ranges) {
        let result = [];
        for (let i = 0; i < ranges.length; i++) {
            let r = ranges[i];
            if (this.grid.canCellBeSelected(r.fromRow, r.fromCell) &&
                this.grid.canCellBeSelected(r.toRow, r.toCell)) {
                result.push(r);
            }
            else if (this.grid.canCellBeSelected(r.fromRow, r.fromCell + 1) &&
                this.grid.canCellBeSelected(r.toRow, r.toCell)) {
                // account for number row
                result.push(new Slick.Range(r.fromRow, r.fromCell + 1, r.toRow, r.toCell));
            }
        }
        return result;
    }
    setSelectedRanges(ranges) {
        // simple check for: empty selection didn't change, prevent firing onSelectedRangesChanged
        if ((!this.ranges || this.ranges.length === 0) && (!ranges || ranges.length === 0)) {
            return;
        }
        this.ranges = this.removeInvalidRanges(ranges);
        this.onSelectedRangesChanged.notify(this.ranges);
        this.webViewState.state.selection = JSON.parse(JSON.stringify(this.ranges));
        // Adjust selection to account for number column
        this.webViewState.state.selection.forEach((range) => {
            range.fromCell = range.fromCell - 1;
            range.toCell = range.toCell - 1;
        });
    }
    getSelectedRanges() {
        return this.ranges;
    }
    handleBeforeCellRangeSelected(e, _args) {
        if (this.grid.getEditorLock().isActive()) {
            e.stopPropagation();
            return false;
        }
        return true;
    }
    handleCellRangeSelected(_e, range, append) {
        return __awaiter(this, void 0, void 0, function* () {
            this.grid.setActiveCell(range.fromRow, range.fromCell, false, false, true);
            if (append) {
                this.setSelectedRanges(this.insertIntoSelections(this.getSelectedRanges(), range));
            }
            else {
                this.setSelectedRanges([range]);
            }
            yield this.setSelectionSummaryText(true);
        });
    }
    isMultiSelection(_e) {
        return this.isMac ? _e.metaKey : _e.ctrlKey;
    }
    handleHeaderClick(e, args) {
        var _a, _b, _c, _d;
        if (e.target) {
            if (e.target.className === "slick-resizable-handle") {
                return;
            }
        }
        if (!args) {
            return;
        }
        if (!(0, tableDataView_1.isUndefinedOrNull)(args.column)) {
            const columnIndex = this.grid.getColumnIndex(args.column.id);
            const rowCount = this.grid.getDataLength();
            const columnCount = this.grid.getColumns().length;
            const currentActiveCell = this.grid.getActiveCell();
            let newActiveCell = undefined;
            if (this.options.hasRowSelector && columnIndex === 0) {
                // When the row selector's header is clicked, all cells should be selected
                this.setSelectedRanges([new Slick.Range(0, 1, rowCount - 1, columnCount - 1)]);
                // The first data cell in the view should be selected.
                newActiveCell = {
                    row: (_b = (_a = this.grid.getViewport()) === null || _a === void 0 ? void 0 : _a.top) !== null && _b !== void 0 ? _b : 0,
                    cell: 1,
                };
            }
            else if (this.grid.canCellBeSelected(0, columnIndex)) {
                // When SHIFT is pressed, all the columns between active cell's column and target column should be selected
                const newlySelectedRange = e.shiftKey && currentActiveCell
                    ? new Slick.Range(0, currentActiveCell.cell, rowCount - 1, columnIndex)
                    : new Slick.Range(0, columnIndex, rowCount - 1, columnIndex);
                // When CTRL is pressed, we need to merge the new selection with existing selections
                const rangesToBeMerged = this.isMultiSelection(e)
                    ? this.getSelectedRanges()
                    : [];
                const result = this.insertIntoSelections(rangesToBeMerged, newlySelectedRange);
                this.setSelectedRanges(result);
                // The first data cell of the target column in the view should be selected.
                newActiveCell = {
                    row: (_d = (_c = this.grid.getViewport()) === null || _c === void 0 ? void 0 : _c.top) !== null && _d !== void 0 ? _d : 0,
                    cell: columnIndex,
                };
            }
            if (newActiveCell) {
                this.grid.setActiveCell(newActiveCell.row, newActiveCell.cell);
            }
        }
    }
    /**
     * DO NOT CALL THIS DIRECTLY - GO THROUGH INSERT INTO SELECTIONS
     *
     */
    mergeSelections(ranges, range) {
        // New ranges selection
        let newRanges = [];
        // Have we handled this value
        let handled = false;
        for (let current of ranges) {
            // We've already processed everything. Add everything left back to the list.
            if (handled) {
                newRanges.push(current);
                continue;
            }
            let newRange = undefined;
            // if the ranges are the same.
            if (current.fromRow === range.fromRow &&
                current.fromCell === range.fromCell &&
                current.toRow === range.toRow &&
                current.toCell === range.toCell) {
                // If we're actually not going to handle it during this loop
                // this region will be added with the handled boolean check
                continue;
            }
            // Rows are the same - horizontal merging of the selection area
            if (current.fromRow === range.fromRow && current.toRow === range.toRow) {
                // Check if the new region is adjacent to the old selection group
                if (range.toCell + 1 === current.fromCell ||
                    range.fromCell - 1 === current.toCell) {
                    handled = true;
                    let fromCell = Math.min(range.fromCell, current.fromCell, range.toCell, current.toCell);
                    let toCell = Math.max(range.fromCell, current.fromCell, range.toCell, current.toCell);
                    newRange = new Slick.Range(range.fromRow, fromCell, range.toRow, toCell);
                }
                // Cells are the same - vertical merging of the selection area
            }
            else if (current.fromCell === range.fromCell && current.toCell === range.toCell) {
                // Check if the new region is adjacent to the old selection group
                if (range.toRow + 1 === current.fromRow || range.fromRow - 1 === current.toRow) {
                    handled = true;
                    let fromRow = Math.min(range.fromRow, current.fromRow, range.fromRow, current.fromRow);
                    let toRow = Math.max(range.toRow, current.toRow, range.toRow, current.toRow);
                    newRange = new Slick.Range(fromRow, range.fromCell, toRow, range.toCell);
                }
            }
            if (newRange) {
                newRanges.push(newRange);
            }
            else {
                newRanges.push(current);
            }
        }
        if (!handled) {
            newRanges.push(range);
        }
        return {
            newRanges,
            handled,
        };
    }
    insertIntoSelections(ranges, range) {
        let result = this.mergeSelections(ranges, range);
        let newRanges = result.newRanges;
        // Keep merging the rows until we stop having changes
        let i = 0;
        while (true) {
            if (i++ > 10000) {
                throw new Error("InsertIntoSelection infinite loop");
            }
            let shouldContinue = false;
            for (let current of newRanges) {
                result = this.mergeSelections(newRanges, current);
                if (result.handled) {
                    shouldContinue = true;
                    newRanges = result.newRanges;
                    break;
                }
            }
            if (shouldContinue) {
                continue;
            }
            break;
        }
        return newRanges;
    }
    handleCellClick(e, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeCell = this.grid.getActiveCell();
            const columns = this.grid.getColumns();
            const isRowSelectorClicked = this.options.hasRowSelector && args.cell === 0;
            let newlySelectedRange;
            // The selection is a range when there is an active cell and the SHIFT key is pressed.
            if (activeCell !== undefined && e.shiftKey) {
                // When the row selector cell is clicked, the new selection is all rows from current active row to target row.
                // Otherwise, the new selection is the cells in the rectangle between current active cell and target cell.
                newlySelectedRange = isRowSelectorClicked
                    ? new Slick.Range(activeCell.row, columns.length - 1, args.row, 1)
                    : new Slick.Range(activeCell.row, activeCell.cell, args.row, args.cell);
            }
            else {
                // If the row selector cell is clicked, the new selection is all the cells in the target row.
                // Otherwise, the new selection is the target cell
                newlySelectedRange = isRowSelectorClicked
                    ? new Slick.Range(args.row, 1, args.row, columns.length - 1)
                    : new Slick.Range(args.row, args.cell, args.row, args.cell);
            }
            // When the CTRL key is pressed, we need to merge the new selection with the existing selections.
            const rangesToBeMerged = this.isMultiSelection(e)
                ? this.getSelectedRanges()
                : [];
            const result = this.insertIntoSelections(rangesToBeMerged, newlySelectedRange);
            this.setSelectedRanges(result);
            // Find out the new active cell
            // If the row selector is clicked, the first data cell in the row should be the new active cell,
            // otherwise, the target cell should be the new active cell.
            const newActiveCell = isRowSelectorClicked
                ? { cell: 1, row: args.row }
                : { cell: args.cell, row: args.row };
            this.grid.setActiveCell(newActiveCell.row, newActiveCell.cell);
            yield this.setSelectionSummaryText();
        });
    }
    handleSelectAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let ranges;
            let startColumn = 0;
            // check for number column
            if (!(0, tableDataView_1.isUndefinedOrNull)(this.grid.getColumns()[0].selectable) &&
                !this.grid.getColumns()[0].selectable) {
                startColumn = 1;
            }
            ranges = [
                new Slick.Range(0, startColumn, this.grid.getDataLength() - 1, this.grid.getColumns().length - 1),
            ];
            this.setSelectedRanges(ranges);
        });
    }
    handleKeyDown(e) {
        return __awaiter(this, void 0, void 0, function* () {
            let handled = false;
            if (this.isMac) {
                // Cmd + A
                if (e.metaKey && e.key === keys_1.Keys.a) {
                    handled = true;
                    yield this.handleSelectAll();
                }
            }
            else {
                if (e.ctrlKey && e.key === keys_1.Keys.a) {
                    handled = true;
                    yield this.handleSelectAll();
                }
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    setSelectionSummaryText(isSelection) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.webViewState.extensionRpc.call("setSelectionSummary", {
                summary: yield selectionSummaryHelper(this.getSelectedRanges(), this.grid, isSelection),
            });
        });
    }
    // private handleKeyDown(e: StandardKeyboardEvent) {
    // 	let active = this.grid.getActiveCell();
    // 	let metaKey = e.ctrlKey || e.metaKey;
    // 	if (active && e.shiftKey && !metaKey && !e.altKey &&
    // 		(e.keyCode === KeyCode.LeftArrow || e.keyCode === KeyCode.RightArrow || e.keyCode === KeyCode.UpArrow || e.keyCode === KeyCode.DownArrow)) {
    // 		let ranges = this.getSelectedRanges(), last: Slick.Range;
    // 		ranges = this.getSelectedRanges();
    // 		if (!ranges.length) {
    // 			ranges.push(new Slick.Range(active.row, active.cell));
    // 		}
    // 		// keyboard can work with last range only
    // 		last = ranges.pop()!; // this is guarenteed since if ranges is empty we add one
    // 		// can't handle selection out of active cell
    // 		if (!last.contains(active.row, active.cell)) {
    // 			last = new Slick.Range(active.row, active.cell);
    // 		}
    // 		let dRow = last.toRow - last.fromRow,
    // 			dCell = last.toCell - last.fromCell,
    // 			// walking direction
    // 			dirRow = active.row === last.fromRow ? 1 : -1,
    // 			dirCell = active.cell === last.fromCell ? 1 : -1;
    // 		if (e.keyCode === KeyCode.LeftArrow) {
    // 			dCell -= dirCell;
    // 		} else if (e.keyCode === KeyCode.RightArrow) {
    // 			dCell += dirCell;
    // 		} else if (e.keyCode === KeyCode.UpArrow) {
    // 			dRow -= dirRow;
    // 		} else if (e.keyCode === KeyCode.DownArrow) {
    // 			dRow += dirRow;
    // 		}
    // 		// define new selection range
    // 		let new_last = new Slick.Range(active.row, active.cell, active.row + dirRow * dRow, active.cell + dirCell * dCell);
    // 		if (this.removeInvalidRanges([new_last]).length) {
    // 			ranges.push(new_last);
    // 			let viewRow = dirRow > 0 ? new_last.toRow : new_last.fromRow;
    // 			let viewCell = dirCell > 0 ? new_last.toCell : new_last.fromCell;
    // 			this.grid.scrollRowIntoView(viewRow, false);
    // 			this.grid.scrollCellIntoView(viewRow, viewCell, false);
    // 		} else {
    // 			ranges.push(last);
    // 		}
    // 		this.setSelectedRanges(ranges);
    // 		e.preventDefault();
    // 		e.stopPropagation();
    // 	}
    // }
    handleAfterKeyboardNavigationEvent() {
        const activeCell = this.grid.getActiveCell();
        if (activeCell) {
            this.setSelectedRanges([new Slick.Range(activeCell.row, activeCell.cell)]);
        }
    }
}
exports.CellSelectionModel = CellSelectionModel;
// Public for testing
function selectionSummaryHelper(selectedRanges, grid, isSelection) {
    return __awaiter(this, void 0, void 0, function* () {
        let summary = {
            count: -1,
            distinctCount: -1,
            nullCount: -1,
            removeSelectionStats: !isSelection,
        };
        if (isSelection) {
            const firstRange = selectedRanges[0];
            if (!firstRange)
                return summary;
            const column = grid.getColumns()[firstRange.fromCell];
            if (!column)
                return summary;
            const values = [];
            let nullCount = 0;
            let numCount = 0;
            let sum = 0;
            let min = Infinity;
            let max = -Infinity;
            for (let row = firstRange.fromRow; row <= firstRange.toRow; row++) {
                for (let col = firstRange.fromCell; col <= firstRange.toCell; col++) {
                    const cell = grid.getCellNode(row, col);
                    if (!cell)
                        continue;
                    const value = cell.innerText;
                    if (value === "NULL") {
                        nullCount++;
                    }
                    else if (!isNaN(Number(value))) {
                        numCount++;
                        min = Math.min(min, Number(value));
                        max = Math.max(max, Number(value));
                        sum += Number(value);
                    }
                    values.push(value);
                }
            }
            const count = values.length;
            const distinctCount = new Set(values).size;
            if (numCount) {
                // format average into decimal, up to three places, with no trailing zeros
                const average = (sum / numCount).toFixed(3).replace(/\.?0+$/, "");
                summary = {
                    average: average,
                    count: count,
                    distinctCount: distinctCount,
                    max: max,
                    min: min,
                    nullCount: nullCount,
                    sum: sum,
                    removeSelectionStats: false,
                };
            }
            else {
                summary = {
                    count: count,
                    distinctCount: distinctCount,
                    nullCount: nullCount,
                    removeSelectionStats: false,
                };
            }
        }
        return summary;
    });
}

//# sourceMappingURL=cellSelectionModel.plugin.js.map
