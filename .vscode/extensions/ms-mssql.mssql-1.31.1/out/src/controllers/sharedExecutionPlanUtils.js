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
exports.saveExecutionPlan = saveExecutionPlan;
exports.showPlanXml = showPlanXml;
exports.showQuery = showQuery;
exports.updateTotalCost = updateTotalCost;
exports.createExecutionPlanGraphs = createExecutionPlanGraphs;
exports.calculateTotalCost = calculateTotalCost;
exports.formatXml = formatXml;
const utils_1 = require("../utils/utils");
const os_1 = require("os");
const vscode = require("vscode");
const webview_1 = require("../sharedInterfaces/webview");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const telemetry_2 = require("../telemetry/telemetry");
const constants_1 = require("../constants/constants");
const locConstants_1 = require("../constants/locConstants");
function saveExecutionPlan(state, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        let folder = vscode.Uri.file((0, os_1.homedir)());
        // Show a save dialog to the user
        const saveUri = yield vscode.window.showSaveDialog({
            defaultUri: yield (0, utils_1.getUniqueFilePath)(folder, `plan`, constants_1.sqlPlanLanguageId),
            filters: {
                [locConstants_1.executionPlanFileFilter]: [`${constants_1.sqlPlanLanguageId}`],
            },
        });
        if (saveUri) {
            // Write the content to the new file
            void vscode.workspace.fs.writeFile(saveUri, Buffer.from(payload.sqlPlanContent));
        }
        return state;
    });
}
function showPlanXml(state, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const planXmlDoc = yield vscode.workspace.openTextDocument({
            content: formatXml(payload.sqlPlanContent),
            language: "xml",
        });
        void vscode.window.showTextDocument(planXmlDoc);
        return state;
    });
}
function showQuery(state, payload, untitledSqlDocumentService) {
    return __awaiter(this, void 0, void 0, function* () {
        void untitledSqlDocumentService.newQuery(payload.query);
        return state;
    });
}
function updateTotalCost(state, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return Object.assign(Object.assign({}, state), { executionPlanState: Object.assign(Object.assign({}, state.executionPlanState), { totalCost: (state.executionPlanState.totalCost += payload.addedCost) }) });
    });
}
/**
 * Creates the execution plan graph state from XML, and loads them into `state`
 * @param source the UI making the call, for telemetry purposes.
 */
function createExecutionPlanGraphs(state, executionPlanService, xmlPlans, source) {
    return __awaiter(this, void 0, void 0, function* () {
        let newState = Object.assign({}, state.executionPlanState);
        const startTime = performance.now(); // timer for telemetry
        for (const plan of xmlPlans) {
            const planFile = {
                graphFileContent: plan,
                graphFileType: `.${constants_1.sqlPlanLanguageId}`,
            };
            try {
                newState.executionPlanGraphs = newState.executionPlanGraphs.concat((yield executionPlanService.getExecutionPlan(planFile)).graphs);
                newState.loadState = webview_1.ApiStatus.Loaded;
            }
            catch (e) {
                // malformed xml
                newState.loadState = webview_1.ApiStatus.Error;
                newState.errorMessage = (0, utils_1.getErrorMessage)(e);
            }
        }
        (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.ExecutionPlan, telemetry_1.TelemetryActions.OpenExecutionPlan, {
            source: source,
        }, {
            numberOfPlans: state.executionPlanState.executionPlanGraphs.length,
            loadTimeInMs: performance.now() - startTime,
        });
        state.executionPlanState = newState;
        state.executionPlanState.totalCost = calculateTotalCost(state);
        return state;
    });
}
function calculateTotalCost(state) {
    if (!state.executionPlanState.executionPlanGraphs) {
        state.executionPlanState.loadState = webview_1.ApiStatus.Error;
        return 0;
    }
    let sum = 0;
    for (const graph of state.executionPlanState.executionPlanGraphs) {
        sum += graph.root.cost + graph.root.subTreeCost;
    }
    return sum;
}
function formatXml(xmlContents) {
    try {
        let formattedXml = "";
        let currentLevel = 0;
        const elements = xmlContents.match(/<[^>]*>/g);
        for (const element of elements) {
            if (element.startsWith("</")) {
                // Closing tag: decrement the level
                currentLevel--;
            }
            formattedXml += "\t".repeat(currentLevel) + element + "\n";
            if (element.startsWith("<") && !element.startsWith("</") && !element.endsWith("/>")) {
                // Opening tag: increment the level
                currentLevel++;
            }
        }
        return formattedXml;
    }
    catch (_a) {
        return xmlContents;
    }
}

//# sourceMappingURL=sharedExecutionPlanUtils.js.map
