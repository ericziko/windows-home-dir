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
exports.SqlProjectsService = void 0;
const contracts = require("../models/contracts/sqlProjects/sqlProjectsContracts");
class SqlProjectsService {
    constructor(_client) {
        this._client = _client;
    }
    /**
     * Add a dacpac reference to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param dacpacPath Path to the .dacpac file
     * @param suppressMissingDependencies Whether to suppress missing dependencies
     * @param databaseVariable SQLCMD variable name for specifying the other database this reference is to, if different from that of the current project
     * @param serverVariable SQLCMD variable name for specifying the other server this reference is to, if different from that of the current project.
     * If this is set, DatabaseVariable must also be set.
     * @param databaseLiteral Literal name used to reference another database in the same server, if not using SQLCMD variables
     */
    addDacpacReference(projectUri, dacpacPath, suppressMissingDependencies, databaseVariable, serverVariable, databaseLiteral) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                dacpacPath: dacpacPath,
                suppressMissingDependencies: suppressMissingDependencies,
                databaseVariable: databaseVariable,
                serverVariable: serverVariable,
                databaseLiteral: databaseLiteral,
            };
            return this._client.sendRequest(contracts.AddDacpacReferenceRequest.type, params);
        });
    }
    /**
     * Add a SQL Project reference to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param projectPath Path to the referenced .sqlproj file
     * @param projectGuid GUID for the referenced SQL project
     * @param suppressMissingDependencies Whether to suppress missing dependencies
     * @param databaseVariable SQLCMD variable name for specifying the other database this reference is to, if different from that of the current project
     * @param serverVariable SQLCMD variable name for specifying the other server this reference is to, if different from that of the current project.
     * If this is set, DatabaseVariable must also be set.
     * @param databaseLiteral Literal name used to reference another database in the same server, if not using SQLCMD variables
     */
    addSqlProjectReference(projectUri, projectPath, projectGuid, suppressMissingDependencies, databaseVariable, serverVariable, databaseLiteral) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                projectPath: projectPath,
                projectGuid: projectGuid,
                suppressMissingDependencies: suppressMissingDependencies,
                databaseVariable: databaseVariable,
                serverVariable: serverVariable,
                databaseLiteral: databaseLiteral,
            };
            return this._client.sendRequest(contracts.AddSqlProjectReferenceRequest.type, params);
        });
    }
    /**
     * Add a system database reference to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param systemDatabase Type of system database
     * @param suppressMissingDependencies Whether to suppress missing dependencies
     * @param referencetype Type of reference - ArtifactReference or PackageReference
     * @param databaseLiteral Literal name used to reference another database in the same server, if not using SQLCMD variables
     */
    addSystemDatabaseReference(projectUri, systemDatabase, suppressMissingDependencies, systemDbReferenceType, databaseLiteral) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                systemDatabase: systemDatabase,
                suppressMissingDependencies: suppressMissingDependencies,
                referenceType: systemDbReferenceType,
                databaseLiteral: databaseLiteral,
            };
            return this._client.sendRequest(contracts.AddSystemDatabaseReferenceRequest.type, params);
        });
    }
    /**
     * Add a nuget package database reference to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param packageName Name of the referenced nuget package
     * @param packageVersion Version of the referenced nuget package
     * @param suppressMissingDependencies Whether to suppress missing dependencies
     * @param databaseVariable SQLCMD variable name for specifying the other database this reference is to, if different from that of the current project
     * @param serverVariable SQLCMD variable name for specifying the other server this reference is to, if different from that of the current project.
     * If this is set, DatabaseVariable must also be set.
     * @param databaseLiteral Literal name used to reference another database in the same server, if not using SQLCMD variables
     */
    addNugetPackageReference(projectUri, packageName, packageVersion, suppressMissingDependencies, databaseVariable, serverVariable, databaseLiteral) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                packageName: packageName,
                packageVersion: packageVersion,
                suppressMissingDependencies: suppressMissingDependencies,
                databaseVariable: databaseVariable,
                serverVariable: serverVariable,
                databaseLiteral: databaseLiteral,
            };
            return this._client.sendRequest(contracts.AddNugetPackageReferenceRequest.type, params);
        });
    }
    /**
     * Delete a database reference from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param name Name of the reference to be deleted. Name of the System DB, path of the sqlproj, or path of the dacpac
     */
    deleteDatabaseReference(projectUri, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                name: name,
            };
            return this._client.sendRequest(contracts.DeleteDatabaseReferenceRequest.type, params);
        });
    }
    /**
     * Add a folder to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the folder, typically relative to the .sqlproj file
     */
    addFolder(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.AddFolderRequest.type, params);
        });
    }
    /**
     * Delete a folder from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the folder, typically relative to the .sqlproj file
     */
    deleteFolder(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.DeleteFolderRequest.type, params);
        });
    }
    /**
     * Add a post-deployment script to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    addPostDeploymentScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.AddPostDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Add a pre-deployment script to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    addPreDeploymentScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.AddPreDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Delete a post-deployment script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    deletePostDeploymentScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.DeletePostDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Delete a pre-deployment script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    deletePreDeploymentScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.DeletePreDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Exclude a post-deployment script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    excludePostDeploymentScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.ExcludePostDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Exclude a pre-deployment script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    excludePreDeploymentScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.ExcludePreDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Move a post-deployment script in a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     * @param destinationPath Destination path of the file or folder, relative to the .sqlproj
     */
    movePostDeploymentScript(projectUri, path, destinationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                destinationPath: destinationPath,
                path: path,
            };
            return this._client.sendRequest(contracts.MovePostDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Move a pre-deployment script in a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     * @param destinationPath Destination path of the file or folder, relative to the .sqlproj
     */
    movePreDeploymentScript(projectUri, path, destinationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                destinationPath: destinationPath,
                path: path,
            };
            return this._client.sendRequest(contracts.MovePreDeploymentScriptRequest.type, params);
        });
    }
    /**
     * Close a SQL project
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    closeProject(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.CloseSqlProjectRequest.type, params);
        });
    }
    /**
     * Create a new SQL project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param sqlProjectType Type of SQL Project: SDK-style or Legacy
     * @param databaseSchemaProvider Database schema provider for the project, in the format
     * "Microsoft.Data.Tools.Schema.Sql.SqlXYZDatabaseSchemaProvider".
     * Case sensitive.
     * @param buildSdkVersion Version of the Microsoft.Build.Sql SDK for the project, if overriding the default
     */
    createProject(projectUri, sqlProjectType, databaseSchemaProvider, buildSdkVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                sqlProjectType: sqlProjectType,
                databaseSchemaProvider: databaseSchemaProvider,
                buildSdkVersion: buildSdkVersion,
            };
            return this._client.sendRequest(contracts.CreateSqlProjectRequest.type, params);
        });
    }
    /**
     * Get the cross-platform compatibility status for a project
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getCrossPlatformCompatibility(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetCrossPlatformCompatibilityRequest.type, params);
        });
    }
    /**
     * Open an existing SQL project
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    openProject(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.OpenSqlProjectRequest.type, params);
        });
    }
    /**
     * Update a SQL project to be cross-platform compatible
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    updateProjectForCrossPlatform(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.UpdateProjectForCrossPlatformRequest.type, params);
        });
    }
    /**
     * Get the cross-platform compatibility status for a project
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getProjectProperties(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetProjectPropertiesRequest.type, params);
        });
    }
    /**
     * Set the DatabaseSource property of a .sqlproj file
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param databaseSource Source of the database schema, used in telemetry
     */
    setDatabaseSource(projectUri, databaseSource) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                databaseSource: databaseSource,
            };
            return this._client.sendRequest(contracts.SetDatabaseSourceRequest.type, params);
        });
    }
    /**
     * Set the DatabaseSchemaProvider property of a SQL project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param databaseSchemaProvider New DatabaseSchemaProvider value, in the form "Microsoft.Data.Tools.Schema.Sql.SqlXYZDatabaseSchemaProvider"
     */
    setDatabaseSchemaProvider(projectUri, databaseSchemaProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                databaseSchemaProvider: databaseSchemaProvider,
            };
            return this._client.sendRequest(contracts.SetDatabaseSchemaProviderRequest.type, params);
        });
    }
    /**
     * Add a SQLCMD variable to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param name Name of the SQLCMD variable
     * @param defaultValue Default value of the SQLCMD variable
     */
    addSqlCmdVariable(projectUri, name, defaultValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                name: name,
                defaultValue: defaultValue,
            };
            return this._client.sendRequest(contracts.AddSqlCmdVariableRequest.type, params);
        });
    }
    /**
     * Delete a SQLCMD variable from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param name Name of the SQLCMD variable to be deleted
     */
    deleteSqlCmdVariable(projectUri, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                name: name,
            };
            return this._client.sendRequest(contracts.DeleteSqlCmdVariableRequest.type, params);
        });
    }
    /**
     * Update an existing SQLCMD variable in a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param name Name of the SQLCMD variable
     * @param defaultValue Default value of the SQLCMD variable
     */
    updateSqlCmdVariable(projectUri, name, defaultValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                name: name,
                defaultValue: defaultValue,
            };
            return this._client.sendRequest(contracts.UpdateSqlCmdVariableRequest.type, params);
        });
    }
    /**
     * Add a SQL object script to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    addSqlObjectScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.AddSqlObjectScriptRequest.type, params);
        });
    }
    /**
     * Delete a SQL object script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    deleteSqlObjectScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.DeleteSqlObjectScriptRequest.type, params);
        });
    }
    /**
     * Exclude a SQL object script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     */
    excludeSqlObjectScript(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.ExcludeSqlObjectScriptRequest.type, params);
        });
    }
    /**
     * Move a SQL object script in a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql, relative to the .sqlproj
     * @param destinationPath Destination path of the file or folder, relative to the .sqlproj
     */
    moveSqlObjectScript(projectUri, path, destinationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                destinationPath: destinationPath,
                path: path,
            };
            return this._client.sendRequest(contracts.MoveSqlObjectScriptRequest.type, params);
        });
    }
    /**
     * getDatabaseReferences
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getDatabaseReferences(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetDatabaseReferencesRequest.type, params);
        });
    }
    /**
     * getFolders
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getFolders(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetFoldersRequest.type, params);
        });
    }
    /**
     * getPostDeploymentScripts
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getPostDeploymentScripts(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetPostDeploymentScriptsRequest.type, params);
        });
    }
    /**
     * getPreDeploymentScripts
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getPreDeploymentScripts(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetPreDeploymentScriptsRequest.type, params);
        });
    }
    /**
     * getSqlCmdVariables
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getSqlCmdVariables(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetSqlCmdVariablesRequest.type, params);
        });
    }
    /**
     * getSqlObjectScripts
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getSqlObjectScripts(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetSqlObjectScriptsRequest.type, params);
        });
    }
    /**
     * Exclude a folder and its contents from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the folder, typically relative to the .sqlproj file
     */
    excludeFolder(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.ExcludeFolderRequest.type, params);
        });
    }
    /**
     * Move a folder and its contents within a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param sourcePath Source path of the folder, typically relative to the .sqlproj file
     * @param destinationPath Destination path of the folder, typically relative to the .sqlproj file
     */
    moveFolder(projectUri, sourcePath, destinationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: sourcePath,
                destinationPath: destinationPath,
            };
            return this._client.sendRequest(contracts.MoveFolderRequest.type, params);
        });
    }
    /**
     * Add a none script to a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql and .publish.xml, relative to the .sqlproj
     */
    addNoneItem(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.AddNoneItemRequest.type, params);
        });
    }
    /**
     * Delete a none script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql and .publish.xml, relative to the .sqlproj
     */
    deleteNoneItem(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.DeleteNoneItemRequest.type, params);
        });
    }
    /**
     * Exclude a none script from a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the script, including .sql and .publish.xml, relative to the .sqlproj
     */
    excludeNoneItem(projectUri, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                path: path,
            };
            return this._client.sendRequest(contracts.ExcludeNoneItemRequest.type, params);
        });
    }
    /**
     * getNoneScripts
     * @param projectUri Absolute path of the project, including .sqlproj
     */
    getNoneItems(projectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { projectUri: projectUri };
            return this._client.sendRequest(contracts.GetNoneItemsRequest.type, params);
        });
    }
    /**
     * Move a none script in a project
     * @param projectUri Absolute path of the project, including .sqlproj
     * @param path Path of the file, including extension, relative to the .sqlproj
     * @param destinationPath Destination path of the file, relative to the .sqlproj
     */
    moveNoneItem(projectUri, path, destinationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                projectUri: projectUri,
                destinationPath: destinationPath,
                path: path,
            };
            return this._client.sendRequest(contracts.MoveNoneItemRequest.type, params);
        });
    }
}
exports.SqlProjectsService = SqlProjectsService;

//# sourceMappingURL=sqlProjectsService.js.map
