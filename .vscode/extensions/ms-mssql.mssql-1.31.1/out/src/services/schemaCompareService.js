"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaCompareService = void 0;
const schemaCompareContracts = require("../models/contracts/schemaCompare/schemaCompareContracts");
class SchemaCompareService {
    constructor(_client) {
        this._client = _client;
    }
    compare(operationId, sourceEndpointInfo, targetEndpointInfo, taskExecutionMode, deploymentOptions) {
        const params = {
            operationId: operationId,
            sourceEndpointInfo: sourceEndpointInfo,
            targetEndpointInfo: targetEndpointInfo,
            taskExecutionMode: taskExecutionMode,
            deploymentOptions: deploymentOptions,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareRequest.type, params);
    }
    generateScript(operationId, targetServerName, targetDatabaseName, taskExecutionMode) {
        const params = {
            operationId: operationId,
            targetServerName: targetServerName,
            targetDatabaseName: targetDatabaseName,
            taskExecutionMode: taskExecutionMode,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareGenerateScriptRequest.type, params);
    }
    publishDatabaseChanges(operationId, targetServerName, targetDatabaseName, taskExecutionMode) {
        const params = {
            operationId: operationId,
            targetServerName: targetServerName,
            targetDatabaseName: targetDatabaseName,
            taskExecutionMode: taskExecutionMode,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaComparePublishDatabaseChangesRequest.type, params);
    }
    publishProjectChanges(operationId, targetProjectPath, targetFolderStructure, taskExecutionMode) {
        const params = {
            operationId: operationId,
            targetProjectPath: targetProjectPath,
            targetFolderStructure: targetFolderStructure,
            taskExecutionMode: taskExecutionMode,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaComparePublishProjectChangesRequest.type, params);
    }
    schemaCompareGetDefaultOptions() {
        const params = {};
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareGetDefaultOptionsRequest.type, params);
    }
    includeExcludeNode(operationId, diffEntry, includeRequest, taskExecutionMode) {
        const params = {
            operationId: operationId,
            diffEntry: diffEntry,
            includeRequest: includeRequest,
            taskExecutionMode: taskExecutionMode,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareIncludeExcludeNodeRequest.type, params);
    }
    includeExcludeAllNodes(operationId, includeRequest, taskExecutionMode) {
        const params = {
            operationId: operationId,
            includeRequest: includeRequest,
            taskExecutionMode: taskExecutionMode,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareIncludeExcludeAllNodesRequest.type, params);
    }
    openScmp(filePath) {
        const params = {
            filePath: filePath,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareOpenScmpRequest.type, params);
    }
    saveScmp(sourceEndpointInfo, targetEndpointInfo, taskExecutionMode, deploymentOptions, scmpFilePath, excludedSourceObjects, excludedTargetObjects) {
        const params = {
            sourceEndpointInfo: sourceEndpointInfo,
            targetEndpointInfo: targetEndpointInfo,
            taskExecutionMode: taskExecutionMode,
            deploymentOptions: deploymentOptions,
            scmpFilePath: scmpFilePath,
            excludedSourceObjects: excludedSourceObjects,
            excludedTargetObjects: excludedTargetObjects,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareSaveScmpRequest.type, params);
    }
    cancel(operationId) {
        const params = {
            operationId: operationId,
        };
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareCancellationRequest.type, params);
    }
}
exports.SchemaCompareService = SchemaCompareService;

//# sourceMappingURL=schemaCompareService.js.map
