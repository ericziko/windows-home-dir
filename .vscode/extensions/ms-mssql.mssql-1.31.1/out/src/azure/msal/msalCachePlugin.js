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
exports.MsalCachePluginProvider = void 0;
const fs_1 = require("fs");
const lockFile = require("lockfile");
const path = require("path");
const fileEncryptionHelper_1 = require("../fileEncryptionHelper");
class MsalCachePluginProvider {
    constructor(_serviceName, _msalFilePath, _vscodeWrapper, _logger, _credentialStore) {
        this._serviceName = _serviceName;
        this._msalFilePath = _msalFilePath;
        this._vscodeWrapper = _vscodeWrapper;
        this._logger = _logger;
        this._credentialStore = _credentialStore;
        this._lockTaken = false;
        this._msalFilePath = path.join(this._msalFilePath, this._serviceName);
        this._serviceName = this._serviceName.replace(/-/, "_");
        this._fileEncryptionHelper = new fileEncryptionHelper_1.FileEncryptionHelper(this._credentialStore, this._vscodeWrapper, this._logger, this._serviceName);
        this._logger.verbose(`MsalCachePluginProvider: Using cache path ${_msalFilePath} and serviceName ${_serviceName}`);
    }
    getLockfilePath() {
        return this._msalFilePath + ".lockfile";
    }
    /**
     * Deletes Msal access token cache file
     */
    unlinkMsalCache() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.promises.unlink(this._msalFilePath);
        });
    }
    clearCacheEncryptionKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._fileEncryptionHelper.clearEncryptionKeys();
        });
    }
    getCachePlugin() {
        const lockFilePath = this.getLockfilePath();
        const beforeCacheAccess = (cacheContext) => __awaiter(this, void 0, void 0, function* () {
            yield this.waitAndLock(lockFilePath);
            try {
                const cache = yield fs_1.promises.readFile(this._msalFilePath, {
                    encoding: "utf8",
                });
                const decryptedCache = yield this._fileEncryptionHelper.fileOpener(cache);
                try {
                    cacheContext.tokenCache.deserialize(decryptedCache);
                }
                catch (e) {
                    // Handle deserialization error in cache file in case file gets corrupted.
                    // Clearing cache here will ensure account is marked stale so re-authentication can be triggered.
                    this._logger.verbose(`MsalCachePlugin: Error occurred when trying to read cache file, file contents will be cleared: ${e.message}`);
                    yield fs_1.promises.unlink(this._msalFilePath);
                }
                this._logger.verbose(`MsalCachePlugin: Token read from cache successfully.`);
            }
            catch (e) {
                if (e.code === "ENOENT") {
                    // File doesn't exist, log and continue
                    this._logger.verbose(`MsalCachePlugin: Cache file not found on disk: ${e.code}`);
                }
                else {
                    this._logger.error(`MsalCachePlugin: Failed to read from cache file, file contents will be cleared : ${e}`);
                    yield fs_1.promises.unlink(this._msalFilePath);
                }
            }
            finally {
                lockFile.unlockSync(lockFilePath);
                this._lockTaken = false;
            }
        });
        const afterCacheAccess = (cacheContext) => __awaiter(this, void 0, void 0, function* () {
            if (cacheContext.cacheHasChanged) {
                yield this.waitAndLock(lockFilePath);
                try {
                    const cache = cacheContext.tokenCache.serialize();
                    const encryptedCache = yield this._fileEncryptionHelper.fileSaver(cache);
                    yield fs_1.promises.writeFile(this._msalFilePath, encryptedCache, {
                        encoding: "utf8",
                    });
                    this._logger.verbose(`MsalCachePlugin: Token written to cache successfully.`);
                }
                catch (e) {
                    this._logger.error(`MsalCachePlugin: Failed to write to cache file. ${e}`);
                    throw e;
                }
                finally {
                    lockFile.unlockSync(lockFilePath);
                    this._lockTaken = false;
                }
            }
        });
        // This is an implementation of ICachePlugin that uses the beforeCacheAccess and afterCacheAccess callbacks to read and write to a file
        // Ref https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-node-migration#enable-token-caching
        // In future we should use msal-node-extensions to provide a secure storage of tokens, instead of implementing our own
        // However - as of now this library does not come with pre-compiled native libraries that causes runtime issues
        // Ref https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/3332
        return {
            beforeCacheAccess,
            afterCacheAccess,
        };
    }
    waitAndLock(lockFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Make 500 retry attempts with 100ms wait time between each attempt to allow enough time for the lock to be released.
            const retries = 500;
            const retryWait = 100;
            // We cannot rely on lockfile.lockSync() to clear stale lockfile,
            // so we check if the lockfile exists and if it does, calling unlockSync() will clear it.
            if (lockFile.checkSync(lockFilePath) && !this._lockTaken) {
                lockFile.unlockSync(lockFilePath);
                this._logger.verbose(`MsalCachePlugin: Stale lockfile found and has been removed.`);
            }
            let retryAttempt = 0;
            while (retryAttempt <= retries) {
                try {
                    // Use lockfile.lockSync() to ensure only one process is accessing the cache at a time.
                    // lockfile.lock() does not wait for async callback promise to resolve.
                    lockFile.lockSync(lockFilePath);
                    this._lockTaken = true;
                    break;
                }
                catch (e) {
                    if (retryAttempt === retries) {
                        this._logger.error(`MsalCachePlugin: Failed to acquire lock on cache file after ${retries} attempts.`);
                        throw new Error(`Failed to acquire lock on cache file after ${retries} attempts. Please try clearing Access token cache.`);
                    }
                    retryAttempt++;
                    this._logger.verbose(`MsalCachePlugin: Failed to acquire lock on cache file. Retrying in ${retryWait} ms.`);
                    yield new Promise((resolve) => setTimeout(() => resolve, retryWait));
                }
            }
        });
    }
}
exports.MsalCachePluginProvider = MsalCachePluginProvider;

//# sourceMappingURL=msalCachePlugin.js.map
