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
exports.sqlDatabaseProjectsPublishChanges = void 0;
exports.generateOperationId = generateOperationId;
exports.getStartingPathForOpenDialog = getStartingPathForOpenDialog;
exports.showOpenDialog = showOpenDialog;
exports.showOpenDialogForDacpacOrSqlProj = showOpenDialogForDacpacOrSqlProj;
exports.showOpenDialogForScmp = showOpenDialogForScmp;
exports.showSaveDialogForScmp = showSaveDialogForScmp;
exports.showSaveDialog = showSaveDialog;
exports.compare = compare;
exports.generateScript = generateScript;
exports.publishDatabaseChanges = publishDatabaseChanges;
exports.publishProjectChanges = publishProjectChanges;
exports.getDefaultOptions = getDefaultOptions;
exports.includeExcludeNode = includeExcludeNode;
exports.includeExcludeAllNodes = includeExcludeAllNodes;
exports.openScmp = openScmp;
exports.saveScmp = saveScmp;
exports.cancel = cancel;
exports.getSchemaCompareEndpointTypeString = getSchemaCompareEndpointTypeString;
const vscode = require("vscode");
const os = require("os");
const fs_1 = require("fs");
const utils_1 = require("../models/utils");
const locConstants = require("../constants/locConstants");
/**
 * A constant string representing the command to publish schema compare changes
 * for SQL database projects.
 *
 * This command is used to trigger the publishing of project changes in the
 * schema compare feature of the SQL Database Projects extension.
 */
exports.sqlDatabaseProjectsPublishChanges = "sqlDatabaseProjects.schemaComparePublishProjectChanges";
/**
 * Generates a unique operation ID.
 *
 * @returns {string} A new GUID representing the operation ID.
 */
function generateOperationId() {
    return (0, utils_1.generateGuid)();
}
/**
 * Gets the starting file path for an open dialog.
 *
 * This function determines the initial file path to be used when opening a file dialog.
 * If the provided file path exists, it will be used as the starting path. Otherwise,
 * the root path will be used.
 *
 * @param filePath - The file path to check.
 * @returns A promise that resolves to the starting file path.
 */
function getStartingPathForOpenDialog(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const rootPath = getRootPath();
        const startingFilePath = filePath && (yield fileExists(filePath)) ? filePath : rootPath;
        return startingFilePath;
    });
}
/**
 * Retrieves a file path from the user using a file dialog.
 *
 * @param payload - The payload containing the endpoint and file type information.
 * @returns A promise that resolves to the selected file path or undefined if no file was selected.
 */
function showOpenDialog(startingFilePath, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileUris = yield vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: vscode.Uri.file(startingFilePath),
            openLabel: locConstants.SchemaCompare.Open,
            filters: filters,
        });
        if (!fileUris || fileUris.length === 0) {
            return undefined;
        }
        const fileUri = fileUris[0];
        return fileUri.fsPath;
    });
}
function showOpenDialogForDacpacOrSqlProj(filePath, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const startingFilePath = yield getStartingPathForOpenDialog(filePath);
        const selectedFilePath = yield showOpenDialog(startingFilePath, filters);
        return selectedFilePath;
    });
}
function showOpenDialogForScmp() {
    return __awaiter(this, void 0, void 0, function* () {
        const startingFilePath = yield getStartingPathForOpenDialog();
        const fileDialogFilters = {
            "scmp Files": ["scmp"],
        };
        const selectedFilePath = yield showOpenDialog(startingFilePath, fileDialogFilters);
        return selectedFilePath;
    });
}
function showSaveDialogForScmp() {
    return __awaiter(this, void 0, void 0, function* () {
        const startingFilePath = yield getStartingPathForOpenDialog();
        const selectedSavePath = yield showSaveDialog(startingFilePath);
        return selectedSavePath;
    });
}
function showSaveDialog(startingFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = yield vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(startingFilePath),
            saveLabel: locConstants.SchemaCompare.Save,
            filters: {
                "scmp Files": ["scmp"],
            },
        });
        if (!filePath) {
            return undefined;
        }
        return filePath.fsPath;
    });
}
function getRootPath() {
    return vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : os.homedir();
}
function fileExists(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.access(path);
            return true;
        }
        catch (e) {
            return false;
        }
    });
}
/**
 * Compares the schema between the source and target endpoints.
 *
 * @param operationId - The ID of the schema comparison operation.
 * @param taskExecutionMode - The mode of task execution.
 * @param payload - The payload containing the comparison parameters.
 * @param schemaCompareService - The service used to perform the schema comparison.
 * @returns A promise that resolves to the result of the schema comparison.
 */
function compare(operationId, taskExecutionMode, payload, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.compare(operationId, payload.sourceEndpointInfo, payload.targetEndpointInfo, taskExecutionMode, payload.deploymentOptions);
        return result;
    });
}
/**
 * Generates a deploy script for the schema comparison operation.
 *
 * @param operationId - The ID of the schema comparison operation.
 * @param payload - The payload containing parameters for generating the script.
 * @param schemaCompareService - The service used to perform schema comparison operations.
 * @returns A promise that resolves to the result status of the script generation operation.
 */
function generateScript(operationId, taskExecutionMode, payload, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.generateScript(operationId, payload.targetServerName, payload.targetDatabaseName, taskExecutionMode);
        return result;
    });
}
/**
 * Publishes the database changes script using the provided schema compare service.
 *
 * @param operationId - The ID of the schema comparison operation.
 * @param payload - The payload containing the details required to publish the database changes.
 * @param schemaCompareService - The service used to perform schema compare operations.
 * @returns A promise that resolves to the result status of the publish operation.
 */
function publishDatabaseChanges(operationId, taskExecutionMode, payload, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.publishDatabaseChanges(operationId, payload.targetServerName, payload.targetDatabaseName, taskExecutionMode);
        return result;
    });
}
/**
 * Publishes the changes script from a schema compare operation to a database project.
 *
 * @param operationId - The ID of the schema comparison operation.
 * @param payload - The payload containing the details required to publish the project changes.
 * @param schemaCompareService - The service used to perform schema compare operations.
 * @returns A promise that resolves to the result of the publish project changes operation.
 */
function publishProjectChanges(operationId, payload, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.publishProjectChanges(operationId, payload.targetProjectPath, payload.targetFolderStructure, payload.taskExecutionMode);
        return result;
    });
}
/**
 * Retrieves the default schema compare options from the provided schema compare service.
 *
 * @param schemaCompareService - The service used to get the default schema compare options.
 * @returns A promise that resolves to the default schema compare options result.
 */
function getDefaultOptions(schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.schemaCompareGetDefaultOptions();
        return result;
    });
}
/**
 * Includes or excludes a node in the schema comparison.
 *
 * @param operationId - The ID of the schema comparison operation.
 * @param taskExecutionMode - The mode of task execution.
 * @param payload - The payload containing the details for including or excluding the node.
 * @param schemaCompareService - The service used to perform the include/exclude operation.
 * @returns A promise that resolves to the result of the include/exclude operation.
 */
function includeExcludeNode(operationId, taskExecutionMode, payload, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.includeExcludeNode(operationId, payload.diffEntry, payload.includeRequest, taskExecutionMode);
        return result;
    });
}
/**
 * Includes or excludes a node in the schema comparison.
 *
 * @param operationId - The ID of the schema comparison operation.
 * @param taskExecutionMode - The mode of task execution.
 * @param payload - The payload containing the details for including or excluding the node.
 * @param schemaCompareService - The service used to perform the include/exclude operation.
 * @returns A promise that resolves to the result of the include/exclude operation.
 */
function includeExcludeAllNodes(operationId, taskExecutionMode, payload, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.includeExcludeAllNodes(operationId, payload.includeRequest, taskExecutionMode);
        return result;
    });
}
/**
 * Opens a schema compare (.scmp) file and returns the result.
 *
 * @param filePath - The path to the .scmp file to be opened.
 * @param schemaCompareService - The service used to open the .scmp file.
 * @returns A promise that resolves to the result of opening the .scmp file.
 */
function openScmp(filePath, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.openScmp(filePath);
        return result;
    });
}
/**
 * Saves the schema compare (.scmp) file with the provided parameters.
 *
 * @param sourceEndpointInfo - Information about the source endpoint.
 * @param targetEndpointInfo - Information about the target endpoint.
 * @param taskExecutionMode - The mode in which the task is executed.
 * @param deploymentOptions - Options for the deployment.
 * @param scmpFilePath - The file path where the .scmp file will be saved.
 * @param excludedSourceObjects - List of source objects to be excluded.
 * @param excludedTargetObjects - List of target objects to be excluded.
 * @param schemaCompareService - The schema compare service used to save the .scmp file.
 * @returns A promise that resolves to the result status of the save operation.
 */
function saveScmp(sourceEndpointInfo, targetEndpointInfo, taskExecutionMode, deploymentOptions, scmpFilePath, excludedSourceObjects, excludedTargetObjects, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.saveScmp(sourceEndpointInfo, targetEndpointInfo, taskExecutionMode, deploymentOptions, scmpFilePath, excludedSourceObjects, excludedTargetObjects);
        return result;
    });
}
/**
 * Cancels an ongoing schema comparison operation.
 *
 * @param operationId - The ID of the schema comparison operation to cancel.
 * @param schemaCompareService - The service used to perform schema comparison operations.
 * @returns A promise that resolves to the result status of the cancel operation.
 */
function cancel(operationId, schemaCompareService) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemaCompareService.cancel(operationId);
        return result;
    });
}
/**
 * Returns a string representation of the given SchemaCompareEndpointType.
 *
 * @param endpointType - The type of the schema compare endpoint.
 * @returns A string representing the schema compare endpoint type.
 *          Possible values are "Database", "Dacpac", "Project", or "Unknown: {endpointType}".
 */
function getSchemaCompareEndpointTypeString(endpointType) {
    switch (endpointType) {
        case 0 /* mssql.SchemaCompareEndpointType.Database */:
            return "Database";
        case 1 /* mssql.SchemaCompareEndpointType.Dacpac */:
            return "Dacpac";
        case 2 /* mssql.SchemaCompareEndpointType.Project */:
            return "Project";
        default:
            return `Unknown: ${endpointType}`;
    }
}

//# sourceMappingURL=schemaCompareUtils.js.map
