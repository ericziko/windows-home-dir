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
exports.FileEncryptionHelper = void 0;
const os = require("os");
const crypto = require("crypto");
const vscode = require("vscode");
const LocalizedConstants = require("../constants/locConstants");
const connection_1 = require("../models/contracts/connection");
const serviceclient_1 = require("../languageservice/serviceclient");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class FileEncryptionHelper {
    constructor(_credentialStore, _vscodeWrapper, _logger, _fileName) {
        this._credentialStore = _credentialStore;
        this._vscodeWrapper = _vscodeWrapper;
        this._logger = _logger;
        this._fileName = _fileName;
        this.ivCredId = `${this._fileName}-iv`;
        this.keyCredId = `${this._fileName}-key`;
        this.fileSaver = (content) => __awaiter(this, void 0, void 0, function* () {
            if (!this._keyBuffer || !this._ivBuffer) {
                yield this.init();
            }
            const cipherIv = crypto.createCipheriv(this._algorithm, this._keyBuffer, this._ivBuffer);
            let cipherText = `${cipherIv.update(content, "utf8", this._binaryEncoding)}${cipherIv.final(this._binaryEncoding)}`;
            return cipherText;
        });
        this.fileOpener = (content, resetOnError) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this._keyBuffer || !this._ivBuffer) {
                    yield this.init();
                }
                let plaintext = content;
                const decipherIv = crypto.createDecipheriv(this._algorithm, this._keyBuffer, this._ivBuffer);
                return `${decipherIv.update(plaintext, this._binaryEncoding, "utf8")}${decipherIv.final("utf8")}`;
            }
            catch (ex) {
                this._logger.error(`FileEncryptionHelper: Error occurred when decrypting data, IV/KEY will be reset: ${ex}`);
                if (resetOnError) {
                    // Reset IV/Keys if crypto cannot encrypt/decrypt data.
                    // This could be a possible case of corruption of expected iv/key combination
                    yield this.clearEncryptionKeys();
                    yield this.init();
                }
                // Throw error so cache file can be reset to empty.
                throw new Error(`Decryption failed with error: ${ex}`);
            }
        });
        this._algorithm = "aes-256-cbc";
        this._bufferEncoding = "utf16le";
        this._binaryEncoding = "base64";
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const iv = yield this.readEncryptionKey(this.ivCredId);
            const key = yield this.readEncryptionKey(this.keyCredId);
            if (!iv || !key) {
                this._ivBuffer = crypto.randomBytes(16);
                this._keyBuffer = crypto.randomBytes(32);
                if (!(yield this.saveEncryptionKey(this.ivCredId, this._ivBuffer.toString(this._bufferEncoding))) ||
                    !(yield this.saveEncryptionKey(this.keyCredId, this._keyBuffer.toString(this._bufferEncoding)))) {
                    this._logger.error(`Encryption keys could not be saved in credential store, this will cause access token persistence issues.`);
                    yield this.showCredSaveErrorOnWindows();
                }
            }
            else {
                this._ivBuffer = Buffer.from(iv, this._bufferEncoding);
                this._keyBuffer = Buffer.from(key, this._bufferEncoding);
            }
            if ((0, utils_1.getEnableSqlAuthenticationProviderConfig)()) {
                serviceclient_1.default.instance.sendNotification(connection_1.EncryptionKeysChangedNotification.type, {
                    iv: this._ivBuffer.toString(this._bufferEncoding),
                    key: this._keyBuffer.toString(this._bufferEncoding),
                });
            }
        });
    }
    /**
     * Creates credential Id similar to ADS to prevent creating multiple credentials
     * and this will also be read by STS in same pattern.
     * @param credentialId Credential Id
     * @returns Prefix credential Id.
     */
    getPrefixedCredentialId(credentialId) {
        return `${constants_1.azureAccountProviderCredentials}|${credentialId}`;
    }
    readEncryptionKey(credentialId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = (yield this._credentialStore.readCredential(this.getPrefixedCredentialId(credentialId)))) === null || _a === void 0 ? void 0 : _a.password;
        });
    }
    saveEncryptionKey(credentialId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let status = false;
            let prefixedCredentialId = this.getPrefixedCredentialId(credentialId);
            try {
                yield this._credentialStore.saveCredential(prefixedCredentialId, password).then((result) => {
                    status = result;
                    if (result) {
                        this._logger.info(`FileEncryptionHelper: Successfully saved encryption key ${prefixedCredentialId} for persistent cache encryption in system credential store.`);
                    }
                }, (e) => {
                    throw Error(`FileEncryptionHelper: Could not save encryption key: ${prefixedCredentialId}: ${e}`);
                });
            }
            catch (ex) {
                if (os.platform() === "win32") {
                    this._logger.error(`FileEncryptionHelper: Please try cleaning saved credentials from Windows Credential Manager created by Azure Data Studio to allow creating new credentials.`);
                }
                this._logger.error(ex);
                throw ex;
            }
            return status;
        });
    }
    clearEncryptionKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteEncryptionKey(this.ivCredId);
            yield this.deleteEncryptionKey(this.keyCredId);
            this._ivBuffer = undefined;
            this._keyBuffer = undefined;
        });
    }
    deleteEncryptionKey(credentialId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._credentialStore.deleteCredential(credentialId);
        });
    }
    showCredSaveErrorOnWindows() {
        return __awaiter(this, void 0, void 0, function* () {
            if (os.platform() === "win32") {
                yield this._vscodeWrapper
                    .showWarningMessageAdvanced(LocalizedConstants.msgAzureCredStoreSaveFailedError, undefined, [LocalizedConstants.reloadChoice, LocalizedConstants.Common.cancel])
                    .then((selection) => __awaiter(this, void 0, void 0, function* () {
                    if (selection === LocalizedConstants.reloadChoice) {
                        yield vscode.commands.executeCommand("workbench.action.reloadWindow");
                    }
                }), (error) => {
                    this._logger.error(error);
                });
            }
        });
    }
}
exports.FileEncryptionHelper = FileEncryptionHelper;

//# sourceMappingURL=fileEncryptionHelper.js.map
