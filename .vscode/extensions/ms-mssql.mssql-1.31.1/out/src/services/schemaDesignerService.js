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
exports.SchemaDesignerService = void 0;
const schemaDesigner_1 = require("../models/contracts/schemaDesigner");
class SchemaDesignerService {
    constructor(_sqlToolsClient) {
        this._sqlToolsClient = _sqlToolsClient;
        this._modelReadyListeners = [];
        this.setUpEventListeners();
    }
    setUpEventListeners() {
        this._sqlToolsClient.onNotification(schemaDesigner_1.SchemaDesignerRequests.SchemaReady.type, (result) => {
            this._modelReadyListeners.forEach((listener) => listener(result));
        });
    }
    createSession(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(schemaDesigner_1.SchemaDesignerRequests.CreateSession.type, request);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    disposeSession(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._sqlToolsClient.sendRequest(schemaDesigner_1.SchemaDesignerRequests.DisposeSession.type, request);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    generateScript(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(schemaDesigner_1.SchemaDesignerRequests.GenerateScript.type, request);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    publishSession(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._sqlToolsClient.sendRequest(schemaDesigner_1.SchemaDesignerRequests.PublishSession.type, request);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    getReport(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._sqlToolsClient.sendRequest(schemaDesigner_1.SchemaDesignerRequests.GetReport.type, request);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
    onSchemaReady(listener) {
        this._modelReadyListeners.push(listener);
    }
}
exports.SchemaDesignerService = SchemaDesignerService;

//# sourceMappingURL=schemaDesignerService.js.map
