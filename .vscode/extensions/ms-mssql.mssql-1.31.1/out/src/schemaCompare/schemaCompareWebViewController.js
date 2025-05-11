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
exports.SchemaCompareWebViewController = void 0;
const vscode = require("vscode");
const utils = require("../models/utils");
const objectExplorerUtils_1 = require("../objectExplorer/objectExplorerUtils");
const reactWebviewPanelController_1 = require("../controllers/reactWebviewPanelController");
const treeNodeInfo_1 = require("../objectExplorer/treeNodeInfo");
const schemaCompareUtils_1 = require("./schemaCompareUtils");
const telemetry_1 = require("../telemetry/telemetry");
const telemetry_2 = require("../sharedInterfaces/telemetry");
const utils_1 = require("../models/utils");
const util_1 = require("util");
const locConstants = require("../constants/locConstants");
class SchemaCompareWebViewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, node, schemaCompareService, connectionMgr, schemaCompareOptionsResult, title) {
        super(context, vscodeWrapper, "schemaCompare", "schemaCompare", {
            isSqlProjectExtensionInstalled: false,
            isComparisonInProgress: false,
            isIncludeExcludeAllOperationInProgress: false,
            activeServers: {},
            databases: [],
            defaultDeploymentOptionsResult: schemaCompareOptionsResult,
            intermediaryOptionsResult: undefined,
            endpointsSwitched: false,
            auxiliaryEndpointInfo: undefined,
            sourceEndpointInfo: undefined,
            targetEndpointInfo: undefined,
            scmpSourceExcludes: [],
            scmpTargetExcludes: [],
            originalSourceExcludes: new Map(),
            originalTargetExcludes: new Map(),
            sourceTargetSwitched: false,
            schemaCompareResult: undefined,
            generateScriptResultStatus: undefined,
            publishDatabaseChangesResultStatus: undefined,
            schemaComparePublishProjectResult: undefined,
            schemaCompareIncludeExcludeResult: undefined,
            schemaCompareOpenScmpResult: undefined,
            saveScmpResultStatus: undefined,
            cancelResultStatus: undefined,
        }, {
            title: title,
            viewColumn: vscode.ViewColumn.Active,
            iconPath: {
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "schemaCompare_dark.svg"),
                light: vscode.Uri.joinPath(context.extensionUri, "media", "schemaCompare_light.svg"),
            },
        });
        this.schemaCompareService = schemaCompareService;
        this.connectionMgr = connectionMgr;
        this.operationId = (0, schemaCompareUtils_1.generateOperationId)();
        if (node && !this.isTreeNodeInfoType(node)) {
            node = this.getFullSqlProjectsPathFromNode(node);
        }
        void this.start(node);
        this.registerRpcHandlers();
        this.connectionMgr.onActiveConnectionsChanged(() => {
            const activeServers = this.getActiveServersList();
            this.state.activeServers = activeServers;
            this.updateState();
        });
    }
    /**
     * Starts the schema comparison process. Schema compare can get started with four contexts for the source:
     * 1. undefined
     * 2. Connection profile
     * 3. Dacpac
     * 4. Project
     * @param sourceContext can be undefined, connection profile, dacpac, or project.
     * @param comparisonResult Result of a previous comparison, if available.
     */
    start(sourceContext_1) {
        return __awaiter(this, arguments, void 0, function* (sourceContext, comparisonResult = undefined) {
            let source;
            let connectionProfile = sourceContext
                ? sourceContext.connectionInfo
                : undefined;
            if (connectionProfile) {
                source = yield this.getEndpointInfoFromConnectionProfile(connectionProfile, sourceContext);
            }
            else if (sourceContext &&
                sourceContext &&
                sourceContext.endsWith(".dacpac")) {
                source = this.getEndpointInfoFromDacpac(sourceContext);
            }
            else if (sourceContext) {
                source = yield this.getEndpointInfoFromProject(sourceContext);
            }
            yield this.launch(source, undefined, false, comparisonResult);
        });
    }
    /**
     * Primary functional entrypoint for opening the schema comparison window, and optionally running it.
     * @param source
     * @param target
     * @param runComparison whether to immediately run the schema comparison.  Requires both source and target to be specified.  Cannot be true when comparisonResult is set.
     * @param comparisonResult a pre-computed schema comparison result to display.  Cannot be set when runComparison is true.
     */
    launch(source_1, target_1) {
        return __awaiter(this, arguments, void 0, function* (source, target, runComparison = false, comparisonResult) {
            if (runComparison && comparisonResult) {
                throw new Error("Cannot both pass a comparison result and request a new comparison be run.");
            }
            this.state.sourceEndpointInfo = source;
            this.state.targetEndpointInfo = target;
            this.updateState(this.state);
        });
    }
    getEndpointInfoFromConnectionProfile(connectionProfile, sourceContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let ownerUri = yield this.connectionMgr.getUriForConnection(connectionProfile);
            let user = connectionProfile.user;
            if (!user) {
                user = locConstants.SchemaCompare.defaultUserName;
            }
            const source = {
                endpointType: 0 /* mssql.SchemaCompareEndpointType.Database */,
                serverDisplayName: `${connectionProfile.server} (${user})`,
                serverName: connectionProfile.server,
                databaseName: objectExplorerUtils_1.ObjectExplorerUtils.getDatabaseName(sourceContext),
                ownerUri: ownerUri,
                packageFilePath: "",
                connectionDetails: undefined,
                connectionName: connectionProfile.profileName ? connectionProfile.profileName : "",
                projectFilePath: "",
                targetScripts: [],
                dataSchemaProvider: "",
                extractTarget: 5 /* mssql.ExtractTarget.schemaObjectType */,
            };
            return source;
        });
    }
    getEndpointInfoFromDacpac(sourceDacpac) {
        const source = {
            endpointType: 1 /* mssql.SchemaCompareEndpointType.Dacpac */,
            serverDisplayName: "",
            serverName: "",
            databaseName: "",
            ownerUri: "",
            packageFilePath: sourceDacpac,
            connectionDetails: undefined,
            projectFilePath: "",
            targetScripts: [],
            dataSchemaProvider: "",
            extractTarget: 5 /* mssql.ExtractTarget.schemaObjectType */,
        };
        return source;
    }
    getEndpointInfoFromProject(projectFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = {
                endpointType: 2 /* mssql.SchemaCompareEndpointType.Project */,
                projectFilePath: projectFilePath,
                extractTarget: 5 /* mssql.ExtractTarget.schemaObjectType */,
                targetScripts: yield this.getProjectScriptFiles(projectFilePath),
                dataSchemaProvider: yield this.getDatabaseSchemaProvider(projectFilePath),
                serverDisplayName: "",
                serverName: "",
                databaseName: "",
                ownerUri: "",
                packageFilePath: "",
                connectionDetails: undefined,
            };
            return source;
        });
    }
    getProjectScriptFiles(projectFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let scriptFiles = [];
            const databaseProjectsExtension = vscode.extensions.getExtension("ms-mssql.sql-database-projects-vscode");
            if (databaseProjectsExtension) {
                scriptFiles = yield (yield databaseProjectsExtension.activate()).getProjectScriptFiles(projectFilePath);
            }
            return scriptFiles;
        });
    }
    getDatabaseSchemaProvider(projectFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let provider = "";
            const databaseProjectsExtension = vscode.extensions.getExtension("ms-mssql.sql-database-projects-vscode");
            if (databaseProjectsExtension) {
                provider = yield (yield databaseProjectsExtension.activate()).getProjectDatabaseSchemaProvider(projectFilePath);
            }
            return provider;
        });
    }
    isTreeNodeInfoType(node) {
        if (node instanceof treeNodeInfo_1.TreeNodeInfo) {
            return true;
        }
        return false;
    }
    getFullSqlProjectsPathFromNode(node) {
        var _a, _b, _c, _d;
        return (_d = (_c = (_b = (_a = node.treeDataProvider) === null || _a === void 0 ? void 0 : _a.roots[0]) === null || _b === void 0 ? void 0 : _b.projectFileUri) === null || _c === void 0 ? void 0 : _c.fsPath) !== null && _d !== void 0 ? _d : "";
    }
    registerRpcHandlers() {
        this.registerReducer("isSqlProjectExtensionInstalled", (state) => __awaiter(this, void 0, void 0, function* () {
            const extension = vscode.extensions.getExtension("ms-mssql.sql-database-projects-vscode");
            if (extension) {
                if (!extension.isActive) {
                    yield extension.activate();
                }
                state.isSqlProjectExtensionInstalled = true;
            }
            else {
                state.isSqlProjectExtensionInstalled = false;
            }
            this.updateState(state);
            return state;
        }));
        this.registerReducer("listActiveServers", (state) => {
            const activeServers = this.getActiveServersList();
            state.activeServers = activeServers;
            this.updateState(state);
            return state;
        });
        this.registerReducer("listDatabasesForActiveServer", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            let databases = [];
            try {
                databases = yield this.connectionMgr.listDatabases(payload.connectionUri);
            }
            catch (error) {
                console.error("Error listing databases:", error);
            }
            state.databases = databases;
            this.updateState(state);
            return state;
        }));
        this.registerReducer("openAddNewConnectionDialog", (state) => {
            vscode.commands.executeCommand("mssql.addObjectExplorerPreview");
            return state;
        });
        this.registerReducer("selectFile", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            let endpointFilePath = "";
            if (payload.endpoint) {
                endpointFilePath =
                    payload.endpoint.packageFilePath || payload.endpoint.projectFilePath;
            }
            const filters = {
                Files: [payload.fileType],
            };
            const filePath = yield (0, schemaCompareUtils_1.showOpenDialogForDacpacOrSqlProj)(endpointFilePath, filters);
            if (filePath) {
                const updatedEndpointInfo = payload.fileType === "dacpac"
                    ? this.getEndpointInfoFromDacpac(filePath)
                    : yield this.getEndpointInfoFromProject(filePath);
                state.auxiliaryEndpointInfo = updatedEndpointInfo;
                if (payload.fileType === "sqlproj") {
                    if (payload.endpointType === "target") {
                        state.auxiliaryEndpointInfo.extractTarget =
                            5 /* mssql.ExtractTarget.schemaObjectType */;
                    }
                }
                this.updateState(state);
            }
            return state;
        }));
        this.registerReducer("confirmSelectedSchema", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (payload.endpointType === "source") {
                state.sourceEndpointInfo = state.auxiliaryEndpointInfo;
            }
            else {
                if (state.auxiliaryEndpointInfo) {
                    state.targetEndpointInfo = state.auxiliaryEndpointInfo;
                }
                if (((_a = state.targetEndpointInfo) === null || _a === void 0 ? void 0 : _a.endpointType) ===
                    2 /* mssql.SchemaCompareEndpointType.Project */) {
                    state.targetEndpointInfo.extractTarget = this.mapExtractTargetEnum(payload.folderStructure);
                }
            }
            state.auxiliaryEndpointInfo = undefined;
            this.updateState(state);
            return state;
        }));
        this.registerReducer("confirmSelectedDatabase", (state, payload) => {
            const connection = this.connectionMgr.activeConnections[payload.serverConnectionUri];
            const connectionProfile = connection.credentials;
            let user = connectionProfile.user;
            if (!user) {
                user = locConstants.SchemaCompare.defaultUserName;
            }
            const endpointInfo = {
                endpointType: 0 /* mssql.SchemaCompareEndpointType.Database */,
                serverDisplayName: `${connectionProfile.server} (${user})`,
                serverName: connectionProfile.server,
                databaseName: payload.databaseName,
                ownerUri: payload.serverConnectionUri,
                packageFilePath: "",
                connectionDetails: undefined,
                connectionName: connectionProfile.profileName ? connectionProfile.profileName : "",
                projectFilePath: "",
                targetScripts: [],
                dataSchemaProvider: "",
                extractTarget: 5 /* mssql.ExtractTarget.schemaObjectType */,
            };
            if (payload.endpointType === "source") {
                state.sourceEndpointInfo = endpointInfo;
            }
            else {
                state.targetEndpointInfo = endpointInfo;
            }
            this.updateState(state);
            return state;
        });
        this.registerReducer("setIntermediarySchemaOptions", (state) => __awaiter(this, void 0, void 0, function* () {
            state.intermediaryOptionsResult = (0, utils_1.deepClone)(state.defaultDeploymentOptionsResult);
            this.updateState(state);
            return state;
        }));
        this.registerReducer("intermediaryIncludeObjectTypesOptionsChanged", (state, payload) => {
            const deploymentOptions = state.intermediaryOptionsResult.defaultDeploymentOptions;
            const excludeObjectTypeOptions = deploymentOptions.excludeObjectTypes.value;
            const optionIndex = excludeObjectTypeOptions.findIndex((o) => o.toLowerCase() === payload.key.toLowerCase());
            const isFound = optionIndex !== -1;
            if (isFound) {
                excludeObjectTypeOptions.splice(optionIndex, 1);
            }
            else {
                excludeObjectTypeOptions.push(payload.key);
            }
            this.updateState(state);
            return state;
        });
        this.registerReducer("confirmSchemaOptions", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            state.defaultDeploymentOptionsResult.defaultDeploymentOptions = (0, utils_1.deepClone)(state.intermediaryOptionsResult.defaultDeploymentOptions);
            state.intermediaryOptionsResult = undefined;
            this.updateState(state);
            const yesItem = {
                title: locConstants.SchemaCompare.Yes,
            };
            const noItem = {
                title: locConstants.SchemaCompare.No,
                isCloseAffordance: true,
            };
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.OptionsChanged);
            if (payload.optionsChanged) {
                vscode.window
                    .showInformationMessage(locConstants.SchemaCompare.optionsChangedMessage, { modal: true }, yesItem, noItem)
                    .then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (result.title === locConstants.SchemaCompare.Yes) {
                        const payload = {
                            sourceEndpointInfo: state.sourceEndpointInfo,
                            targetEndpointInfo: state.targetEndpointInfo,
                            deploymentOptions: state.defaultDeploymentOptionsResult.defaultDeploymentOptions,
                        };
                        yield this.schemaCompare(payload, state);
                        (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.OptionsChanged);
                    }
                }));
            }
            return state;
        }));
        this.registerReducer("intermediaryGeneralOptionsChanged", (state, payload) => {
            const generalOptionsDictionary = state.intermediaryOptionsResult.defaultDeploymentOptions.booleanOptionsDictionary;
            generalOptionsDictionary[payload.key].value =
                !generalOptionsDictionary[payload.key].value;
            this.updateState(state);
            return state;
        });
        this.registerReducer("switchEndpoints", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.Switch, this.operationId);
            state.sourceEndpointInfo = payload.newSourceEndpointInfo;
            state.targetEndpointInfo = payload.newTargetEndpointInfo;
            state.endpointsSwitched = true;
            this.updateState(state);
            endActivity.end(telemetry_2.ActivityStatus.Succeeded, {
                operationId: this.operationId,
            });
            return state;
        }));
        this.registerReducer("compare", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            return yield this.schemaCompare(payload, state);
        }));
        this.registerReducer("generateScript", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.GenerateScript, this.operationId, {
                startTime: Date.now().toString(),
                operationId: this.operationId,
            });
            const result = yield (0, schemaCompareUtils_1.generateScript)(this.operationId, 1 /* TaskExecutionMode.script */, payload, this.schemaCompareService);
            if (!result || !result.success) {
                endActivity.endFailed(undefined, false, undefined, undefined, {
                    errorMessage: result.errorMessage,
                    operationId: this.operationId,
                });
                vscode.window.showErrorMessage(locConstants.SchemaCompare.generateScriptErrorMessage(result.errorMessage));
            }
            endActivity.end(telemetry_2.ActivityStatus.Succeeded, {
                endTime: Date.now().toString(),
                operationId: this.operationId,
            });
            state.generateScriptResultStatus = result;
            return state;
        }));
        this.registerReducer("publishChanges", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            const yes = locConstants.SchemaCompare.Yes;
            const result = yield vscode.window.showWarningMessage(locConstants.SchemaCompare.areYouSureYouWantToUpdateTheTarget, { modal: true }, yes);
            if (result !== yes) {
                return state;
            }
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.Publish, this.operationId, {
                startTime: Date.now().toString(),
                operationId: this.operationId,
                targetType: (0, schemaCompareUtils_1.getSchemaCompareEndpointTypeString)(state.targetEndpointInfo.endpointType),
            });
            let publishResult = undefined;
            switch (state.targetEndpointInfo.endpointType) {
                case 0 /* mssql.SchemaCompareEndpointType.Database */:
                    publishResult = yield (0, schemaCompareUtils_1.publishDatabaseChanges)(this.operationId, 0 /* TaskExecutionMode.execute */, payload, this.schemaCompareService);
                    break;
                case 2 /* mssql.SchemaCompareEndpointType.Project */:
                    publishResult = yield (0, schemaCompareUtils_1.publishProjectChanges)(this.operationId, {
                        targetProjectPath: state.targetEndpointInfo.projectFilePath,
                        targetFolderStructure: state.targetEndpointInfo.extractTarget,
                        taskExecutionMode: 0 /* TaskExecutionMode.execute */,
                    }, this.schemaCompareService);
                    break;
                case 1 /* mssql.SchemaCompareEndpointType.Dacpac */: // Dacpac is an invalid publish target
                default:
                    throw new Error(`Unsupported SchemaCompareEndpointType: ${(0, schemaCompareUtils_1.getSchemaCompareEndpointTypeString)(state.targetEndpointInfo.endpointType)}`);
            }
            if (!publishResult || !publishResult.success || publishResult.errorMessage) {
                endActivity.endFailed(undefined, false, undefined, undefined, {
                    errorMessage: publishResult.errorMessage,
                    operationId: this.operationId,
                    targetType: (0, schemaCompareUtils_1.getSchemaCompareEndpointTypeString)(state.targetEndpointInfo.endpointType),
                });
                vscode.window.showErrorMessage(locConstants.SchemaCompare.schemaCompareApplyFailed(publishResult.errorMessage));
                return state;
            }
            endActivity.end(telemetry_2.ActivityStatus.Succeeded, {
                endTime: Date.now().toString(),
                operationId: this.operationId,
                targetType: (0, schemaCompareUtils_1.getSchemaCompareEndpointTypeString)(state.targetEndpointInfo.endpointType),
            });
            return state;
        }));
        this.registerReducer("publishDatabaseChanges", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, schemaCompareUtils_1.publishDatabaseChanges)(this.operationId, 0 /* TaskExecutionMode.execute */, payload, this.schemaCompareService);
            state.publishDatabaseChangesResultStatus = result;
            return state;
        }));
        this.registerReducer("publishProjectChanges", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, schemaCompareUtils_1.publishProjectChanges)(this.operationId, payload, this.schemaCompareService);
            state.schemaComparePublishProjectResult = result;
            return state;
        }));
        this.registerReducer("resetOptions", (state) => __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, schemaCompareUtils_1.getDefaultOptions)(this.schemaCompareService);
            state.intermediaryOptionsResult = (0, utils_1.deepClone)(result);
            this.updateState(state);
            (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.ResetOptions);
            return state;
        }));
        this.registerReducer("includeExcludeNode", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, schemaCompareUtils_1.includeExcludeNode)(this.operationId, 0 /* TaskExecutionMode.execute */, payload, this.schemaCompareService);
            if (result.success) {
                state.schemaCompareIncludeExcludeResult = result;
                if (state.schemaCompareResult) {
                    state.schemaCompareResult.differences[payload.id].included =
                        payload.includeRequest;
                    result.affectedDependencies.forEach((difference) => {
                        const index = state.schemaCompareResult.differences.findIndex((d) => d.sourceValue === difference.sourceValue &&
                            d.targetValue === difference.targetValue &&
                            d.updateAction === difference.updateAction &&
                            d.name === difference.name);
                        if (index !== -1) {
                            state.schemaCompareResult.differences[index].included =
                                payload.includeRequest;
                        }
                    });
                }
                this.updateState(state);
            }
            else {
                if (result.blockingDependencies) {
                    const diffEntry = payload.diffEntry;
                    const diffEntryName = this.formatEntryName(diffEntry.sourceValue ? diffEntry.sourceValue : diffEntry.targetValue);
                    const blockingDependencyNames = result.blockingDependencies
                        .map((blockingEntry) => {
                        return this.formatEntryName(blockingEntry.sourceValue
                            ? blockingEntry.sourceValue
                            : blockingEntry.targetValue);
                    })
                        .filter((name) => name !== "");
                    let message = "";
                    if (blockingDependencyNames.length > 0) {
                        message = payload.includeRequest
                            ? locConstants.SchemaCompare.cannotIncludeEntryWithBlockingDependency(diffEntryName, blockingDependencyNames.join(", "))
                            : locConstants.SchemaCompare.cannotExcludeEntryWithBlockingDependency(diffEntryName, blockingDependencyNames.join(", "));
                    }
                    else {
                        message = payload.includeRequest
                            ? locConstants.SchemaCompare.cannotIncludeEntry(diffEntryName)
                            : locConstants.SchemaCompare.cannotExcludeEntry(diffEntryName);
                    }
                    vscode.window.showWarningMessage(message);
                }
                else {
                    vscode.window.showWarningMessage(result.errorMessage);
                }
            }
            return state;
        }));
        this.registerReducer("includeExcludeAllNodes", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            state.isIncludeExcludeAllOperationInProgress = true;
            this.updateState(state);
            const result = yield (0, schemaCompareUtils_1.includeExcludeAllNodes)(this.operationId, 0 /* TaskExecutionMode.execute */, payload, this.schemaCompareService);
            this.state.isIncludeExcludeAllOperationInProgress = false;
            if (result.success) {
                state.schemaCompareResult.differences = result.allIncludedOrExcludedDifferences;
            }
            this.updateState(state);
            return state;
        }));
        this.registerReducer("openScmp", (state) => __awaiter(this, void 0, void 0, function* () {
            const selectedFilePath = yield (0, schemaCompareUtils_1.showOpenDialogForScmp)();
            if (!selectedFilePath) {
                return state;
            }
            const startTime = Date.now();
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.OpenScmp, this.operationId, {
                startTime: startTime.toString(),
                operationId: this.operationId,
            });
            const result = yield (0, schemaCompareUtils_1.openScmp)(selectedFilePath, this.schemaCompareService);
            if (!result || !result.success) {
                endActivity.endFailed(undefined, false, undefined, undefined, {
                    errorMessage: result.errorMessage,
                    operationId: this.operationId,
                });
                vscode.window.showErrorMessage(locConstants.SchemaCompare.openScmpErrorMessage(result.errorMessage));
                return state;
            }
            // construct source endpoint info
            state.sourceEndpointInfo = yield this.constructEndpointInfo(result.sourceEndpointInfo, "source");
            // construct target endpoint info
            state.targetEndpointInfo = yield this.constructEndpointInfo(result.targetEndpointInfo, "target");
            state.defaultDeploymentOptionsResult.defaultDeploymentOptions =
                result.deploymentOptions;
            state.scmpSourceExcludes = result.excludedSourceElements;
            state.scmpTargetExcludes = result.excludedTargetElements;
            state.sourceTargetSwitched =
                result.originalTargetName !== state.targetEndpointInfo.databaseName;
            endActivity.end(telemetry_2.ActivityStatus.Succeeded, {
                operationId: this.operationId,
                elapsedTime: (Date.now() - startTime).toString(),
            });
            state.schemaCompareOpenScmpResult = result;
            this.updateState(state);
            return state;
        }));
        this.registerReducer("saveScmp", (state) => __awaiter(this, void 0, void 0, function* () {
            const saveFilePath = yield (0, schemaCompareUtils_1.showSaveDialogForScmp)();
            if (!saveFilePath) {
                return state;
            }
            const sourceExcludes = this.convertExcludesToObjectIds(state.originalSourceExcludes);
            const targetExcludes = this.convertExcludesToObjectIds(state.originalTargetExcludes);
            const startTime = Date.now();
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.SaveScmp, this.operationId, {
                startTime: startTime.toString(),
                operationId: this.operationId,
            });
            const result = yield (0, schemaCompareUtils_1.saveScmp)(state.sourceEndpointInfo, state.targetEndpointInfo, 0 /* TaskExecutionMode.execute */, state.defaultDeploymentOptionsResult.defaultDeploymentOptions, saveFilePath, sourceExcludes, targetExcludes, this.schemaCompareService);
            if (!result || !result.success) {
                endActivity.endFailed(undefined, false, undefined, undefined, {
                    errorMessage: result.errorMessage,
                    operationId: this.operationId,
                });
                vscode.window.showErrorMessage(locConstants.SchemaCompare.saveScmpErrorMessage(result.errorMessage));
            }
            endActivity.end(telemetry_2.ActivityStatus.Succeeded, {
                operationId: this.operationId,
                elapsedTime: (Date.now() - startTime).toString(),
            });
            state.saveScmpResultStatus = result;
            this.updateState(state);
            return state;
        }));
        this.registerReducer("cancel", (state) => __awaiter(this, void 0, void 0, function* () {
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.Cancel, this.operationId, {
                startTime: Date.now().toString(),
            });
            const result = yield (0, schemaCompareUtils_1.cancel)(this.operationId, this.schemaCompareService);
            if (!result || !result.success) {
                endActivity.endFailed(undefined, false, undefined, undefined, {
                    errorMessage: result.errorMessage,
                    operationId: this.operationId,
                });
                vscode.window.showErrorMessage(locConstants.SchemaCompare.cancelErrorMessage(result.errorMessage));
                return state;
            }
            endActivity.end(telemetry_2.ActivityStatus.Succeeded);
            state.isComparisonInProgress = false;
            state.cancelResultStatus = result;
            this.updateState(state);
            return state;
        }));
    }
    formatEntryName(nameParts) {
        if ((0, util_1.isNullOrUndefined)(nameParts) || nameParts.length === 0) {
            return "";
        }
        return nameParts.join(".");
    }
    mapExtractTargetEnum(folderStructure) {
        switch (folderStructure) {
            case "File":
                return 1 /* mssql.ExtractTarget.file */;
            case "Flat":
                return 2 /* mssql.ExtractTarget.flat */;
            case "Object Type":
                return 3 /* mssql.ExtractTarget.objectType */;
            case "Schema":
                return 4 /* mssql.ExtractTarget.schema */;
            case "Schema/Object Type":
            default:
                return 5 /* mssql.ExtractTarget.schemaObjectType */;
        }
    }
    getActiveServersList() {
        const activeServers = {};
        const activeConnections = this.connectionMgr.activeConnections;
        Object.keys(activeConnections).forEach((connectionUri) => {
            var _a;
            let credentials = activeConnections[connectionUri]
                .credentials;
            activeServers[connectionUri] = {
                profileName: (_a = credentials.profileName) !== null && _a !== void 0 ? _a : "",
                server: credentials.server,
            };
        });
        return activeServers;
    }
    schemaCompare(payload, state) {
        return __awaiter(this, void 0, void 0, function* () {
            state.isComparisonInProgress = true;
            this.updateState(state);
            const endActivity = (0, telemetry_1.startActivity)(telemetry_2.TelemetryViews.SchemaCompare, telemetry_2.TelemetryActions.Compare, this.operationId, {
                startTime: Date.now().toString(),
            });
            const result = yield (0, schemaCompareUtils_1.compare)(this.operationId, 0 /* TaskExecutionMode.execute */, payload, this.schemaCompareService);
            state.isComparisonInProgress = false;
            if (!result || !result.success) {
                endActivity.endFailed(undefined, false, undefined, undefined, {
                    errorMessage: result.errorMessage,
                    operationId: this.operationId,
                });
                vscode.window.showErrorMessage(locConstants.SchemaCompare.compareErrorMessage(result.errorMessage));
                return state;
            }
            endActivity.end(telemetry_2.ActivityStatus.Succeeded);
            const finalDifferences = this.getAllObjectTypeDifferences(result);
            result.differences = finalDifferences;
            state.schemaCompareResult = result;
            state.endpointsSwitched = false;
            this.updateState(state);
            return state;
        });
    }
    constructEndpointInfo(endpoint, caller) {
        return __awaiter(this, void 0, void 0, function* () {
            let ownerUri;
            let endpointInfo;
            if (endpoint && endpoint.endpointType === 0 /* mssql.SchemaCompareEndpointType.Database */) {
                const connInfo = endpoint.connectionDetails.options;
                ownerUri = this.connectionMgr.getUriForScmpConnection(connInfo);
                let isConnected = ownerUri ? true : false;
                if (!ownerUri) {
                    ownerUri = utils.generateQueryUri().toString();
                    isConnected = yield this.connectionMgr.connect(ownerUri, connInfo);
                    if (!isConnected) {
                        // Invoking connect will add an active connection that isn't valid, hence removing it.
                        delete this.connectionMgr.activeConnections[ownerUri];
                    }
                }
                const connection = this.connectionMgr.activeConnections[ownerUri];
                const connectionProfile = connection === null || connection === void 0 ? void 0 : connection.credentials;
                if (isConnected && ownerUri && connectionProfile) {
                    endpointInfo = {
                        endpointType: 0 /* mssql.SchemaCompareEndpointType.Database */,
                        serverDisplayName: `${connInfo.server} (${connectionProfile.user || locConstants.SchemaCompare.defaultUserName})`,
                        serverName: connInfo.server,
                        databaseName: connInfo.database,
                        ownerUri: ownerUri,
                        packageFilePath: "",
                        connectionDetails: undefined,
                        connectionName: connectionProfile.profileName
                            ? connectionProfile.profileName
                            : "",
                        projectFilePath: "",
                        targetScripts: [],
                        dataSchemaProvider: "",
                        extractTarget: 5 /* mssql.ExtractTarget.schemaObjectType */,
                    };
                }
                else {
                    endpointInfo = {
                        endpointType: 0 /* mssql.SchemaCompareEndpointType.Database */,
                        serverDisplayName: "",
                        serverName: "",
                        databaseName: "",
                        ownerUri: "",
                        packageFilePath: "",
                        connectionDetails: undefined,
                        connectionName: "",
                        projectFilePath: "",
                        targetScripts: [],
                        dataSchemaProvider: "",
                        extractTarget: 5 /* mssql.ExtractTarget.schemaObjectType */,
                    };
                }
            }
            else if (endpoint.endpointType === 2 /* mssql.SchemaCompareEndpointType.Project */) {
                endpointInfo = {
                    endpointType: endpoint.endpointType,
                    packageFilePath: "",
                    serverDisplayName: "",
                    serverName: "",
                    databaseName: "",
                    ownerUri: "",
                    connectionDetails: undefined,
                    projectFilePath: endpoint.projectFilePath,
                    targetScripts: [],
                    dataSchemaProvider: endpoint.dataSchemaProvider,
                    extractTarget: endpoint.extractTarget,
                };
            }
            else {
                endpointInfo = {
                    endpointType: endpoint.endpointType === 0 /* mssql.SchemaCompareEndpointType.Database */
                        ? 0 /* mssql.SchemaCompareEndpointType.Database */
                        : 1 /* mssql.SchemaCompareEndpointType.Dacpac */,
                    serverDisplayName: "",
                    serverName: "",
                    databaseName: "",
                    ownerUri: "",
                    packageFilePath: endpoint.packageFilePath,
                    connectionDetails: undefined,
                };
            }
            return endpointInfo;
        });
    }
    getAllObjectTypeDifferences(result) {
        // let data = [];
        let finalDifferences = [];
        let differences = result.differences;
        if (differences) {
            differences.forEach((difference) => {
                if (difference.differenceType === 0 /* mssql.SchemaDifferenceType.Object */) {
                    if ((difference.sourceValue !== null && difference.sourceValue.length > 0) ||
                        (difference.targetValue !== null && difference.targetValue.length > 0)) {
                        // lewissanchez todo: need to check if difference is excluded before adding to final differences list
                        finalDifferences.push(difference);
                    }
                }
            });
        }
        return finalDifferences;
    }
    /**
     * Converts excluded diff entries into object ids which are needed to save them in an scmp
     */
    convertExcludesToObjectIds(excludedDiffEntries) {
        let result = [];
        excludedDiffEntries.forEach((value) => {
            result.push({
                nameParts: value.sourceValue ? value.sourceValue : value.targetValue,
                sqlObjectType: `Microsoft.Data.Tools.Schema.Sql.SchemaModel.${value.name}`,
            });
        });
        return result;
    }
}
exports.SchemaCompareWebViewController = SchemaCompareWebViewController;

//# sourceMappingURL=schemaCompareWebViewController.js.map
