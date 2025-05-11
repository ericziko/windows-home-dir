"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowSelectionModel = void 0;
const objects_1 = require("../objects");
// Adopted and converted to typescript from https://github.com/6pac/SlickGrid/blob/master/plugins/slick.rowselectionmodel.js
// heavily modified
// import { KeyboardEvent } from 'react';
const defaultOptions = {
    selectActiveRow: true,
};
class RowSelectionModel {
    constructor(options) {
        this._handler = new Slick.EventHandler();
        this._ranges = [];
        this.onSelectedRangesChanged = new Slick.Event();
        this._options = (0, objects_1.mixin)(options, defaultOptions, false);
    }
    init(grid) {
        this._grid = grid;
        this._handler
            .subscribe(this._grid.onActiveCellChanged, (e, data) => this.handleActiveCellChange(e, data))
            .subscribe(this._grid.onKeyDown, (e) => console.log("keydown event", e)) //this.handleKeyDown(console.log('keydown event', e)))
            .subscribe(this._grid.onClick, (e) => this.handleClick(e));
    }
    rangesToRows(ranges) {
        const rows = [];
        for (let i = 0; i < ranges.length; i++) {
            for (let j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                rows.push(j);
            }
        }
        return rows;
    }
    rowsToRanges(rows) {
        const ranges = [];
        const lastCell = this._grid.getColumns().length - 1;
        for (let i = 0; i < rows.length; i++) {
            ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
        }
        return ranges;
    }
    getSelectedRows() {
        return this.rangesToRows(this._ranges);
    }
    setSelectedRows(rows) {
        this.setSelectedRanges(this.rowsToRanges(rows));
    }
    setSelectedRanges(ranges) {
        // simle check for: empty selection didn't change, prevent firing onSelectedRangesChanged
        if ((!this._ranges || this._ranges.length === 0) && (!ranges || ranges.length === 0)) {
            return;
        }
        this._ranges = ranges;
        this.onSelectedRangesChanged.notify(this._ranges);
    }
    getSelectedRanges() {
        return this._ranges;
    }
    // private getRowsRange(from: number, to: number): number[] {
    // 	let i: number, rows: Array<number> = [];
    // 	for (i = from; i <= to; i++) {
    // 		rows.push(i);
    // 	}
    // 	for (i = to; i < from; i++) {
    // 		rows.push(i);
    // 	}
    // 	return rows;
    // }
    handleActiveCellChange(_e, data) {
        if (this._options.selectActiveRow && data.row !== null) {
            this.setSelectedRanges([
                new Slick.Range(data.row, 0, data.row, this._grid.getColumns().length - 1),
            ]);
        }
    }
    // private handleKeyDown(e: StandardKeyboardEvent): void {
    // 	const activeRow = this._grid.getActiveCell();
    // 	if (activeRow && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && (e.keyCode === KeyCode.UpArrow || e.keyCode === KeyCode.DownArrow)) {
    // 		let selectedRows = this.getSelectedRows();
    // 		selectedRows.sort((x, y) => x - y);
    // 		if (!selectedRows.length) {
    // 			selectedRows = [activeRow.row];
    // 		}
    // 		let top = selectedRows[0];
    // 		let bottom = selectedRows[selectedRows.length - 1];
    // 		let active;
    // 		if (e.keyCode === KeyCode.DownArrow) {
    // 			active = activeRow.row < bottom || top === bottom ? ++bottom : ++top;
    // 		} else {
    // 			active = activeRow.row < bottom ? --bottom : --top;
    // 		}
    // 		if (active >= 0 && active < this._grid.getDataLength()) {
    // 			this._grid.scrollRowIntoView(active);
    // 			const tempRanges = this.rowsToRanges(this.getRowsRange(top, bottom));
    // 			this.setSelectedRanges(tempRanges);
    // 		}
    // 		e.preventDefault();
    // 		e.stopPropagation();
    // 	}
    // }
    handleClick(e) {
        const cell = this._grid.getCellFromEvent(e);
        if (!cell || !this._grid.canCellBeActive(cell.row, cell.cell)) {
            return false;
        }
        if (!this._grid.getOptions().multiSelect || (!e.ctrlKey && !e.shiftKey && !e.metaKey)) {
            return false;
        }
        let selection = this.rangesToRows(this._ranges);
        const idx = jQuery.inArray(cell.row, selection);
        if (idx === -1 && (e.ctrlKey || e.metaKey)) {
            selection.push(cell.row);
            this._grid.setActiveCell(cell.row, cell.cell);
        }
        else if (idx !== -1 && (e.ctrlKey || e.metaKey)) {
            selection = selection.filter((o) => o !== cell.row);
            this._grid.setActiveCell(cell.row, cell.cell);
        }
        else if (selection.length && e.shiftKey) {
            const last = selection.pop();
            if (last) {
                const from = Math.min(cell.row, last);
                const to = Math.max(cell.row, last);
                selection = [];
                for (let i = from; i <= to; i++) {
                    if (i !== last) {
                        selection.push(i);
                    }
                }
                selection.push(last);
            }
            this._grid.setActiveCell(cell.row, cell.cell);
        }
        const tempRanges = this.rowsToRanges(selection);
        this.setSelectedRanges(tempRanges);
        e.stopImmediatePropagation();
        return true;
    }
    destroy() {
        this._handler.unsubscribeAll();
    }
}
exports.RowSelectionModel = RowSelectionModel;
// /**
//  * Convert the SlickGrid's keydown event to VSCode standard keyboard event.
//  */
// export function convertJQueryKeyDownEvent(e: Slick.DOMEvent): KeyboardEvent {
// 	return new StandardKeyboardEvent((<any>e as JQuery.KeyDownEvent).originalEvent);
// }

//# sourceMappingURL=rowSelectionModel.plugin.js.map
