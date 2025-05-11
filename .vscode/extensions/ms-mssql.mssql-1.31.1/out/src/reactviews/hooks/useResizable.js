"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResizable = void 0;
const react_1 = require("react");
/**
 * A custom hook that provides resizing functionality for components
 */
const useResizable = (options = {}) => {
    const { minHeight = 100, maxHeight, initialHeight = 200, onResize, siblingRef } = options;
    const [height, setHeight] = (0, react_1.useState)(initialHeight);
    const elementRef = (0, react_1.useRef)(null);
    const startPositionRef = (0, react_1.useRef)(0);
    const startHeightRef = (0, react_1.useRef)(0);
    const resizingRef = (0, react_1.useRef)(false);
    const handleMouseDown = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        resizingRef.current = true;
        startPositionRef.current = e.clientY;
        startHeightRef.current = height;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }, [height]);
    const handleMouseMove = (0, react_1.useCallback)((e) => {
        if (!resizingRef.current)
            return;
        const deltaY = e.clientY - startPositionRef.current;
        let newHeight = startHeightRef.current + deltaY;
        if (minHeight)
            newHeight = Math.max(newHeight, minHeight);
        if (maxHeight)
            newHeight = Math.min(newHeight, maxHeight);
        setHeight(newHeight);
    }, [minHeight, maxHeight]);
    // Separate effect to handle onResize callback and dispatch resize event
    (0, react_1.useEffect)(() => {
        var _a;
        if (onResize) {
            onResize(height);
        }
        // If we have a sibling element, adjust its size accordingly
        if ((siblingRef === null || siblingRef === void 0 ? void 0 : siblingRef.current) && elementRef.current) {
            const containerHeight = ((_a = elementRef.current.parentElement) === null || _a === void 0 ? void 0 : _a.clientHeight) || 0;
            const remainingHeight = containerHeight - height - 8; // 8px for margin/padding
            siblingRef.current.style.height = `${Math.max(remainingHeight, minHeight)}px`;
        }
        // Dispatch a resize event to notify other components
        const resizeEvent = new Event("resize");
        window.dispatchEvent(resizeEvent);
    }, [height, onResize, siblingRef, minHeight]);
    const handleMouseUp = (0, react_1.useCallback)(() => {
        if (!resizingRef.current)
            return;
        resizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove]);
    (0, react_1.useEffect)(() => {
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    return {
        ref: elementRef,
        height,
        resizerProps: {
            onMouseDown: handleMouseDown,
            style: {
                cursor: "ns-resize",
                height: "8px",
                width: "100%",
                backgroundColor: "transparent",
                position: "absolute",
                bottom: 0,
                left: 0,
                zIndex: 10,
            },
        },
    };
};
exports.useResizable = useResizable;

//# sourceMappingURL=useResizable.js.map
