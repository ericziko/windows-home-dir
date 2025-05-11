"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.Namespace = exports.Dimension = void 0;
exports.addDisposableListener = addDisposableListener;
exports.$ = $;
exports.append = append;
exports.createStyleSheet = createStyleSheet;
function addDisposableListener(node, type, handler, useCaptureOrOptions) {
    return new DomListener(node, type, handler, useCaptureOrOptions);
}
class DomListener {
    constructor(node, type, handler, options) {
        this._node = node;
        this._type = type;
        this._handler = handler;
        this._options = options || false;
        this._node.addEventListener(this._type, this._handler, this._options);
    }
    dispose() {
        if (!this._handler) {
            // Already disposed
            return;
        }
        this._node.removeEventListener(this._type, this._handler, this._options);
        // Prevent leakers from holding on to the dom or handler func
        this._node = null;
        this._handler = null;
    }
}
class Dimension {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    with(width = this.width, height = this.height) {
        if (width !== this.width || height !== this.height) {
            return new Dimension(width, height);
        }
        else {
            return this;
        }
    }
    static is(obj) {
        return (typeof obj === "object" &&
            typeof obj.height === "number" &&
            typeof obj.width === "number");
    }
    static lift(obj) {
        if (obj instanceof Dimension) {
            return obj;
        }
        else {
            return new Dimension(obj.width, obj.height);
        }
    }
    static equals(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.width === b.width && a.height === b.height;
    }
}
exports.Dimension = Dimension;
Dimension.None = new Dimension(0, 0);
const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
var Namespace;
(function (Namespace) {
    Namespace["HTML"] = "http://www.w3.org/1999/xhtml";
    Namespace["SVG"] = "http://www.w3.org/2000/svg";
})(Namespace || (exports.Namespace = Namespace = {}));
function _$(namespace, description, attrs, ...children) {
    const match = SELECTOR_REGEX.exec(description);
    if (!match) {
        throw new Error("Bad use of emmet");
    }
    const tagName = match[1] || "div";
    let result;
    if (namespace !== Namespace.HTML) {
        result = document.createElementNS(namespace, tagName);
    }
    else {
        result = document.createElement(tagName);
    }
    if (match[3]) {
        result.id = match[3];
    }
    if (match[4]) {
        result.className = match[4].replace(/\./g, " ").trim();
    }
    if (attrs) {
        Object.entries(attrs).forEach(([name, value]) => {
            if (typeof value === "undefined") {
                return;
            }
            if (/^on\w+$/.test(name)) {
                result[name] = value;
            }
            else if (name === "selected") {
                if (value) {
                    result.setAttribute(name, "true");
                }
            }
            else {
                result.setAttribute(name, value);
            }
        });
    }
    result.append(...children);
    return result;
}
function $(description, attrs, ...children) {
    return _$(Namespace.HTML, description, attrs, ...children);
}
function append(parent, ...children) {
    parent.append(...children);
    if (children.length === 1 && typeof children[0] !== "string") {
        return children[0];
    }
}
function createStyleSheet(container = document.getElementsByTagName("head")[0], beforeAppend) {
    const style = document.createElement("style");
    style.type = "text/css";
    style.media = "screen";
    beforeAppend === null || beforeAppend === void 0 ? void 0 : beforeAppend(style);
    container.appendChild(style);
    return style;
}
exports.EventType = {
    // Mouse
    CLICK: "click",
    AUXCLICK: "auxclick",
    DBLCLICK: "dblclick",
    MOUSE_UP: "mouseup",
    MOUSE_DOWN: "mousedown",
    MOUSE_OVER: "mouseover",
    MOUSE_MOVE: "mousemove",
    MOUSE_OUT: "mouseout",
    MOUSE_ENTER: "mouseenter",
    MOUSE_LEAVE: "mouseleave",
    MOUSE_WHEEL: "wheel",
    POINTER_UP: "pointerup",
    POINTER_DOWN: "pointerdown",
    POINTER_MOVE: "pointermove",
    POINTER_LEAVE: "pointerleave",
    CONTEXT_MENU: "contextmenu",
    WHEEL: "wheel",
    // Keyboard
    KEY_DOWN: "keydown",
    KEY_PRESS: "keypress",
    KEY_UP: "keyup",
    // HTML Document
    LOAD: "load",
    BEFORE_UNLOAD: "beforeunload",
    UNLOAD: "unload",
    PAGE_SHOW: "pageshow",
    PAGE_HIDE: "pagehide",
    ABORT: "abort",
    ERROR: "error",
    RESIZE: "resize",
    SCROLL: "scroll",
    FULLSCREEN_CHANGE: "fullscreenchange",
    WK_FULLSCREEN_CHANGE: "webkitfullscreenchange",
    // Form
    SELECT: "select",
    CHANGE: "change",
    SUBMIT: "submit",
    RESET: "reset",
    FOCUS: "focus",
    FOCUS_IN: "focusin",
    FOCUS_OUT: "focusout",
    BLUR: "blur",
    INPUT: "input",
    // Local Storage
    STORAGE: "storage",
    // Drag
    DRAG_START: "dragstart",
    DRAG: "drag",
    DRAG_ENTER: "dragenter",
    DRAG_LEAVE: "dragleave",
    DRAG_OVER: "dragover",
    DROP: "drop",
    DRAG_END: "dragend",
};

//# sourceMappingURL=dom.js.map
