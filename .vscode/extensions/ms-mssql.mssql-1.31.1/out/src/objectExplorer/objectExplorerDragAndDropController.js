"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectExplorerDragAndDropController = void 0;
const vscode = require("vscode");
class ObjectExplorerDragAndDropController {
    constructor() {
        // Unique identifier for the drag-and-drop controller
        this.dropMimeTypes = ["text/plain"];
        this.dragMimeTypes = ["text/plain"];
    }
    handleDrag(source, dataTransfer, token) {
        const item = source[0]; // Handle only the first item for simplicity
        let objectString = "";
        if (item.metadata) {
            switch (item.metadata.metadataTypeName) {
                case "Table":
                case "StoredProcedure":
                case "View":
                case "UserDefinedFunction":
                    objectString = `[${item.metadata.schema}].[${item.metadata.name}]`;
                    break;
                default:
                    objectString = `[${item.metadata.name}]`;
                    break;
            }
            dataTransfer.set("text/plain", new vscode.DataTransferItem(objectString));
        }
    }
}
exports.ObjectExplorerDragAndDropController = ObjectExplorerDragAndDropController;

//# sourceMappingURL=objectExplorerDragAndDropController.js.map
