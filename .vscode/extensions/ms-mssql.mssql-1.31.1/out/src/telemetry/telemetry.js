"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendActionEvent = sendActionEvent;
exports.sendErrorEvent = sendErrorEvent;
exports.startActivity = startActivity;
const vscode = require("vscode");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const ads_extension_telemetry_1 = require("@microsoft/ads-extension-telemetry");
const uuid_1 = require("uuid");
const packageJson = vscode.extensions.getExtension("ms-mssql.mssql" /* vscodeMssql.extension.name */).packageJSON;
let packageInfo = {
    name: "vscode-mssql", // Differentiate this from the mssql extension in ADS
    version: packageJson.version,
    aiKey: packageJson.aiKey,
};
const telemetryReporter = new ads_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
/**
 * Sends a telemetry event to the telemetry reporter
 * @param telemetryView View in which the event occurred
 * @param telemetryAction Action that was being performed when the event occurred
 * @param additionalProps Error that occurred
 * @param additionalMeasurements Error that occurred
 * @param connectionInfo connectionInfo for the event
 * @param serverInfo serverInfo for the event
 */
function sendActionEvent(telemetryView, telemetryAction, additionalProps = {}, additionalMeasurements = {}, connectionInfo, serverInfo) {
    let actionEvent = telemetryReporter
        .createActionEvent(telemetryView, telemetryAction)
        .withAdditionalProperties(additionalProps)
        .withAdditionalMeasurements(additionalMeasurements);
    if (connectionInfo) {
        actionEvent = actionEvent.withConnectionInfo(connectionInfo);
    }
    if (serverInfo) {
        actionEvent = actionEvent.withServerInfo(serverInfo);
    }
    actionEvent.send();
}
/**
 * Sends an error event to the telemetry reporter
 * @param telemetryView View in which the error occurred
 * @param telemetryAction Action that was being performed when the error occurred
 * @param error Error that occurred
 * @param includeErrorMessage Whether to include the error message in the telemetry event. Defaults to false
 * @param errorCode Error code for the error
 * @param errorType Error type for the error
 * @param additionalProps Additional properties to include in the telemetry event
 * @param additionalMeasurements Additional measurements to include in the telemetry event
 * @param connectionInfo connectionInfo for the error
 * @param serverInfo serverInfo for the error
 */
function sendErrorEvent(telemetryView, telemetryAction, error, includeErrorMessage = false, errorCode, errorType, additionalProps = {}, additionalMeasurements = {}, connectionInfo, serverInfo) {
    let errorEvent = telemetryReporter
        .createErrorEvent2(telemetryView, telemetryAction, error, includeErrorMessage, errorCode, errorType)
        .withAdditionalProperties(additionalProps)
        .withAdditionalMeasurements(additionalMeasurements);
    if (connectionInfo) {
        errorEvent = errorEvent.withConnectionInfo(connectionInfo);
    }
    if (serverInfo) {
        errorEvent = errorEvent.withServerInfo(serverInfo);
    }
    errorEvent.send();
}
function startActivity(telemetryView, telemetryAction, correlationId, additionalProps = {}, additionalMeasurements = {}) {
    const startTime = performance.now();
    if (!correlationId) {
        correlationId = (0, uuid_1.v4)();
    }
    sendActionEvent(telemetryView, telemetryAction, additionalProps, Object.assign(Object.assign({}, additionalMeasurements), { startTime: Math.round(startTime) }));
    function update(additionalProps, additionalMeasurements) {
        sendActionEvent(telemetryView, telemetryAction, Object.assign(Object.assign({}, additionalProps), { activityStatus: telemetry_1.ActivityStatus.Pending }), Object.assign(Object.assign({}, additionalMeasurements), { timeElapsedMs: Math.round(performance.now() - startTime) }));
    }
    function end(activityStatus, additionalProps, additionalMeasurements) {
        sendActionEvent(telemetryView, telemetryAction, Object.assign(Object.assign({}, additionalProps), { activityStatus: activityStatus }), Object.assign(Object.assign({}, additionalMeasurements), { durationMs: Math.round(performance.now() - startTime) }));
    }
    function endFailed(error, includeErrorMessage, errorCode, errorType, additionalProps, additionalMeasurements) {
        sendErrorEvent(telemetryView, telemetryAction, error, includeErrorMessage, errorCode, errorType, Object.assign(Object.assign({}, additionalProps), { activityStatus: telemetry_1.ActivityStatus.Failed }), Object.assign(Object.assign({}, additionalMeasurements), { durationMs: Math.round(performance.now() - startTime) }));
    }
    return {
        startTime,
        correlationId,
        update,
        end,
        endFailed,
    };
}

//# sourceMappingURL=telemetry.js.map
