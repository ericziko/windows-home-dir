"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndoRedoStack = void 0;
/**
 * SimpleUndoRedoStack - A lightweight TypeScript implementation of an undo/redo system
 *
 * This version avoids deep object cloning and comparison for better performance,
 * assuming state objects are treated as immutable.
 */
class UndoRedoStack {
    /**
     * Create a new SimpleUndoRedoStack instance
     * @param maxSize - Maximum number of states to remember (optional)
     */
    constructor(maxSize = 100) {
        this.undoStack = [];
        this.redoStack = [];
        this.currentState = null;
        this.maxSize = maxSize;
    }
    /**
     * Get the current state
     */
    getCurrentState() {
        return this.currentState;
    }
    /**
     * Set the initial state (without pushing to the stack)
     */
    setInitialState(state) {
        this.currentState = state;
        this.clearHistory();
    }
    /**
     * Push a new state onto the stack
     * @param newState - The new state to push
     * @param undoAction - Optional custom undo action
     */
    pushState(newState, undoAction) {
        const previousState = this.currentState;
        // Do a deep comparison to check if the state has changed
        if (JSON.stringify(previousState) === JSON.stringify(newState)) {
            // No change, do not push to stack
            return;
        }
        // Store the action that can undo/redo this change
        this.undoStack.push({
            undo: undoAction || (() => previousState),
            redo: () => newState,
        });
        // Update current state
        this.currentState = newState;
        // Clear the redo stack as a new action breaks the redo chain
        this.redoStack = [];
        // Trim the stack if it exceeds the maximum size
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
    }
    /**
     * Check if undo operation is available
     */
    canUndo() {
        return this.undoStack.length > 0;
    }
    /**
     * Check if redo operation is available
     */
    canRedo() {
        return this.redoStack.length > 0;
    }
    /**
     * Perform an undo operation
     * @returns The previous state, or null if cannot undo
     */
    undo() {
        if (!this.canUndo()) {
            return null;
        }
        const action = this.undoStack.pop();
        const prevState = action.undo();
        const current = this.currentState;
        this.redoStack.push({
            undo: () => current, // capture at time of undo
            redo: action.redo,
        });
        this.currentState = prevState;
        return prevState;
    }
    /**
     * Perform a redo operation
     * @returns The next state, or null if cannot redo
     */
    redo() {
        if (!this.canRedo()) {
            return null;
        }
        const action = this.redoStack.pop();
        const nextState = action.redo();
        const current = this.currentState;
        this.undoStack.push({
            undo: () => current,
            redo: () => nextState,
        });
        this.currentState = nextState;
        return nextState;
    }
    /**
     * Clear all history (undo and redo stacks)
     */
    clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
    }
    /**
     * Get the current stack sizes
     */
    getStackSizes() {
        return {
            undoSize: this.undoStack.length,
            redoSize: this.redoStack.length,
        };
    }
}
exports.UndoRedoStack = UndoRedoStack;

//# sourceMappingURL=undoRedoStack.js.map
