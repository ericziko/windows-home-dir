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
exports.TableFilterListElement = exports.HeaderFilter = exports.FilterButtonWidth = void 0;
exports.withNullAsUndefined = withNullAsUndefined;
// Adopted and converted to typescript from https://github.com/danny-sg/slickgrid-spreadsheet-plugins/blob/master/ext.headerfilter.js
// heavily modified
const interfaces_1 = require("../interfaces");
const dom_1 = require("../dom");
const dataProvider_1 = require("../dataProvider");
require("../../../../media/table.css");
const locConstants_1 = require("../../../../common/locConstants");
const utils_1 = require("../../../../common/utils");
const virtualizedList_1 = require("../../../../common/virtualizedList");
const eventManager_1 = require("../../../../common/eventManager");
const ShowFilterText = locConstants_1.locConstants.queryResult.showFilter;
const SortAscendingText = locConstants_1.locConstants.queryResult.sortAscending;
exports.FilterButtonWidth = 34;
class HeaderFilter {
    constructor(theme, queryResultContext, webviewState, gridId) {
        this.theme = theme;
        this.queryResultContext = queryResultContext;
        this.webviewState = webviewState;
        this.gridId = gridId;
        this.onFilterApplied = new Slick.Event();
        this.onCommand = new Slick.Event();
        this.enabled = true;
        this.activePopup = null;
        this.handler = new Slick.EventHandler();
        this.columnFilterButtonMapping = new Map();
        this.columnSortStateMapping = new Map();
        this._listData = [];
        this._eventManager = new eventManager_1.EventManager();
        this.currentSortColumn = "";
        this.currentSortButton = null;
    }
    init(grid) {
        this.grid = grid;
        this.handler
            .subscribe(this.grid.onHeaderCellRendered, (e, args) => this.handleHeaderCellRendered(e, args))
            .subscribe(this.grid.onBeforeHeaderCellDestroy, (e, args) => this.handleBeforeHeaderCellDestroy(e, args))
            .subscribe(this.grid.onBeforeDestroy, () => this.destroy());
        // .subscribe(this.grid.onClick, (e: DOMEvent) => this.handleBodyMouseDown(e as MouseEvent))
        // .subscribe(this.grid.onColumnsResized, () => this.columnsResized());
        // addEventListener('click', e => this.handleBodyMouseDown(e));
        // this.disposableStore.add(addDisposableListener(document.body, 'keydown', e => this.handleKeyDown(e)));
    }
    destroy() {
        this.handler.unsubscribeAll();
        this._eventManager.clearEventListeners();
        this._list.dispose();
    }
    handleHeaderCellRendered(_e, args) {
        var _a, _b;
        const column = args.column;
        if (column.filterable === false) {
            return;
        }
        if (args.node.classList.contains("slick-header-with-filter")) {
            // the the filter button has already being added to the header
            return;
        }
        // The default sorting feature is triggered by clicking on the column header, but that is conflicting with query editor grid,
        // For query editor grid when column header is clicked, the entire column will be selected.
        // If the column is not defined as sortable because of the above reason, we will add the sort indicator here.
        if (column.sortable !== true) {
            args.node.classList.add("slick-header-sortable");
            (0, dom_1.append)(args.node, (0, dom_1.$)("span.slick-sort-indicator"));
        }
        const theme = (0, utils_1.resolveVscodeThemeType)(this.theme);
        args.node.classList.add("slick-header-with-filter");
        args.node.classList.add(theme);
        const $filterButton = jQuery(`<button tabindex="-1" id="anchor-btn" aria-label="${ShowFilterText}" title="${ShowFilterText}"></button>`)
            .addClass("slick-header-menubutton")
            .data("column", column);
        const $sortButton = jQuery(`<button tabindex="-1" id="anchor-btn" aria-label="${SortAscendingText}" title="${SortAscendingText} data-column-id=${column.id}"></button>`)
            .addClass("slick-header-sort-button")
            .data("column", column);
        if ((_a = column.filterValues) === null || _a === void 0 ? void 0 : _a.length) {
            this.setFilterButtonImage($filterButton, ((_b = column.filterValues) === null || _b === void 0 ? void 0 : _b.length) > 0);
        }
        if (column.sorted) {
            this.setSortButtonImage($sortButton, column);
            this.columnSortStateMapping.set(column.id, column.sorted);
        }
        const filterButton = $filterButton.get(0);
        if (filterButton) {
            this._eventManager.addEventListener(filterButton, "click", (e) => __awaiter(this, void 0, void 0, function* () {
                e.stopPropagation();
                e.preventDefault();
                yield this.showFilter(filterButton);
                this.grid.onHeaderClick.notify();
            }));
        }
        const sortButton = $sortButton.get(0);
        if (sortButton) {
            this._eventManager.addEventListener(sortButton, "click", (e) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                e.stopPropagation();
                e.preventDefault();
                this.columnDef = jQuery(sortButton).data("column"); //TODO: fix, shouldn't assign in the event handler
                let columnFilterState = {
                    columnDef: this.columnDef.id,
                    filterValues: this.columnDef.filterValues,
                    sorted: (_a = this.columnDef.sorted) !== null && _a !== void 0 ? _a : interfaces_1.SortProperties.NONE,
                };
                let sortState = this.columnSortStateMapping.get(column.id);
                switch (sortState) {
                    case interfaces_1.SortProperties.NONE:
                        if (this.currentSortColumn && this.currentSortButton) {
                            const $prevSortButton = this.currentSortButton;
                            let prevColumnDef = jQuery($prevSortButton).data("column");
                            $prevSortButton.removeClass("slick-header-sortasc-button");
                            $prevSortButton.removeClass("slick-header-sortdesc-button");
                            $prevSortButton.addClass("slick-header-sort-button");
                            this.columnSortStateMapping.set(this.currentSortColumn, interfaces_1.SortProperties.NONE);
                            columnFilterState.sorted = interfaces_1.SortProperties.NONE;
                            let prevFilterState = {
                                columnDef: prevColumnDef.id,
                                filterValues: prevColumnDef.filterValues,
                                sorted: interfaces_1.SortProperties.NONE,
                            };
                            yield this.updateState(prevFilterState, prevColumnDef.id);
                        }
                        $sortButton.removeClass("slick-header-sort-button");
                        $sortButton.addClass("slick-header-sortasc-button");
                        yield this.handleMenuItemClick("sort-asc", column);
                        this.columnSortStateMapping.set(column.id, interfaces_1.SortProperties.ASC);
                        columnFilterState.sorted = interfaces_1.SortProperties.ASC;
                        this.currentSortColumn = column.id;
                        this.currentSortButton = $sortButton;
                        break;
                    case interfaces_1.SortProperties.ASC:
                        $sortButton.removeClass("slick-header-sortasc-button");
                        $sortButton.addClass("slick-header-sortdesc-button");
                        yield this.handleMenuItemClick("sort-desc", column);
                        this.columnSortStateMapping.set(column.id, interfaces_1.SortProperties.DESC);
                        columnFilterState.sorted = interfaces_1.SortProperties.DESC;
                        break;
                    case interfaces_1.SortProperties.DESC:
                        $sortButton.removeClass("slick-header-sortdesc-button");
                        $sortButton.addClass("slick-header-sort-button");
                        this.columnSortStateMapping.set(column.id, interfaces_1.SortProperties.NONE);
                        yield this.handleMenuItemClick("reset", column);
                        columnFilterState.sorted = interfaces_1.SortProperties.NONE;
                        yield this.updateState(columnFilterState, this.columnDef.id);
                        this.currentSortColumn = "";
                        break;
                }
                yield this.updateState(columnFilterState, this.columnDef.id);
                this.grid.onHeaderClick.notify();
            }));
        }
        $sortButton.appendTo(args.node);
        $filterButton.appendTo(args.node);
        this.columnFilterButtonMapping.set(column.id, filterButton);
        if (this.columnSortStateMapping.get(column.id) === undefined) {
            this.columnSortStateMapping.set(column.id, interfaces_1.SortProperties.NONE);
        }
    }
    showFilter(filterButton) {
        return __awaiter(this, void 0, void 0, function* () {
            let $menuButton;
            const target = withNullAsUndefined(filterButton);
            if (target) {
                $menuButton = jQuery(target);
                this.columnDef = $menuButton.data("column");
            }
            // Check if the active popup is for the same button
            if (this.activePopup) {
                const isSameButton = this.activePopup.data("button") === filterButton;
                // close the popup and reset activePopup
                this.activePopup.fadeOut();
                this.activePopup = null;
                if (isSameButton) {
                    return; // Exit since we're just closing the popup for the same button
                }
            }
            // Proceed to open the new popup for the clicked column
            const offset = jQuery(filterButton).offset();
            const $popup = jQuery('<div id="popup-menu" class="slick-header-menu">' +
                `<div style="display: flex; align-items: center; margin-bottom: 8px;">` +
                `<input type="checkbox" id="select-all-checkbox" style="margin-right: 8px;" />` +
                `<input type="text" id="search-input" class="searchbox" placeholder=${locConstants_1.locConstants.queryResult.search}  />` +
                `</div>` +
                `<div id="checkbox-list" class="checkbox-list"></div>` +
                `<button id="apply-${this.columnDef.id}" type="button" class="filter-btn-primary">${locConstants_1.locConstants.queryResult.apply}</button>` +
                `<button id="clear-${this.columnDef.id}" type="button" class="filter-btn">${locConstants_1.locConstants.queryResult.clear}</button>` +
                `<button id="close-popup-${this.columnDef.id}" type="button" class="filter-btn">${locConstants_1.locConstants.queryResult.close}</button>` +
                "</div>");
            const popupElement = $popup.get(0);
            if (popupElement) {
                this._eventManager.addEventListener(document, "click", (_e) => {
                    if ($popup) {
                        const popupElement = $popup.get(0);
                        if (!popupElement.contains(_e.target)) {
                            closePopup($popup);
                            this.activePopup = null;
                        }
                    }
                });
                this._eventManager.addEventListener(window, "blur", (_e) => {
                    if ($popup) {
                        closePopup($popup);
                        this.activePopup = null;
                    }
                });
            }
            if (offset) {
                $popup.css({
                    top: offset.top + ($menuButton === null || $menuButton === void 0 ? void 0 : $menuButton.outerHeight()), // Position below the button
                    left: Math.min(offset.left, document.body.clientWidth - 250), // Position to the left of the button
                });
            }
            yield this.createFilterList();
            // Append and show the new popup
            $popup.appendTo(document.body);
            openPopup($popup);
            // Store the clicked button reference with the popup, so we can check it later
            $popup.data("button", filterButton);
            // Set the new popup as the active popup
            this.activePopup = $popup;
            const checkboxContainer = $popup.find("#checkbox-list");
            this._list = this.createList(checkboxContainer);
            $popup.find("#search-input").on("input", (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const visibleItems = [];
                this._listData.forEach((i) => {
                    i.isVisible = i.displayText.toLowerCase().includes(searchTerm);
                    if (i.isVisible) {
                        visibleItems.push(i);
                    }
                });
                this._list.updateItems(visibleItems);
            });
            $popup.find("#select-all-checkbox").on("change", (e) => {
                const isChecked = e.target.checked;
                this.selectAllFiltered(isChecked);
            });
            // Add event listeners for closing or interacting with the popup
            jQuery(document).on("click", (e) => {
                const $target = jQuery(e.target);
                // If the clicked target is not the button or the menu, close the menu
                if (!$target.closest("#anchor-btn").length && !$target.closest("#popup-menu").length) {
                    if (this.activePopup) {
                        this.activePopup.fadeOut();
                        this.activePopup = null;
                    }
                }
            });
            jQuery(document).on("contextmenu", () => {
                if (this.activePopup) {
                    this.activePopup.fadeOut();
                    this.activePopup = null;
                }
            });
            // Close the pop-up when the close-popup button is clicked
            jQuery(document).on("click", `#close-popup-${this.columnDef.id}`, () => {
                closePopup($popup);
                this.activePopup = null;
            });
            // Sorting button click handlers
            jQuery(document).on("click", "#sort-ascending", (_e) => {
                void this.handleMenuItemClick("sort-asc", this.columnDef);
                closePopup($popup);
                this.activePopup = null;
                this.grid.setSortColumn(this.columnDef.id, true);
                this.columnDef.sorted = interfaces_1.SortProperties.ASC;
            });
            jQuery(document).on("click", "#sort-descending", (_e) => {
                void this.handleMenuItemClick("sort-desc", this.columnDef);
                closePopup($popup);
                this.activePopup = null;
                this.grid.setSortColumn(this.columnDef.id, false);
                this.columnDef.sorted = interfaces_1.SortProperties.DESC;
            });
            jQuery(document).on("click", `#apply-${this.columnDef.id}`, () => __awaiter(this, void 0, void 0, function* () {
                closePopup($popup);
                this.activePopup = null;
                this.applyFilterSelections();
                if (!$menuButton) {
                    return;
                }
                if (this.columnDef.filterValues) {
                    this.setFilterButtonImage($menuButton, this.columnDef.filterValues.length > 0);
                }
                yield this.handleApply(this.columnDef);
            }));
            jQuery(document).on("click", `#clear-${this.columnDef.id}`, () => __awaiter(this, void 0, void 0, function* () {
                if (this.columnDef.filterValues) {
                    this.columnDef.filterValues.length = 0;
                }
                if (!$menuButton) {
                    return;
                }
                this.setFilterButtonImage($menuButton, false);
                yield this.handleApply(this.columnDef, true);
            }));
            function closePopup($popup) {
                $popup.hide({
                    duration: 0,
                });
            }
            function openPopup($popup) {
                $popup.show();
                $popup.find("#sort-ascending").focus();
            }
        });
    }
    createList(checkboxContainer) {
        return new virtualizedList_1.VirtualizedList(checkboxContainer.get(0), this._listData, (itemContainer, item) => {
            itemContainer.style.boxSizing = "border-box";
            itemContainer.style.display = "flex";
            itemContainer.style.alignItems = "center";
            itemContainer.style.padding = "0 5px";
            const id = `checkbox-${item.index}`;
            const checkboxElement = document.createElement("input");
            checkboxElement.type = "checkbox";
            checkboxElement.checked = item.checked;
            checkboxElement.name = item.value;
            checkboxElement.id = id;
            checkboxElement.tabIndex = -1;
            // Attach change listener
            this._eventManager.addEventListener(checkboxElement, "change", () => {
                this._listData[item.index].checked = checkboxElement.checked;
                item.checked = checkboxElement.checked;
            });
            const label = document.createElement("label");
            label.style.flex = "1";
            label.style.overflow = "hidden";
            label.style.textOverflow = "ellipsis";
            label.style.whiteSpace = "nowrap";
            label.innerText = item.displayText;
            label.title = item.displayText;
            label.setAttribute("for", id);
            itemContainer.appendChild(checkboxElement);
            itemContainer.appendChild(label);
        }, (itemDiv, item) => {
            const checkboxElement = itemDiv.querySelector("input[type='checkbox']");
            checkboxElement.checked = !checkboxElement.checked;
            this._listData[item.index].checked = checkboxElement.checked;
            item.checked = checkboxElement.checked;
        }, {
            itemHeight: 30,
            buffer: 5,
        });
    }
    selectAllFiltered(select) {
        for (let i = 0; i < this._listData.length; i++) {
            if (!this._listData[i].isVisible) {
                continue;
            }
            this._listData[i].checked = select;
        }
        this._list.updateItems(this._listData.filter((i) => i.isVisible));
    }
    applyFilterSelections() {
        const selectedValues = this._listData
            .filter((i) => i.checked)
            .map((i) => i.value);
        // Update the column filter values
        this.columnDef.filterValues = selectedValues;
        this.onFilterApplied.notify({
            grid: this.grid,
            column: this.columnDef,
        });
        // Refresh the grid or apply filtering logic based on the selected values
        this.grid.invalidate();
        this.grid.render();
    }
    resetData(columnDef) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataView = this.grid.getData();
            if ((0, dataProvider_1.instanceOfIDisposableDataProvider)(dataView)) {
                yield dataView.filter(this.grid.getColumns());
                this.grid.invalidateAllRows();
                this.grid.updateRowCount();
                this.grid.render();
            }
            this.onFilterApplied.notify({ grid: this.grid, column: columnDef });
            this.setFocusToColumn(columnDef);
        });
    }
    handleApply(columnDef, clear) {
        return __awaiter(this, void 0, void 0, function* () {
            let columnFilterState;
            yield this.resetData(columnDef);
            // clear filterValues if clear is true
            if (clear) {
                columnFilterState = {
                    columnDef: this.columnDef.id,
                    filterValues: [],
                    sorted: interfaces_1.SortProperties.NONE,
                };
                if (this.queryResultContext.state.uri) {
                    // Get the current filters from the query result singleton store
                    let gridColumnMapArray = (yield this.webviewState.extensionRpc.call("getFilters", {
                        uri: this.queryResultContext.state.uri,
                    }));
                    if (!gridColumnMapArray) {
                        gridColumnMapArray = [];
                    }
                    // Drill down into the grid column map array and clear the filter values for the specified column
                    gridColumnMapArray = this.clearFilterValues(gridColumnMapArray, columnDef.id);
                    yield this.webviewState.extensionRpc.call("setFilters", {
                        uri: this.queryResultContext.state.uri,
                        filters: gridColumnMapArray,
                    });
                }
            }
            else {
                columnFilterState = {
                    columnDef: this.columnDef.id,
                    filterValues: this.columnDef.filterValues,
                    sorted: this.columnDef.sorted,
                };
            }
            yield this.updateState(columnFilterState, columnDef.id);
        });
    }
    /**
     * Update the filter state in the query result singleton store
     * @param newState
     * @param columnId
     * @returns
     */
    updateState(newState, columnId) {
        return __awaiter(this, void 0, void 0, function* () {
            let newStateArray;
            // Check if there is any existing filter state
            if (!this.queryResultContext.state.uri) {
                this.queryResultContext.log("no uri set for query result state");
                return;
            }
            let currentFiltersArray = (yield this.webviewState.extensionRpc.call("getFilters", {
                uri: this.queryResultContext.state.uri,
            }));
            if (!currentFiltersArray) {
                currentFiltersArray = [];
            }
            newStateArray = this.combineFilters(currentFiltersArray, newState, columnId);
            yield this.webviewState.extensionRpc.call("setFilters", {
                uri: this.queryResultContext.state.uri,
                filters: newStateArray,
            });
        });
    }
    /**
     * Drill down into the grid column map array and clear the filter values for the specified column
     * @param gridFiltersArray
     * @param columnId
     * @returns
     */
    clearFilterValues(gridFiltersArray, columnId) {
        const targetGridFilters = gridFiltersArray.find((gridFilters) => gridFilters[this.gridId]);
        // Return original array if gridId is not found
        if (!targetGridFilters) {
            return gridFiltersArray;
        }
        // Iterate through each ColumnFilterMap and clear filterValues for the specified columnId
        for (const columnFilterMap of targetGridFilters[this.gridId]) {
            if (columnFilterMap[columnId]) {
                columnFilterMap[columnId] = columnFilterMap[columnId].map((filterState) => (Object.assign(Object.assign({}, filterState), { filterValues: [] })));
            }
        }
        return gridFiltersArray;
    }
    /**
     * Combines two GridColumnMaps into one, keeping filters separate for different gridIds and removing any duplicate filterValues within the same column id
     * @param currentFiltersArray filters array for all grids
     * @param newFilters
     * @param columnId
     * @returns
     */
    combineFilters(gridFiltersArray, newFilterState, columnId) {
        // Find the appropriate GridColumnFilterMap for the gridId
        let targetGridFilters = gridFiltersArray.find((gridFilters) => gridFilters[this.gridId]);
        if (!targetGridFilters) {
            // If no GridColumnFilterMap found for the gridId, create a new one
            targetGridFilters = { [this.gridId]: [] };
            gridFiltersArray.push(targetGridFilters);
        }
        let columnFilterMap = targetGridFilters[this.gridId].find((map) => map[columnId]);
        if (!columnFilterMap) {
            // If no existing ColumnFilterMap for this column, create a new one
            columnFilterMap = { [columnId]: [newFilterState] };
            targetGridFilters[this.gridId].push(columnFilterMap);
        }
        else {
            // Update the existing column filter state
            const filterStates = columnFilterMap[columnId];
            const existingIndex = filterStates.findIndex((filter) => filter.columnDef === newFilterState.columnDef);
            if (existingIndex !== -1) {
                // Replace existing filter state for the column
                filterStates[existingIndex] = newFilterState;
            }
            else {
                // Add new filter state for this column
                filterStates.push(newFilterState);
            }
        }
        return [...gridFiltersArray];
    }
    handleMenuItemClick(command, columnDef) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataView = this.grid.getData();
            if (command === "sort-asc" || command === "sort-desc") {
                this.grid.setSortColumn(columnDef.id, command === "sort-asc");
            }
            if ((0, dataProvider_1.instanceOfIDisposableDataProvider)(dataView)) {
                if (command === "sort-asc" || command === "sort-desc") {
                    yield dataView.sort({
                        grid: this.grid,
                        multiColumnSort: false,
                        sortCol: this.columnDef,
                        sortAsc: command === "sort-asc",
                    });
                }
                else {
                    dataView.resetSort();
                    this.grid.setSortColumn("", false);
                }
                this.grid.invalidateAllRows();
                this.grid.updateRowCount();
                this.grid.render();
            }
            this.onCommand.notify({
                grid: this.grid,
                column: columnDef,
                command: command,
            });
            this.setFocusToColumn(columnDef);
        });
    }
    createFilterList() {
        return __awaiter(this, void 0, void 0, function* () {
            this.columnDef.filterValues = this.columnDef.filterValues || [];
            // WorkingFilters is a copy of the filters to enable apply/cancel behaviour
            const workingFilters = this.columnDef.filterValues.slice(0);
            let filterItems;
            const dataView = this.grid.getData();
            if ((0, dataProvider_1.instanceOfIDisposableDataProvider)(dataView)) {
                filterItems = yield dataView.getColumnValues(this.columnDef);
            }
            else {
                const filterApplied = this.grid.getColumns().findIndex((col) => {
                    var _a;
                    const filterableColumn = col;
                    return ((_a = filterableColumn.filterValues) === null || _a === void 0 ? void 0 : _a.length) > 0;
                }) !== -1;
                if (!filterApplied) {
                    // Filter based all available values
                    filterItems = this.getFilterValues(this.grid.getData(), this.columnDef);
                }
                else {
                    // Filter based on current dataView subset
                    filterItems = this.getAllFilterValues(this.grid.getData().getFilteredItems(), this.columnDef);
                }
            }
            // Sort the list to make it easier to find a string
            filterItems.sort();
            // Promote undefined (NULL) to be always at the top of the list
            const nullValueIndex = filterItems.indexOf("");
            if (nullValueIndex !== -1) {
                filterItems.splice(nullValueIndex, 1);
                filterItems.unshift("");
            }
            this._listData = [];
            for (let i = 0; i < filterItems.length; i++) {
                const filtered = workingFilters.some((x) => x === filterItems[i]);
                // work item to remove the 'Error:' string check: https://github.com/microsoft/azuredatastudio/issues/15206
                const filterItem = filterItems[i];
                if (!filterItem || filterItem.indexOf("Error:") < 0) {
                    let element = new TableFilterListElement(filterItem, filtered);
                    element.index = i;
                    this._listData.push(element);
                }
            }
        });
    }
    getFilterValues(dataView, column) {
        const seen = new Set();
        dataView.getItems().forEach((items) => {
            const value = items[column.field];
            const valueArr = value instanceof Array ? value : [value];
            valueArr.forEach((v) => seen.add(v));
        });
        return Array.from(seen);
    }
    getAllFilterValues(data, column) {
        const seen = new Set();
        data.forEach((items) => {
            const value = items[column.field];
            const valueArr = value instanceof Array ? value : [value];
            valueArr.forEach((v) => seen.add(v));
        });
        return Array.from(seen).sort((v) => {
            return v;
        });
    }
    handleBeforeHeaderCellDestroy(_e, args) {
        jQuery(args.node).find(".slick-header-menubutton").remove();
    }
    setFocusToColumn(columnDef) {
        if (this.grid.getDataLength() > 0) {
            const column = this.grid.getColumns().findIndex((col) => col.id === columnDef.id);
            if (column >= 0) {
                this.grid.setActiveCell(0, column);
            }
        }
    }
    setFilterButtonImage($el, filtered) {
        const element = $el.get(0);
        if (element) {
            if (filtered) {
                element.className += " filtered";
            }
            else {
                const classList = element.classList;
                if (classList.contains("filtered")) {
                    classList.remove("filtered");
                }
            }
        }
    }
    setSortButtonImage($sortButton, column) {
        if ($sortButton && column.sorted && column.sorted !== interfaces_1.SortProperties.NONE) {
            switch (column.sorted) {
                case interfaces_1.SortProperties.ASC:
                    $sortButton.removeClass("slick-header-sort-button");
                    $sortButton.addClass("slick-header-sortasc-button");
                    break;
                case interfaces_1.SortProperties.DESC:
                    $sortButton.removeClass("slick-header-sort-button");
                    $sortButton.addClass("slick-header-sortdesc-button");
                    break;
            }
        }
    }
}
exports.HeaderFilter = HeaderFilter;
class TableFilterListElement {
    constructor(val, checked) {
        this._index = 0;
        this.value = val;
        this._checked = checked;
        this._isVisible = true;
        // Handle the values that are visually hard to differentiate.
        if (val === undefined) {
            this.displayText = locConstants_1.locConstants.queryResult.null;
        }
        else if (val === "") {
            this.displayText = locConstants_1.locConstants.queryResult.blankString;
        }
        else {
            this.displayText = val;
        }
    }
    // public onCheckStateChanged = this._onCheckStateChanged.event;
    get checked() {
        return this._checked;
    }
    set checked(val) {
        if (this._checked !== val) {
            this._checked = val;
        }
    }
    get isVisible() {
        return this._isVisible;
    }
    set isVisible(val) {
        if (this._isVisible !== val) {
            this._isVisible = val;
        }
    }
    get index() {
        return this._index;
    }
    set index(val) {
        if (this._index !== val) {
            this._index = val;
        }
    }
}
exports.TableFilterListElement = TableFilterListElement;
/**
 * Converts null to undefined, passes all other values through.
 */
function withNullAsUndefined(x) {
    return x === null ? undefined : x;
}

//# sourceMappingURL=headerFilter.plugin.js.map
