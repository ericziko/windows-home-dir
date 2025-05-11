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
exports.CredentialStore = void 0;
const serviceclient_1 = require("../languageservice/serviceclient");
const Contracts = require("../models/contracts");
const Utils = require("../models/utils");
/**
 * Implements a credential storage for Windows, Mac (darwin), or Linux.
 * Allows a single credential to be stored per service (that is, one username per service);
 */
class CredentialStore {
    constructor(_context, _client) {
        this._context = _context;
        this._client = _client;
        if (!this._client) {
            this._client = serviceclient_1.default.instance;
        }
        this._secretStorage = this._context.secrets;
    }
    /**
     * Gets a credential saved in the credential store
     * @param credentialId the ID uniquely identifying this credential
     * @returns Promise that resolved to the credential, or undefined if not found
     */
    readCredential(credentialId) {
        return __awaiter(this, void 0, void 0, function* () {
            let cred = new Contracts.Credential();
            cred.credentialId = credentialId;
            if (Utils.isLinux) {
                cred.password = yield this._secretStorage.get(credentialId);
                return cred;
            }
            return yield this._client.sendRequest(Contracts.ReadCredentialRequest.type, cred);
        });
    }
    saveCredential(credentialId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let cred = new Contracts.Credential();
            cred.credentialId = credentialId;
            cred.password = password;
            /* This is only done for linux because this is going to be
             * the default credential system for linux in a future release
             */
            if (Utils.isLinux) {
                yield this._secretStorage.store(credentialId, password);
            }
            const success = yield this._client.sendRequest(Contracts.SaveCredentialRequest.type, cred);
            return success;
        });
    }
    deleteCredential(credentialId) {
        return __awaiter(this, void 0, void 0, function* () {
            let cred = new Contracts.Credential();
            cred.credentialId = credentialId;
            if (Utils.isLinux) {
                yield this._secretStorage.delete(credentialId);
            }
            const success = yield this._client.sendRequest(Contracts.DeleteCredentialRequest.type, cred);
            return success;
        });
    }
}
exports.CredentialStore = CredentialStore;

//# sourceMappingURL=credentialstore.js.map
