"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubLogger = exports.StubStatusView = void 0;
exports.installService = installService;
exports.getServiceInstallDirectory = getServiceInstallDirectory;
exports.getServiceInstallDirectoryRoot = getServiceInstallDirectoryRoot;
const platform_1 = require("../models/platform");
const config_1 = require("../configurations/config");
const serviceDownloadProvider_1 = require("./serviceDownloadProvider");
const decompressProvider_1 = require("./decompressProvider");
const httpClient_1 = require("./httpClient");
const server_1 = require("./server");
class StubStatusView {
    constructor(_log) {
        this._log = _log;
    }
    installingService() {
        this._log("...");
    }
    serviceInstalled() {
        this._log("Service installed");
    }
    serviceInstallationFailed() {
        this._log("Service installation failed");
    }
    updateServiceDownloadingProgress(downloadPercentage) {
        if (downloadPercentage === 100) {
            this._log("100%");
        }
    }
}
exports.StubStatusView = StubStatusView;
class StubLogger {
    constructor(_log) {
        this._log = _log;
    }
    logDebug(message) {
        this._log(message);
    }
    increaseIndent() {
        // no-op
    }
    decreaseIndent() {
        // no-op
    }
    append(message) {
        this._log(message);
    }
    appendLine(message) {
        this._log(message);
    }
}
exports.StubLogger = StubLogger;
const config = new config_1.default();
const logger = new StubLogger(console.log);
const statusView = new StubStatusView(console.log);
const httpClient = new httpClient_1.default();
const decompressProvider = new decompressProvider_1.default();
let downloadProvider = new serviceDownloadProvider_1.default(config, logger, statusView, httpClient, decompressProvider);
let serverProvider = new server_1.default(downloadProvider, config, statusView);
/*
 * Installs the service for the given platform if it's not already installed.
 */
function installService(runtime) {
    if (runtime === undefined) {
        return platform_1.PlatformInformation.getCurrent().then((platformInfo) => {
            if (platformInfo.isValidRuntime) {
                return serverProvider.getOrDownloadServer(platformInfo.runtimeId);
            }
            else {
                throw new Error("unsupported runtime");
            }
        });
    }
    else {
        return serverProvider.getOrDownloadServer(runtime);
    }
}
/*
 * Returns the install folder path for given platform.
 */
function getServiceInstallDirectory(runtime) {
    return new Promise((resolve, reject) => {
        if (runtime === undefined) {
            platform_1.PlatformInformation.getCurrent()
                .then((platformInfo) => {
                if (platformInfo.isValidRuntime) {
                    resolve(downloadProvider.getOrMakeInstallDirectory(platformInfo.runtimeId));
                }
                else {
                    reject("unsupported runtime");
                }
            })
                .catch((error) => {
                reject(error);
            });
        }
        else {
            resolve(downloadProvider.getOrMakeInstallDirectory(runtime));
        }
    });
}
/*
 * Returns the path to the root folder of service install location.
 */
function getServiceInstallDirectoryRoot() {
    let directoryPath = downloadProvider.getInstallDirectoryRoot();
    directoryPath = directoryPath.replace("\\{#version#}\\{#platform#}", "");
    directoryPath = directoryPath.replace("/{#version#}/{#platform#}", "");
    return directoryPath;
}

//# sourceMappingURL=serviceInstallerUtil.js.map
