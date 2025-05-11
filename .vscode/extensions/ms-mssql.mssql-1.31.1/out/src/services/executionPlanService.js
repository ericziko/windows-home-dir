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
exports.ExecutionPlanService = void 0;
const executionPlan_1 = require("../models/contracts/executionPlan");
class ExecutionPlanService {
    constructor(_sqlToolsClient) {
        this._sqlToolsClient = _sqlToolsClient;
    }
    getExecutionPlan(planFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let params = {
                    graphInfo: planFile,
                };
                return yield this._sqlToolsClient.sendRequest(executionPlan_1.GetExecutionPlanRequest.type, params);
            }
            catch (e) {
                this._sqlToolsClient.logger.error(e);
                throw e;
            }
        });
    }
}
exports.ExecutionPlanService = ExecutionPlanService;

//# sourceMappingURL=executionPlanService.js.map
