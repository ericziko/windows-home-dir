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
exports.TableDesignerService = void 0;
const tableDesigner_1 = require("../models/contracts/tableDesigner");
class TableDesignerService {
    constructor(_sqlToolsClient) {
        this._sqlToolsClient = _sqlToolsClient;
    }
    initializeTableDesigner(table) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(tableDesigner_1.InitializeTableDesignerRequest.type, table);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    processTableEdit(table, tableChangeInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(tableDesigner_1.ProcessTableDesignerEditRequest.type, {
                    tableInfo: table,
                    tableChangeInfo: tableChangeInfo,
                });
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    publishChanges(table) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(tableDesigner_1.PublishTableDesignerChangesRequest.type, table);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    generateScript(table) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(tableDesigner_1.TableDesignerGenerateScriptRequest.type, table);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    generatePreviewReport(table) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(tableDesigner_1.TableDesignerGenerateChangePreviewReportRequest.type, table);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    disposeTableDesigner(table) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(tableDesigner_1.DisposeTableDesignerRequest.type, table);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
}
exports.TableDesignerService = TableDesignerService;

//# sourceMappingURL=tableDesignerService.js.map
