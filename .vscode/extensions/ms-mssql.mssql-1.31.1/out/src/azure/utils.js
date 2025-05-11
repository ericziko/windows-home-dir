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
exports.getAllValues = getAllValues;
exports.defaultSubscriptionClientFactory = defaultSubscriptionClientFactory;
exports.defaultResourceManagementClientFactory = defaultResourceManagementClientFactory;
exports.defaultSqlManagementClientFactory = defaultSqlManagementClientFactory;
exports.getAzureActiveDirectoryConfig = getAzureActiveDirectoryConfig;
exports.getEnableSqlAuthenticationProviderConfig = getEnableSqlAuthenticationProviderConfig;
exports.getEnableConnectionPoolingConfig = getEnableConnectionPoolingConfig;
exports.getAppDataPath = getAppDataPath;
const arm_resources_1 = require("@azure/arm-resources");
const arm_sql_1 = require("@azure/arm-sql");
const arm_subscriptions_1 = require("@azure/arm-subscriptions");
const path = require("path");
const os = require("os");
const vscode = require("vscode");
const azure_1 = require("../models/contracts/azure");
const Constants = require("./constants");
const credentialWrapper_1 = require("./credentialWrapper");
const configAzureAD = "azureActiveDirectory";
/**
 * Helper method to convert azure results that comes as pages to an array
 * @param pages azure resources as pages
 * @param convertor a function to convert a value in page to the expected value to add to array
 * @returns array or Azure resources
 */
function getAllValues(pages, convertor) {
    return __awaiter(this, void 0, void 0, function* () {
        let values = [];
        let newValue = yield pages.next();
        while (!newValue.done) {
            values.push(convertor(newValue.value));
            newValue = yield pages.next();
        }
        return values;
    });
}
function defaultSubscriptionClientFactory(token) {
    return new arm_subscriptions_1.SubscriptionClient(new credentialWrapper_1.TokenCredentialWrapper(token));
}
function defaultResourceManagementClientFactory(token, subscriptionId) {
    return new arm_resources_1.ResourceManagementClient(new credentialWrapper_1.TokenCredentialWrapper(token), subscriptionId);
}
function defaultSqlManagementClientFactory(token, subscriptionId) {
    return new arm_sql_1.SqlManagementClient(new credentialWrapper_1.TokenCredentialWrapper(token), subscriptionId);
}
function getConfiguration() {
    return vscode.workspace.getConfiguration(Constants.extensionConfigSectionName);
}
function getAzureActiveDirectoryConfig() {
    let config = getConfiguration();
    if (config) {
        const val = config.get(configAzureAD);
        if (val) {
            return azure_1.AzureAuthType[val];
        }
    }
    else {
        return azure_1.AzureAuthType.AuthCodeGrant;
    }
}
function getEnableSqlAuthenticationProviderConfig() {
    const config = getConfiguration();
    if (config) {
        const val = config.get(Constants.sqlAuthProviderSection);
        if (val !== undefined) {
            return val;
        }
    }
    return true; // default setting
}
function getEnableConnectionPoolingConfig() {
    const config = getConfiguration();
    if (config) {
        const val = config.get(Constants.enableConnectionPoolingSection);
        if (val !== undefined) {
            return val;
        }
    }
    return true; // default setting
}
function getAppDataPath() {
    let platform = process.platform;
    switch (platform) {
        case "win32":
            return (process.env["APPDATA"] ||
                path.join(process.env["USERPROFILE"], "AppData", "Roaming"));
        case "darwin":
            return path.join(os.homedir(), "Library", "Application Support");
        case "linux":
            return process.env["XDG_CONFIG_HOME"] || path.join(os.homedir(), ".config");
        default:
            throw new Error("Platform not supported");
    }
}

//# sourceMappingURL=utils.js.map
