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
exports.SchemaDesignerWebviewManager = void 0;
const schemaDesignerWebviewController_1 = require("./schemaDesignerWebviewController");
class SchemaDesignerWebviewManager {
    static getInstance() {
        if (!this.instance) {
            this.instance = new SchemaDesignerWebviewManager();
        }
        return this.instance;
    }
    constructor() {
        this.schemaDesigners = new Map();
        // Private constructor to prevent instantiation
    }
    getSchemaDesigner(context, vscodeWrapper, mainController, schemaDesignerService, databaseName, treeNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionInfo = treeNode.connectionInfo;
            connectionInfo.database = databaseName;
            const connectionDetails = yield mainController.connectionManager.createConnectionDetails(connectionInfo);
            yield mainController.connectionManager.confirmEntraTokenValidity(connectionInfo);
            const connectionString = yield mainController.connectionManager.getConnectionString(connectionDetails, true, true);
            const key = `${connectionString}-${databaseName}`;
            if (!this.schemaDesigners.has(key)) {
                const schemaDesigner = new schemaDesignerWebviewController_1.SchemaDesignerWebviewController(context, vscodeWrapper, mainController, schemaDesignerService, connectionString, connectionInfo.azureAccountToken, databaseName, treeNode);
                schemaDesigner.onDisposed(() => {
                    this.schemaDesigners.delete(key);
                });
                this.schemaDesigners.set(key, schemaDesigner);
            }
            return this.schemaDesigners.get(key);
        });
    }
}
exports.SchemaDesignerWebviewManager = SchemaDesignerWebviewManager;

//# sourceMappingURL=schemaDesignerWebviewManager.js.map
