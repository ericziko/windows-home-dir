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
exports.Table = exports.jsonLanguageId = exports.xmlLanguageId = exports.SCROLLBAR_PX = exports.TABLE_ALIGN_PX = exports.ACTIONBAR_WIDTH_PX = exports.MAX_COLUMN_WIDTH_PX = void 0;
exports.isBoolean = isBoolean;
exports.range = range;
// import 'media/table';
// import 'media/slick.grid';
// import 'media/slickColorTheme';
require("../../../media/table.css");
const tableDataView_1 = require("./tableDataView");
const DOM = require("./dom");
const cellSelectionModel_plugin_1 = require("./plugins/cellSelectionModel.plugin");
const objects_1 = require("./objects");
const headerFilter_plugin_1 = require("./plugins/headerFilter.plugin");
const contextMenu_plugin_1 = require("./plugins/contextMenu.plugin");
const copyKeybind_plugin_1 = require("./plugins/copyKeybind.plugin");
const autoColumnSize_plugin_1 = require("./plugins/autoColumnSize.plugin");
const utils_1 = require("../../../common/utils");
// import { MouseWheelSupport } from './plugins/mousewheelTableScroll.plugin';
function getDefaultOptions() {
    return {
        syncColumnCellResize: true,
        enableColumnReorder: false,
        emulatePagingWhenScrolling: false,
    };
}
exports.MAX_COLUMN_WIDTH_PX = 400;
exports.ACTIONBAR_WIDTH_PX = 36;
exports.TABLE_ALIGN_PX = 7;
exports.SCROLLBAR_PX = 15;
exports.xmlLanguageId = "xml";
exports.jsonLanguageId = "json";
class Table {
    constructor(parent, styles, uri, resultSetSummary, webViewState, context, linkHandler, gridId, configuration, options, gridParentRef) {
        this.uri = uri;
        this.resultSetSummary = resultSetSummary;
        this.webViewState = webViewState;
        this.linkHandler = linkHandler;
        this.gridId = gridId;
        this.configuration = configuration;
        this.queryResultContext = context;
        this.linkHandler = linkHandler;
        this.selectionModel = new cellSelectionModel_plugin_1.CellSelectionModel({
            hasRowSelector: true,
        }, webViewState);
        if (!configuration ||
            !configuration.dataProvider ||
            Array.isArray(configuration.dataProvider)) {
            this._data = new tableDataView_1.TableDataView(configuration && configuration.dataProvider);
        }
        else {
            this._data = configuration.dataProvider;
        }
        let newOptions = (0, objects_1.mixin)(options || {}, getDefaultOptions(), false);
        this._container = document.createElement("div");
        this._container.className = "monaco-table";
        DOM.addDisposableListener(this._container, DOM.EventType.FOCUS, () => {
            clearTimeout(this._classChangeTimeout);
            this._classChangeTimeout = setTimeout(() => {
                this._container.classList.add("focused");
            }, 100);
        }, true);
        DOM.addDisposableListener(this._container, DOM.EventType.BLUR, () => {
            clearTimeout(this._classChangeTimeout);
            this._classChangeTimeout = setTimeout(() => {
                this._container.classList.remove("focused");
            }, 100);
        }, true);
        parent.appendChild(this._container);
        this.styleElement = DOM.createStyleSheet(this._container);
        this._tableContainer = document.createElement("div");
        // this._tableContainer.className = //TODO: class name for styles
        let gridParent = gridParentRef === null || gridParentRef === void 0 ? void 0 : gridParentRef.current;
        if (gridParent) {
            this._tableContainer.style.width = `${((gridParent === null || gridParent === void 0 ? void 0 : gridParent.clientWidth) - exports.ACTIONBAR_WIDTH_PX).toString()}px`;
            const height = gridParent === null || gridParent === void 0 ? void 0 : gridParent.clientHeight;
            this._tableContainer.style.height = `${height.toString()}px`;
        }
        this._container.appendChild(this._tableContainer);
        this.styleElement = DOM.createStyleSheet(this._container);
        this._grid = new Slick.Grid(this._tableContainer, this._data, [], newOptions);
        this.registerPlugin(new headerFilter_plugin_1.HeaderFilter(webViewState.themeKind, this.queryResultContext, this.webViewState, gridId));
        this.registerPlugin(new contextMenu_plugin_1.ContextMenu(this.uri, this.resultSetSummary, this.queryResultContext, this.webViewState, this.configuration.dataProvider));
        this.registerPlugin(new copyKeybind_plugin_1.CopyKeybind(this.uri, this.resultSetSummary, this.webViewState, this.configuration.dataProvider));
        this.registerPlugin(new autoColumnSize_plugin_1.AutoColumnSize({
            maxWidth: exports.MAX_COLUMN_WIDTH_PX,
            autoSizeOnRender: this.webViewState.state.autoSizeColumns,
        }, this.webViewState));
        if (configuration && configuration.columns) {
            this.columns = configuration.columns;
        }
        else {
            this.columns = new Array();
        }
        this.idPrefix = this._tableContainer.classList[0];
        this._container.classList.add(this.idPrefix);
        if (configuration && configuration.sorter) {
            this._sorter = configuration.sorter;
            this._grid.onSort.subscribe((_e, args) => {
                this._sorter(args);
                this._grid.invalidate();
                this._grid.render();
            });
        }
        this.setSelectionModel(this.selectionModel);
        this.mapMouseEvent(this._grid.onContextMenu);
        this.mapMouseEvent(this._grid.onClick);
        this.mapMouseEvent(this._grid.onDblClick);
        this._grid.onColumnsResized.subscribe(() => console.log("oncolumnresize"));
        this.style(styles);
        // this.registerPlugin(new MouseWheelSupport());
    }
    /**
     * Load filters from the query result state and apply them to the table
     * @returns true if filters were successfully loaded and applied, false if no filters were found
     */
    setupFilterState() {
        return __awaiter(this, void 0, void 0, function* () {
            let sortColumn = undefined;
            let sortDirection = undefined;
            const filterMapArray = (yield this.webViewState.extensionRpc.call("getFilters", {
                uri: this.queryResultContext.state.uri,
            }));
            if (!filterMapArray) {
                return false;
            }
            const filterMap = filterMapArray.find((filter) => filter[this.gridId]);
            if (!filterMap || !filterMap[this.gridId]) {
                this.queryResultContext.log("No filters found in store");
                return false;
            }
            for (const column of this.columns) {
                for (const columnFilterMap of filterMap[this.gridId]) {
                    if (columnFilterMap[column.id]) {
                        const filterStateArray = columnFilterMap[column.id];
                        filterStateArray.forEach((filterState) => {
                            if (filterState.columnDef === column.field) {
                                column.filterValues = filterState.filterValues;
                            }
                        });
                        let columnSortDirection = columnFilterMap[column.id][0].sorted;
                        if ((columnSortDirection === "ASC" || columnSortDirection === "DESC") &&
                            !sortDirection) {
                            sortColumn = column;
                            column.sorted = columnSortDirection;
                            sortDirection = columnSortDirection === "ASC" ? true : false;
                        }
                    }
                }
            }
            yield this._data.filter(this.columns);
            if (sortDirection !== undefined && sortColumn) {
                let sortArgs = {
                    grid: this._grid,
                    multiColumnSort: false,
                    sortCol: sortColumn,
                    sortAsc: sortDirection,
                };
                yield this._data.sort(sortArgs);
            }
            return true;
        });
    }
    rerenderGrid() {
        this._grid.updateRowCount();
        this._grid.setColumns(this._grid.getColumns());
        this._grid.invalidateAllRows();
        this._grid.render();
    }
    mapMouseEvent(slickEvent) {
        slickEvent.subscribe((e) => {
            const originalEvent = e.originalEvent;
            const cell = this._grid.getCellFromEvent(originalEvent);
            // If event is left click
            if (cell &&
                originalEvent instanceof MouseEvent &&
                originalEvent.button === utils_1.MouseButton.LeftClick) {
                this.handleLinkClick(cell);
            }
        });
    }
    handleLinkClick(cell) {
        const columnInfo = this.resultSetSummary.columnInfo[cell.cell - 1];
        if (!columnInfo) {
            return;
        }
        if (columnInfo.isXml || columnInfo.isJson) {
            this.linkHandler(this.getCellValue(cell.row, cell.cell), columnInfo.isXml ? exports.xmlLanguageId : exports.jsonLanguageId);
        }
    }
    getCellValue(row, column) {
        const rowRef = this._grid.getDataItem(row);
        const col = this._grid.getColumns()[column].field;
        return rowRef[col].displayValue;
    }
    dispose() {
        this._container.remove();
    }
    invalidateRows(rows, keepEditor) {
        this._grid.invalidateRows(rows, keepEditor);
        this._grid.render();
    }
    updateRowCount() {
        this._grid.updateRowCount();
        this._grid.render();
        if (this._autoscroll) {
            this._grid.scrollRowIntoView(this._data.getLength() - 1, false);
        }
        this.ariaRowCount = this.grid.getDataLength();
        this.ariaColumnCount = this.grid.getColumns().length;
    }
    set columns(columns) {
        this._grid.setColumns(columns);
    }
    get grid() {
        return this._grid;
    }
    setData(data) {
        if (data instanceof tableDataView_1.TableDataView) {
            this._data = data;
        }
        else {
            this._data = new tableDataView_1.TableDataView(data);
        }
        this._grid.setData(this._data, true);
        this.updateRowCount();
    }
    getData() {
        return this._data;
    }
    get columns() {
        return this._grid.getColumns();
    }
    setSelectedRows(rows) {
        if (isBoolean(rows)) {
            this._grid.setSelectedRows(range(this._grid.getDataLength()));
        }
        else {
            this._grid.setSelectedRows(rows);
        }
    }
    getSelectedRows() {
        return this._grid.getSelectedRows();
    }
    // onSelectedRowsChanged(fn: (e: Slick.DOMEvent, data: Slick.OnSelectedRowsChangedEventArgs<T>) => any): vscode.Disposable;
    onSelectedRowsChanged(fn) {
        this._grid.onSelectedRowsChanged.subscribe(fn);
        console.log("onselectedrowschanged");
        return;
    }
    setSelectionModel(model) {
        this._grid.setSelectionModel(model);
    }
    getSelectionModel() {
        return this._grid.getSelectionModel();
    }
    getSelectedRanges() {
        let selectionModel = this._grid.getSelectionModel();
        if (selectionModel && selectionModel.getSelectedRanges) {
            return selectionModel.getSelectedRanges();
        }
        return undefined;
    }
    focus() {
        this._grid.focus();
    }
    setActiveCell(row, cell) {
        this._grid.setActiveCell(row, cell);
    }
    get activeCell() {
        return this._grid.getActiveCell();
    }
    registerPlugin(plugin) {
        this._grid.registerPlugin(plugin);
    }
    unregisterPlugin(plugin) {
        this._grid.unregisterPlugin(plugin);
    }
    /**
     * This function needs to be called if the table is drawn off dom.
     */
    resizeCanvas() {
        this._grid.resizeCanvas();
    }
    layout(sizing, orientation) {
        if (sizing instanceof DOM.Dimension) {
            this._container.style.width = sizing.width + "px";
            this._container.style.height = sizing.height + "px";
            this._tableContainer.style.width = sizing.width + "px";
            this._tableContainer.style.height = sizing.height + "px";
        }
        else {
            if (orientation === 0 /* Orientation.VERTICAL */) {
                this._container.style.width = "100%";
                this._container.style.height = sizing + "px";
                this._tableContainer.style.width = "100%";
                this._tableContainer.style.height = sizing + "px";
            }
            else {
                this._container.style.width = sizing + "px";
                this._container.style.height = "100%";
                this._tableContainer.style.width = sizing + "px";
                this._tableContainer.style.height = "100%";
            }
        }
        this.resizeCanvas();
    }
    autosizeColumns() {
        this._grid.autosizeColumns();
    }
    set autoScroll(active) {
        this._autoscroll = active;
    }
    style(styles) {
        const content = [];
        if (styles.tableHeaderBackground) {
            content.push(`.monaco-table .${this.idPrefix} .slick-header .slick-header-column { background-color: ${styles.tableHeaderBackground}; }`);
        }
        if (styles.tableHeaderForeground) {
            content.push(`.monaco-table .${this.idPrefix} .slick-header .slick-header-column { color: ${styles.tableHeaderForeground}; }`);
        }
        if (styles.listFocusBackground) {
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .active { background-color: ${styles.listFocusBackground}; }`);
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .active:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listFocusForeground) {
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .active { color: ${styles.listFocusForeground}; }`);
        }
        if (styles.listActiveSelectionBackground) {
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .selected { background-color: ${styles.listActiveSelectionBackground}; }`);
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listActiveSelectionForeground) {
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .selected { color: ${styles.listActiveSelectionForeground}; }`);
        }
        if (styles.listFocusAndSelectionBackground) {
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .selected.active { background-color: ${styles.listFocusAndSelectionBackground}; }`);
        }
        if (styles.listFocusAndSelectionForeground) {
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .selected.active { color: ${styles.listFocusAndSelectionForeground}; }`);
        }
        if (styles.listInactiveFocusBackground) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row .selected.active { background-color:  ${styles.listInactiveFocusBackground}; }`);
            content.push(`.monaco-table.${this.idPrefix} .slick-row .selected.active:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listInactiveSelectionBackground) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row .selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
            content.push(`.monaco-table.${this.idPrefix} .slick-row .selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listInactiveSelectionForeground) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row .selected { color: ${styles.listInactiveSelectionForeground}; }`);
        }
        if (styles.listHoverBackground) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row:hover { background-color:  ${styles.listHoverBackground}; }`);
            // handle no coloring during drag
            content.push(`.monaco-table.${this.idPrefix} .drag .slick-row:hover { background-color: inherit; }`);
        }
        if (styles.listHoverForeground) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row:hover { color:  ${styles.listHoverForeground}; }`);
            // handle no coloring during drag
            content.push(`.monaco-table.${this.idPrefix} .drag .slick-row:hover { color: inherit; }`);
        }
        if (styles.listSelectionOutline) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row .selected.active { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
        }
        if (styles.listFocusOutline) {
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .selected { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
            content.push(`.monaco-table.${this.idPrefix}.focused .slick-row .selected.active { outline: 2px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
        }
        if (styles.listInactiveFocusOutline) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row .selected .active { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
        }
        if (styles.listHoverOutline) {
            content.push(`.monaco-table.${this.idPrefix} .slick-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
        }
        this.styleElement.innerHTML = content.join("\n");
    }
    setOptions(newOptions) {
        this._grid.setOptions(newOptions);
        this._grid.invalidate();
    }
    setTableTitle(title) {
        this._tableContainer.title = title;
    }
    removeAriaRowCount() {
        this._tableContainer.removeAttribute("aria-rowcount");
    }
    set ariaRowCount(value) {
        this._tableContainer.setAttribute("aria-rowcount", value.toString());
    }
    removeAriaColumnCount() {
        this._tableContainer.removeAttribute("aria-colcount");
    }
    set ariaColumnCount(value) {
        this._tableContainer.setAttribute("aria-colcount", value.toString());
    }
    set ariaRole(value) {
        this._tableContainer.setAttribute("role", value);
    }
    set ariaLabel(value) {
        this._tableContainer.setAttribute("aria-label", value);
    }
    get container() {
        return this._tableContainer;
    }
}
exports.Table = Table;
/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */
function isBoolean(obj) {
    return obj === true || obj === false;
}
function range(arg, to) {
    let from = typeof to === "number" ? arg : 0;
    if (typeof to === "number") {
        from = arg;
    }
    else {
        from = 0;
        to = arg;
    }
    const result = [];
    if (from <= to) {
        for (let i = from; i < to; i++) {
            result.push(i);
        }
    }
    else {
        for (let i = from; i > to; i--) {
            result.push(i);
        }
    }
    return result;
}

//# sourceMappingURL=table.js.map
