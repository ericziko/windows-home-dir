"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncDataProvider = exports.VirtualizedCollection = void 0;
class DataWindow {
    // private cancellationToken = new CancellationTokenSource();
    constructor(loadFunction, placeholderItemGenerator, loadCompleteCallback) {
        this.loadFunction = loadFunction;
        this.placeholderItemGenerator = placeholderItemGenerator;
        this.loadCompleteCallback = loadCompleteCallback;
        this._length = 0;
        this._offsetFromDataSource = -1;
    }
    dispose() {
        this._data = undefined;
        // this.cancellationToken.cancel();
    }
    getStartIndex() {
        return this._offsetFromDataSource;
    }
    getEndIndex() {
        return this._offsetFromDataSource + this._length;
    }
    contains(dataSourceIndex) {
        return dataSourceIndex >= this.getStartIndex() && dataSourceIndex < this.getEndIndex();
    }
    getItem(index) {
        if (!this._data) {
            return this.placeholderItemGenerator(index);
        }
        return this._data[index - this._offsetFromDataSource];
    }
    positionWindow(offset, length) {
        this._offsetFromDataSource = offset;
        this._length = length;
        this._data = undefined;
        // this.cancellationToken.cancel();
        // this.cancellationToken = new CancellationTokenSource();
        // const currentCancellation = this.cancellationToken;
        if (length === 0) {
            return;
        }
        this.loadFunction(offset, length).then((data) => {
            // if (!currentCancellation.token.isCancellationRequested) {
            this._data = data;
            this.loadCompleteCallback(this._offsetFromDataSource, this._offsetFromDataSource + this._length);
            // }
        });
    }
}
class VirtualizedCollection {
    constructor(windowSize, placeHolderGenerator, length, loadFn) {
        this.windowSize = windowSize;
        this.placeHolderGenerator = placeHolderGenerator;
        this.length = length;
        this._lengthChanged = false;
        let loadCompleteCallback = (start, end) => {
            if (this.collectionChangedCallback) {
                this.collectionChangedCallback(start, end - start);
            }
        };
        this._bufferWindowBefore = new DataWindow(loadFn, placeHolderGenerator, loadCompleteCallback);
        this._window = new DataWindow(loadFn, placeHolderGenerator, loadCompleteCallback);
        this._bufferWindowAfter = new DataWindow(loadFn, placeHolderGenerator, loadCompleteCallback);
    }
    setCollectionChangedCallback(callback) {
        this.collectionChangedCallback = callback;
    }
    getLength() {
        return this.length;
    }
    setLength(length) {
        if (this.length !== length) {
            this._lengthChanged = true;
            this.length = length;
        }
    }
    at(index) {
        return this.getRange(index, index + 1)[0];
    }
    getRange(start, end) {
        // current data may contain placeholders
        let currentData = this.getRangeFromCurrent(start, end);
        // only shift window and make promise of refreshed data in following condition:
        if (this._lengthChanged ||
            start < this._bufferWindowBefore.getStartIndex() ||
            end > this._bufferWindowAfter.getEndIndex()) {
            // jump, reset
            this._lengthChanged = false;
            this.resetWindowsAroundIndex(start);
        }
        else if (end <= this._bufferWindowBefore.getEndIndex()) {
            // scroll up, shift up
            let windowToRecycle = this._bufferWindowAfter;
            this._bufferWindowAfter = this._window;
            this._window = this._bufferWindowBefore;
            this._bufferWindowBefore = windowToRecycle;
            let newWindowOffset = Math.max(0, this._window.getStartIndex() - this.windowSize);
            this._bufferWindowBefore.positionWindow(newWindowOffset, this._window.getStartIndex() - newWindowOffset);
        }
        else if (start >= this._bufferWindowAfter.getStartIndex()) {
            // scroll down, shift down
            let windowToRecycle = this._bufferWindowBefore;
            this._bufferWindowBefore = this._window;
            this._window = this._bufferWindowAfter;
            this._bufferWindowAfter = windowToRecycle;
            let newWindowOffset = Math.min(this._window.getStartIndex() + this.windowSize, this.length);
            let newWindowLength = Math.min(this.length - newWindowOffset, this.windowSize);
            this._bufferWindowAfter.positionWindow(newWindowOffset, newWindowLength);
        }
        return currentData;
    }
    getRangeFromCurrent(start, end) {
        const currentData = [];
        for (let i = 0; i < end - start; i++) {
            currentData.push(this.getDataFromCurrent(start + i));
        }
        return currentData;
    }
    getDataFromCurrent(index) {
        if (this._bufferWindowBefore.contains(index)) {
            return this._bufferWindowBefore.getItem(index);
        }
        else if (this._bufferWindowAfter.contains(index)) {
            return this._bufferWindowAfter.getItem(index);
        }
        else if (this._window.contains(index)) {
            return this._window.getItem(index);
        }
        return this.placeHolderGenerator(index);
    }
    resetWindowsAroundIndex(index) {
        let bufferWindowBeforeStart = Math.max(0, index - this.windowSize * 1.5);
        let bufferWindowBeforeEnd = Math.max(0, index - this.windowSize / 2);
        this._bufferWindowBefore.positionWindow(bufferWindowBeforeStart, bufferWindowBeforeEnd - bufferWindowBeforeStart);
        let mainWindowStart = bufferWindowBeforeEnd;
        let mainWindowEnd = Math.min(mainWindowStart + this.windowSize, this.length);
        this._window.positionWindow(mainWindowStart, mainWindowEnd - mainWindowStart);
        let bufferWindowAfterStart = mainWindowEnd;
        let bufferWindowAfterEnd = Math.min(bufferWindowAfterStart + this.windowSize, this.length);
        this._bufferWindowAfter.positionWindow(bufferWindowAfterStart, bufferWindowAfterEnd - bufferWindowAfterStart);
    }
}
exports.VirtualizedCollection = VirtualizedCollection;
class AsyncDataProvider {
    // private _onFilterStateChange = new vscode.EventEmitter<void>();
    // get onFilterStateChange(): vscode.Event<void> { return this._onFilterStateChange.event; }
    // private _onSortComplete = new vscode.EventEmitter<Slick.OnSortEventArgs<T>>();
    // get onSortComplete(): vscode.Event<Slick.OnSortEventArgs<T>> { return this._onSortComplete.event; }
    constructor(dataRows) {
        this.dataRows = dataRows;
    }
    get isDataInMemory() {
        return false;
    }
    getRangeAsync(_startIndex, _length) {
        throw new Error("Method not implemented.");
    }
    getColumnValues(_column) {
        throw new Error("Method not implemented.");
    }
    sort(_options) {
        throw new Error("Method not implemented.");
    }
    filter(_columns) {
        throw new Error("Method not implemented.");
    }
    resetSort() {
        throw new Error("Method not implemented.");
    }
    getLength() {
        return this.dataRows.getLength();
    }
    getItem(index) {
        return this.dataRows.at(index);
    }
    getRange(start, end) {
        return this.dataRows.getRange(start, end);
    }
    set length(length) {
        this.dataRows.setLength(length);
    }
    get length() {
        return this.dataRows.getLength();
    }
    getItems() {
        throw new Error("Method not supported.");
    }
}
exports.AsyncDataProvider = AsyncDataProvider;

//# sourceMappingURL=asyncDataView.js.map
