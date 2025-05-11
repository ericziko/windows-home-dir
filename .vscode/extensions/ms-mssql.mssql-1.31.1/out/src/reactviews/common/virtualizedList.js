"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualizedList = void 0;
const keys_1 = require("../pages/QueryResult/keys");
const eventManager_1 = require("./eventManager");
const defaultConfig = {
    itemHeight: 20,
    buffer: 5,
};
class VirtualizedList {
    constructor(_container, _items, _renderItem, _itemSelected, _config) {
        this._container = _container;
        this._items = _items;
        this._renderItem = _renderItem;
        this._itemSelected = _itemSelected;
        this._config = _config;
        this._listId = window.crypto.randomUUID();
        this._eventManager = new eventManager_1.EventManager();
        this._focusedItemIndex = 0;
        this._config = Object.assign(Object.assign({}, defaultConfig), _config);
        this._visibleCount =
            Math.ceil(_container.clientHeight / _config.itemHeight) + _config.buffer;
        this._scrollOffset = 0;
        this.init();
    }
    init() {
        // Set container styles
        this._container.style.overflowY = "auto";
        this._container.style.position = "relative";
        this._container.style.height = `${this._visibleCount * this._config.itemHeight}px`;
        // Set total height to create the scroll effect
        const totalHeight = this._items.length * this._config.itemHeight;
        const spacer = document.createElement("div");
        spacer.style.height = `${totalHeight}px`;
        spacer.style.position = "relative";
        this._container.appendChild(spacer);
        // Set up scroll listener
        this._eventManager.addEventListener(this._container, "scroll", () => this.onScroll());
        // Reset focused item index
        this._focusedItemIndex = 0;
        // Render initial items
        this.renderList();
    }
    scrollToIndex(index) {
        const itemTop = index * this._config.itemHeight;
        const itemBottom = itemTop + this._config.itemHeight;
        if (itemTop < this._container.scrollTop) {
            this._container.scrollTop = itemTop;
        }
        else if (itemBottom > this._container.scrollTop + this._container.clientHeight) {
            this._container.scrollTop = itemBottom - this._container.clientHeight;
        }
    }
    updateFocusedItemIndex(newIndex) {
        if (newIndex < 0 || newIndex >= this._items.length) {
            return;
        }
        const oldItem = document.getElementById(`${this._listId}-${this._focusedItemIndex}`);
        if (oldItem) {
            oldItem.setAttribute("tabindex", "-1");
        }
        const newItem = document.getElementById(`${this._listId}-${newIndex}`);
        if (newItem) {
            newItem.setAttribute("tabindex", "0");
        }
        this._focusedItemIndex = newIndex;
        this.scrollToIndex(newIndex);
        newItem === null || newItem === void 0 ? void 0 : newItem.focus();
    }
    onScroll() {
        const newOffset = Math.floor(this._container.scrollTop / this._config.itemHeight);
        if (newOffset !== this._scrollOffset) {
            this._scrollOffset = newOffset;
            this.renderList();
        }
    }
    renderList() {
        const startIndex = Math.max(this._scrollOffset - this._config.buffer, 0);
        const endIndex = Math.min(this._scrollOffset + this._visibleCount + this._config.buffer, this._items.length);
        // Remove existing visible items
        Array.from(this._container.children)
            .filter((child) => child.tagName === "DIV" && child !== this._container.firstChild)
            .forEach((child) => this._container.removeChild(child));
        for (let i = startIndex; i < endIndex; i++) {
            const item = this._items[i];
            const itemDiv = document.createElement("div");
            itemDiv.id = `${this._listId}-${i}`;
            this._renderItem(itemDiv, item);
            itemDiv.style.position = "absolute";
            itemDiv.style.height = `${this._config.itemHeight}px`;
            itemDiv.style.width = "100%";
            itemDiv.style.top = `${i * this._config.itemHeight}px`;
            this._container.appendChild(itemDiv);
            itemDiv.setAttribute("tabindex", i === this._focusedItemIndex ? "0" : "-1");
            // Set up click listener
            this._eventManager.addEventListener(itemDiv, "click", (e) => {
                if (!(e.target instanceof HTMLInputElement)) {
                    this.updateFocusedItemIndex(i);
                    this._itemSelected(itemDiv, item);
                    e.preventDefault();
                }
                e.stopPropagation();
            });
            this._eventManager.addEventListener(itemDiv, "keydown", (e) => {
                const event = e;
                let handled = false;
                if (event.key === keys_1.Keys.ArrowDown) {
                    this.updateFocusedItemIndex(i + 1);
                    handled = true;
                }
                else if (event.key === keys_1.Keys.ArrowUp) {
                    this.updateFocusedItemIndex(i - 1);
                    handled = true;
                }
                else if (event.key === keys_1.Keys.Enter || event.key === keys_1.Keys.Space) {
                    this._itemSelected(itemDiv, item);
                    handled = true;
                }
                if (handled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }
    }
    updateItems(items) {
        this._container.scrollTop = 0;
        this._container.innerHTML = "";
        this._items = items;
        this.init();
    }
    dispose() {
        this._eventManager.clearEventListeners();
        this._container.innerHTML = "";
    }
}
exports.VirtualizedList = VirtualizedList;

//# sourceMappingURL=virtualizedList.js.map
