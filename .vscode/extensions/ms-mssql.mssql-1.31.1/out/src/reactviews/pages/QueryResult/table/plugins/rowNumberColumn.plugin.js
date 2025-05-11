"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowNumberColumn = void 0;
const objects_1 = require("../objects");
const defaultOptions = {
    autoCellSelection: true,
};
class RowNumberColumn {
    constructor(options) {
        this.options = options;
        this.handler = new Slick.EventHandler();
        this.options = (0, objects_1.mixin)(this.options, defaultOptions, false);
    }
    init(grid) {
        this.grid = grid;
        this.handler
            .subscribe(this.grid.onClick, (e, args) => this.handleClick(e, args))
            .subscribe(this.grid.onHeaderClick, (e, args) => this.handleHeaderClick(e, args));
    }
    destroy() {
        this.handler.unsubscribeAll();
    }
    handleClick(_e, args) {
        var _a;
        if (this.grid.getColumns()[args.cell].id === "rowNumber" &&
            ((_a = this.options) === null || _a === void 0 ? void 0 : _a.autoCellSelection)) {
            this.grid.setActiveCell(args.row, 1);
            if (this.grid.getSelectionModel()) {
                this.grid.setSelectedRows([args.row]);
            }
        }
    }
    handleHeaderClick(_e, args) {
        var _a, _b, _c;
        if (args.column.id === "rowNumber" && ((_a = this.options) === null || _a === void 0 ? void 0 : _a.autoCellSelection)) {
            this.grid.setActiveCell((_c = (_b = this.grid.getViewport()) === null || _b === void 0 ? void 0 : _b.top) !== null && _c !== void 0 ? _c : 0, 1);
            let selectionModel = this.grid.getSelectionModel();
            if (selectionModel) {
                selectionModel.setSelectedRanges([
                    new Slick.Range(0, 0, this.grid.getDataLength() - 1, this.grid.getColumns().length - 1),
                ]);
            }
        }
    }
    getColumnDefinition() {
        var _a;
        // that smallest we can make it is 22 due to padding and margins in the cells
        return {
            id: "rowNumber",
            name: "",
            field: "rowNumber",
            width: 22,
            resizable: true,
            cssClass: (_a = this.options) === null || _a === void 0 ? void 0 : _a.cssClass,
            focusable: false,
            selectable: false,
            filterable: false,
            formatter: (r) => this.formatter(r),
        };
    }
    formatter(row) {
        // row is zero-based, we need make it 1 based for display in the result grid
        return `<span>${row + 1}</span>`;
    }
}
exports.RowNumberColumn = RowNumberColumn;

//# sourceMappingURL=rowNumberColumn.plugin.js.map
