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
exports.TableDataView = void 0;
exports.defaultCellValueGetter = defaultCellValueGetter;
exports.defaultSort = defaultSort;
exports.defaultFilter = defaultFilter;
exports.isUndefined = isUndefined;
exports.isUndefinedOrNull = isUndefinedOrNull;
exports.compare = compare;
function defaultCellValueGetter(data) {
    return data;
}
function defaultSort(args, data, cellValueGetter = defaultCellValueGetter) {
    if (!args.sortCol || !args.sortCol.field || data.length === 0) {
        return data;
    }
    const field = args.sortCol.field;
    const sign = args.sortAsc ? 1 : -1;
    const comparer = (a, b) => {
        const value1 = cellValueGetter(a[field]);
        const value2 = cellValueGetter(b[field]);
        const num1 = Number(value1);
        const num2 = Number(value2);
        const isValue1Number = !isNaN(num1);
        const isValue2Number = !isNaN(num2);
        // Order: undefined -> number -> string
        if (value1 === undefined || value2 === undefined) {
            return value1 === value2 ? 0 : value1 === undefined ? -1 : 1;
        }
        else if (isValue1Number || isValue2Number) {
            if (isValue1Number && isValue2Number) {
                return num1 === num2 ? 0 : num1 > num2 ? 1 : -1;
            }
            else {
                return isValue1Number ? -1 : 1;
            }
        }
        else {
            return compare(value1, value2);
        }
    };
    return data.sort((a, b) => comparer(a, b) * sign);
}
function defaultFilter(data, columns, cellValueGetter = defaultCellValueGetter) {
    let filteredData = data;
    columns === null || columns === void 0 ? void 0 : columns.forEach((column) => {
        var _a;
        if (((_a = column.filterValues) === null || _a === void 0 ? void 0 : _a.length) > 0 && column.field) {
            filteredData = filteredData.filter((item) => {
                return column.filterValues.includes(cellValueGetter(item[column.field]));
            });
        }
    });
    return filteredData;
}
class TableDataView {
    // private _onFilterStateChange = new vscode.EventEmitter<void>();
    // get onFilterStateChange(): vscode.Event<void> { return this._onFilterStateChange.event; }
    // private _onSortComplete = new vscode.EventEmitter<Slick.OnSortEventArgs<T>>();
    // get onSortComplete(): vscode.Event<Slick.OnSortEventArgs<T>> { return this._onSortComplete.event; }
    constructor(data, _findFn, _sortFn, _filterFn, _cellValueGetter = defaultCellValueGetter) {
        this._findFn = _findFn;
        this._sortFn = _sortFn;
        this._filterFn = _filterFn;
        this._cellValueGetter = _cellValueGetter;
        this._currentColumnFilters = [];
        this._resetSortData = [];
        // this._resetDataUnfiltered = [];
        if (data) {
            this._data = data;
        }
        else {
            this._data = new Array();
        }
        // @todo @anthonydresser 5/1/19 theres a lot we could do by just accepting a regex as a exp rather than accepting a full find function
        this._sortFn = _sortFn
            ? _sortFn
            : (args, data) => {
                return defaultSort(args, data, _cellValueGetter);
            };
        this._filterFn = _filterFn
            ? _filterFn
            : (data, columns) => {
                return defaultFilter(data, columns, _cellValueGetter);
            };
        this._filterEnabled = false;
        this._cellValueGetter = this._cellValueGetter
            ? this._cellValueGetter
            : (cellValue) => cellValue === null || cellValue === void 0 ? void 0 : cellValue.toString();
    }
    get isDataInMemory() {
        return true;
    }
    getRangeAsync(startIndex, length) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._data.slice(startIndex, startIndex + length);
        });
    }
    getColumnValues(column) {
        return __awaiter(this, void 0, void 0, function* () {
            const distinctValues = new Set();
            this._data.forEach((items) => {
                const value = items[column.field];
                const valueArr = value instanceof Array ? value : [value];
                valueArr.forEach((v) => distinctValues.add(this._cellValueGetter(v)));
            });
            return Array.from(distinctValues);
        });
    }
    get filterEnabled() {
        return this._filterEnabled;
    }
    filter(columns) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.filterEnabled) {
                this._allData = new Array(...this._data);
                this._filterEnabled = true;
            }
            this._currentColumnFilters = columns;
            this._data = this._filterFn(this._allData, columns);
            if (this._resetSortData.length > 0) {
                this._resetSortData = this._filterFn(this._resetSortData, columns);
            }
            if (this._data.length === this._allData.length) {
                yield this.clearFilter();
            }
            else {
                console.log("filterstatechange");
                // this._onFilterStateChange.fire();
            }
        });
    }
    clearFilter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filterEnabled) {
                this._data = this._allData;
                if (this._resetSortData.length > 0) {
                    this._resetSortData = new Array(...this._allData);
                }
                this._allData = [];
                this._filterEnabled = false;
                if (this._currentColumnSort) {
                    this._data = this._sortFn({
                        sortCol: this._currentColumnSort.column,
                        sortAsc: this._currentColumnSort.sortDirection === "sort-asc",
                        grid: undefined,
                        multiColumnSort: false,
                    }, this._data);
                }
                // this._onFilterStateChange.fire();
            }
        });
    }
    sort(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._resetSortData.length === 0) {
                this._resetSortData.push(...this._data);
            }
            this._data = this._sortFn(args, this._data);
            this._currentColumnSort = {
                column: args.sortCol,
                sortDirection: args.sortAsc ? "sort-asc" : "sort-desc",
            };
            console.log(args);
            // this._onSortComplete.fire(args);
        });
    }
    // Need to consider multiple scenarios:
    // 1. filter is enabled then sort & unsort,
    // 2. filter is not enabled, sort, then enable filter & unsort
    // 3. filter is enabled then sort, and then disabled
    resetSort() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the current data set is larger than the original data set.
            // If it is, we need to use the full data set and re-apply the current filters.
            if (this._data.length > this._resetSortData.length) {
                this._data = this._allData;
            }
            else {
                this._data = this._resetSortData;
            }
            // if there are filters applied, we need to reapply them to the reset data
            if (this._currentColumnFilters.length > 0) {
                this._data = this._filterFn(this._data, this._currentColumnFilters);
            }
            this._currentColumnSort = undefined;
            this._resetSortData = [];
            // this._resetDataUnfiltered = [];
        });
    }
    getLength() {
        return this._data.length;
    }
    getItem(index) {
        return this._data[index];
    }
    getItems() {
        return this._data.slice();
    }
    getLengthNonFiltered() {
        return this.filterEnabled ? this._allData.length : this._data.length;
    }
    push(input) {
        let inputArray = new Array();
        if (Array.isArray(input)) {
            inputArray.push(...input);
        }
        else {
            inputArray.push(input);
        }
        if (this._filterEnabled) {
            this._allData.push(...inputArray);
            let filteredArray = this._filterFn(inputArray, this._currentColumnFilters);
            if (filteredArray.length !== 0) {
                this._data.push(...filteredArray);
            }
        }
        else {
            this._data.push(...inputArray);
        }
        console.log(this.getLength());
        // this._onRowCountChange.fire(this.getLength());
    }
    clear() {
        this._data = new Array();
        if (this._filterEnabled) {
            this._allData = new Array();
        }
        console.log(this.getLength());
        // this._onRowCountChange.fire(this.getLength());
    }
    find(exp, maxMatches) {
        if (!this._findFn) {
            return Promise.reject(new Error("no find function provided"));
        }
        this._findArray = new Array();
        this._findIndex = 0;
        console.log(this._findArray.length);
        // this._onFindCountChange.fire(this._findArray.length);
        if (exp) {
            return new Promise(() => {
                this._startSearch(exp, maxMatches);
            });
        }
        else {
            return Promise.reject(new Error("no expression"));
        }
    }
    _startSearch(exp, maxMatches = 0) {
        for (let i = 0; i < this._data.length; i++) {
            const item = this._data[i];
            const result = this._findFn(item, exp);
            let breakout = false;
            if (result) {
                for (let j = 0; j < result.length; j++) {
                    const pos = result[j];
                    const index = { col: pos, row: i };
                    this._findArray.push(index);
                    console.log(this._findArray.length);
                    // this._onFindCountChange.fire(this._findArray!.length);
                    if (maxMatches > 0 && this._findArray.length === maxMatches) {
                        breakout = true;
                        break;
                    }
                }
            }
            if (breakout) {
                break;
            }
        }
    }
    clearFind() {
        this._findArray = new Array();
        this._findIndex = 0;
        console.log(this._findArray.length);
        // this._onFindCountChange.fire(this._findArray.length);
    }
    findNext() {
        if (this._findArray && this._findArray.length !== 0) {
            if (this._findIndex === this._findArray.length - 1) {
                this._findIndex = 0;
            }
            else {
                ++this._findIndex;
            }
            return Promise.resolve(this._findArray[this._findIndex]);
        }
        else {
            return Promise.reject(new Error("no search running"));
        }
    }
    findPrevious() {
        if (this._findArray && this._findArray.length !== 0) {
            if (this._findIndex === 0) {
                this._findIndex = this._findArray.length - 1;
            }
            else {
                --this._findIndex;
            }
            return Promise.resolve(this._findArray[this._findIndex]);
        }
        else {
            return Promise.reject(new Error("no search running"));
        }
    }
    get currentFindPosition() {
        if (this._findArray && this._findArray.length !== 0) {
            return Promise.resolve(this._findArray[this._findIndex]);
        }
        else {
            return Promise.reject(new Error("no search running"));
        }
    }
    /* 1 indexed */
    get findPosition() {
        return isUndefinedOrNull(this._findIndex) ? 0 : this._findIndex + 1;
    }
    get findCount() {
        return isUndefinedOrNull(this._findArray) ? 0 : this._findArray.length;
    }
    dispose() {
        this._data = [];
        this._allData = [];
        this._findArray = [];
    }
}
exports.TableDataView = TableDataView;
/**
 * @returns whether the provided parameter is undefined.
 */
function isUndefined(obj) {
    return typeof obj === "undefined";
}
/**
 * @returns whether the provided parameter is undefined or null.
 */
function isUndefinedOrNull(obj) {
    return isUndefined(obj) || obj === null;
}
function compare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else {
        return 0;
    }
}

//# sourceMappingURL=tableDataView.js.map
