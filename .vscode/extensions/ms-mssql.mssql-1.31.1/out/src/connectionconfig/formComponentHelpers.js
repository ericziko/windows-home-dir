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
exports.generateConnectionComponents = generateConnectionComponents;
exports.groupAdvancedOptions = groupAdvancedOptions;
exports.convertToFormComponent = convertToFormComponent;
exports.completeFormComponents = completeFormComponents;
const connectionDialog_1 = require("../sharedInterfaces/connectionDialog");
const form_1 = require("../sharedInterfaces/form");
const telemetry_1 = require("../telemetry/telemetry");
const telemetry_2 = require("../sharedInterfaces/telemetry");
const locConstants_1 = require("../constants/locConstants");
const connection_1 = require("../models/contracts/connection");
const utils_1 = require("../utils/utils");
const connectionDialogWebviewController_1 = require("./connectionDialogWebviewController");
function generateConnectionComponents(connectionManager, azureAccountOptions, azureActionButtons) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // get list of connection options from Tools Service
        const capabilitiesResult = yield connectionManager.client.sendRequest(connection_1.GetCapabilitiesRequest.type, {});
        const connectionOptions = capabilitiesResult.capabilities.connectionProvider.options;
        const groupNames = capabilitiesResult.capabilities.connectionProvider.groupDisplayNames;
        const result = {}; // force empty record for intial blank state
        const _mainOptionNames = new Set([
            ...connectionDialogWebviewController_1.ConnectionDialogWebviewController.mainOptions,
            "profileName",
        ]);
        for (const option of connectionOptions) {
            try {
                result[option.name] = Object.assign(Object.assign({}, convertToFormComponent(option)), { isAdvancedOption: !_mainOptionNames.has(option.name), optionCategory: option.groupName, optionCategoryLabel: (_a = groupNames[option.groupName]) !== null && _a !== void 0 ? _a : option.groupName });
            }
            catch (err) {
                console.error(`Error loading connection option '${option.name}': ${(0, utils_1.getErrorMessage)(err)}`);
                (0, telemetry_1.sendErrorEvent)(telemetry_2.TelemetryViews.ConnectionDialog, telemetry_2.TelemetryActions.LoadConnectionProperties, err, true, // includeErrorMessage
                undefined, // errorCode
                undefined, // errorType
                {
                    connectionOptionName: option.name,
                });
            }
        }
        yield completeFormComponents(result, yield azureAccountOptions, yield azureActionButtons);
        return result;
    });
}
function groupAdvancedOptions(components, componentsInfo) {
    const groupMap = new Map([
        // intialize with display order; any that aren't pre-defined will be appended
        // these values must match the GroupName defined in SQL Tools Service.
        ["security", undefined],
        ["initialization", undefined],
        ["resiliency", undefined],
        ["pooling", undefined],
        ["context", undefined],
    ]);
    const optionsToGroup = Object.values(components).filter((c) => c.isAdvancedOption &&
        !componentsInfo.mainOptions.includes(c.propertyName) &&
        !componentsInfo.topAdvancedOptions.includes(c.propertyName));
    for (const option of optionsToGroup) {
        if (
        // new group ID or group ID hasn't been initialized yet
        !groupMap.has(option.optionCategory) ||
            groupMap.get(option.optionCategory) === undefined) {
            groupMap.set(option.optionCategory, {
                groupName: option.optionCategoryLabel,
                options: [option.propertyName],
            });
        }
        else {
            groupMap.get(option.optionCategory).options.push(option.propertyName);
        }
    }
    return Array.from(groupMap.values());
}
function convertToFormComponent(connOption) {
    switch (connOption.valueType) {
        case "boolean":
            return {
                propertyName: connOption.name,
                label: connOption.displayName,
                required: connOption.isRequired,
                type: form_1.FormItemType.Checkbox,
                tooltip: connOption.description,
            };
        case "string":
            return {
                propertyName: connOption.name,
                label: connOption.displayName,
                required: connOption.isRequired,
                type: form_1.FormItemType.Input,
                tooltip: connOption.description,
            };
        case "password":
            return {
                propertyName: connOption.name,
                label: connOption.displayName,
                required: connOption.isRequired,
                type: form_1.FormItemType.Password,
                tooltip: connOption.description,
            };
        case "number":
            return {
                propertyName: connOption.name,
                label: connOption.displayName,
                required: connOption.isRequired,
                type: form_1.FormItemType.Input,
                tooltip: connOption.description,
            };
        case "category":
            return {
                propertyName: connOption.name,
                label: connOption.displayName,
                required: connOption.isRequired,
                type: form_1.FormItemType.Dropdown,
                tooltip: connOption.description,
                options: connOption.categoryValues.map((v) => {
                    var _a;
                    return {
                        displayName: (_a = v.displayName) !== null && _a !== void 0 ? _a : v.name, // Use name if displayName is not provided
                        value: v.name,
                    };
                }),
            };
        default:
            const error = `Unhandled connection option type: ${connOption.valueType}`;
            (0, telemetry_1.sendErrorEvent)(telemetry_2.TelemetryViews.ConnectionDialog, telemetry_2.TelemetryActions.LoadConnectionProperties, new Error(error), true);
    }
}
function completeFormComponents(components, azureAccountOptions, azureActionButtons) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add additional components that are not part of the connection options
        components["profileName"] = {
            propertyName: "profileName",
            label: locConstants_1.ConnectionDialog.profileName,
            required: false,
            type: form_1.FormItemType.Input,
            isAdvancedOption: false,
        };
        components["savePassword"] = {
            propertyName: "savePassword",
            label: locConstants_1.ConnectionDialog.savePassword,
            required: false,
            type: form_1.FormItemType.Checkbox,
            isAdvancedOption: false,
        };
        components["accountId"] = {
            propertyName: "accountId",
            label: locConstants_1.ConnectionDialog.azureAccount,
            required: true,
            type: form_1.FormItemType.Dropdown,
            options: azureAccountOptions,
            placeholder: locConstants_1.ConnectionDialog.selectAnAccount,
            actionButtons: azureActionButtons,
            validate: (state, value) => {
                if (state.connectionProfile.authenticationType === connectionDialog_1.AuthenticationType.AzureMFA &&
                    !value) {
                    return {
                        isValid: false,
                        validationMessage: locConstants_1.ConnectionDialog.azureAccountIsRequired,
                    };
                }
                return {
                    isValid: true,
                    validationMessage: "",
                };
            },
            isAdvancedOption: false,
        };
        components["tenantId"] = {
            propertyName: "tenantId",
            label: locConstants_1.ConnectionDialog.tenantId,
            required: true,
            type: form_1.FormItemType.Dropdown,
            options: [],
            hidden: true,
            placeholder: locConstants_1.ConnectionDialog.selectATenant,
            validate: (state, value) => {
                if (state.connectionProfile.authenticationType === connectionDialog_1.AuthenticationType.AzureMFA &&
                    !value) {
                    return {
                        isValid: false,
                        validationMessage: locConstants_1.ConnectionDialog.tenantIdIsRequired,
                    };
                }
                return {
                    isValid: true,
                    validationMessage: "",
                };
            },
            isAdvancedOption: false,
        };
        components["connectionString"] = {
            type: form_1.FormItemType.TextArea,
            propertyName: "connectionString",
            label: locConstants_1.ConnectionDialog.connectionString,
            required: true,
            isAdvancedOption: false,
        };
        // add missing validation functions for generated components
        components["server"].validate = (state, value) => {
            if (state.connectionProfile.authenticationType === connectionDialog_1.AuthenticationType.SqlLogin && !value) {
                return {
                    isValid: false,
                    validationMessage: locConstants_1.ConnectionDialog.serverIsRequired,
                };
            }
            return {
                isValid: true,
                validationMessage: "",
            };
        };
        components["user"].validate = (state, value) => {
            if (state.connectionProfile.authenticationType === connectionDialog_1.AuthenticationType.SqlLogin && !value) {
                return {
                    isValid: false,
                    validationMessage: locConstants_1.ConnectionDialog.usernameIsRequired,
                };
            }
            return {
                isValid: true,
                validationMessage: "",
            };
        };
    });
}

//# sourceMappingURL=formComponentHelpers.js.map
