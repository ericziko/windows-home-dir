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
exports.HybridDataProvider = void 0;
const asyncDataView_1 = require("./asyncDataView");
const tableDataView_1 = require("./tableDataView");
/**
 * Used to abstract the underlying data provider, based on the options, if we are allowing in-memory data processing and the threshold is not reached the
 * a TableDataView will be used to provide in memory data source, otherwise it will be using the async data provider.
 */
class HybridDataProvider {
    // private _onFilterStateChange = new vscode.EventEmitter<void>();
    // get onFilterStateChange(): vscode.Event<void> { return this._onFilterStateChange.event; }
    // private _onSortComplete = new vscode.EventEmitter<Slick.OnSortEventArgs<T>>();
    // get onSortComplete(): vscode.Event<Slick.OnSortEventArgs<T>> { return this._onSortComplete.event; }
    constructor(dataRows, _loadDataFn, valueGetter, _options, filterFn, sortFn) {
        this._loadDataFn = _loadDataFn;
        this._options = _options;
        this._dataCached = false;
        this._asyncDataProvider = new asyncDataView_1.AsyncDataProvider(dataRows);
        this._tableDataProvider = new tableDataView_1.TableDataView(undefined, undefined, sortFn, filterFn, valueGetter);
        // this._asyncDataProvider.onFilterStateChange(() => {
        // 	// this._onFilterStateChange.fire();
        // });
        // this._asyncDataProvider.onSortComplete((args) => {
        // 	// this._onSortComplete.fire(args);
        // });
        // this._tableDataProvider.onFilterStateChange(() => {
        // 	this._onFilterStateChange.fire();
        // });
        // this._tableDataProvider.onSortComplete((args) => {
        // 	this._onSortComplete.fire(args);
        // });
    }
    get isDataInMemory() {
        return this._dataCached;
    }
    getRangeAsync(startIndex, length) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.provider.getRangeAsync(startIndex, length);
        });
    }
    getColumnValues(column) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeCacheIfNeeded();
            return this.provider.getColumnValues(column);
        });
    }
    get dataRows() {
        return this._asyncDataProvider.dataRows;
    }
    set dataRows(value) {
        this._asyncDataProvider.dataRows = value;
    }
    getLength() {
        return this.provider.getLength();
    }
    getItem(index) {
        return this.provider.getItem(index);
    }
    getItems() {
        throw new Error("Method not implemented.");
    }
    get length() {
        return this.provider.getLength();
    }
    set length(value) {
        this._asyncDataProvider.length = value;
    }
    filter(columns) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeCacheIfNeeded();
            void this.provider.filter(columns);
        });
    }
    sort(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeCacheIfNeeded();
            void this.provider.sort(options);
        });
    }
    resetSort() {
        return __awaiter(this, void 0, void 0, function* () {
            void this.provider.resetSort();
        });
    }
    get thresholdReached() {
        return (this._options.inMemoryDataCountThreshold !== undefined &&
            this.length > this._options.inMemoryDataCountThreshold);
    }
    get provider() {
        return this._dataCached ? this._tableDataProvider : this._asyncDataProvider;
    }
    initializeCacheIfNeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._options.inMemoryDataProcessing) {
                return;
            }
            if (this.thresholdReached) {
                return;
            }
            if (!this._dataCached) {
                const data = yield this._loadDataFn(0, this.length);
                this._dataCached = true;
                this._tableDataProvider.push(data);
            }
        });
    }
}
exports.HybridDataProvider = HybridDataProvider;

//# sourceMappingURL=hybridDataProvider.js.map
