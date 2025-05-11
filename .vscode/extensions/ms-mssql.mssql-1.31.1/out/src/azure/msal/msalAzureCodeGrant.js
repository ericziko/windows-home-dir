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
exports.MsalAzureCodeGrant = void 0;
const vscode = require("vscode");
const msal_node_1 = require("@azure/msal-node");
const azure_1 = require("../../models/contracts/azure");
const msalAzureAuth_1 = require("./msalAzureAuth");
const simpleWebServer_1 = require("../simpleWebServer");
const azureAuthError_1 = require("../azureAuthError");
const Constants = require("../constants");
const LocalizedConstants = require("../../constants/locConstants");
const path = require("path");
const fs_1 = require("fs");
class MsalAzureCodeGrant extends msalAzureAuth_1.MsalAzureAuth {
    constructor(providerSettings, context, clientApplication, vscodeWrapper, logger) {
        super(providerSettings, context, clientApplication, azure_1.AzureAuthType.AuthCodeGrant, vscodeWrapper, logger);
        this.providerSettings = providerSettings;
        this.context = context;
        this.clientApplication = clientApplication;
        this.vscodeWrapper = vscodeWrapper;
        this.logger = logger;
        this.cryptoProvider = new msal_node_1.CryptoProvider();
        this.pkceCodes = {
            nonce: "",
            challengeMethod: Constants.s256CodeChallengeMethod, // Use SHA256 as the challenge method
            codeVerifier: "", // Generate a code verifier for the Auth Code Request first
            codeChallenge: "", // Generate a code challenge from the previously generated code verifier
        };
    }
    login(tenant) {
        return __awaiter(this, void 0, void 0, function* () {
            let authCompleteDeferred;
            let authCompletePromise = new Promise((resolve, reject) => (authCompleteDeferred = { resolve, reject }));
            let serverPort;
            const server = new simpleWebServer_1.SimpleWebServer();
            try {
                serverPort = yield server.startup();
            }
            catch (ex) {
                const msg = LocalizedConstants.azureServerCouldNotStart;
                throw new azureAuthError_1.AzureAuthError(msg, "Server could not start", ex);
            }
            yield this.createCryptoValuesMsal();
            const state = `${serverPort},${this.pkceCodes.nonce}`;
            let authCodeRequest;
            let authority = this.loginEndpointUrl + tenant.id;
            this.logger.info(`Authority URL set to: ${authority}`);
            try {
                let authUrlRequest;
                authUrlRequest = {
                    scopes: this.scopes,
                    redirectUri: `${this.redirectUri}:${serverPort}/redirect`,
                    codeChallenge: this.pkceCodes.codeChallenge,
                    codeChallengeMethod: this.pkceCodes.challengeMethod,
                    prompt: Constants.selectAccount,
                    authority: authority,
                    state: state,
                };
                authCodeRequest = {
                    scopes: this.scopes,
                    redirectUri: `${this.redirectUri}:${serverPort}/redirect`,
                    codeVerifier: this.pkceCodes.codeVerifier,
                    authority: authority,
                    code: "",
                };
                let authCodeUrl = yield this.clientApplication.getAuthCodeUrl(authUrlRequest);
                yield vscode.env.openExternal(vscode.Uri.parse(`http://localhost:${serverPort}/signin?nonce=${encodeURIComponent(this.pkceCodes.nonce)}`));
                const authCode = yield this.addServerListeners(server, this.pkceCodes.nonce, authCodeUrl, authCompletePromise);
                authCodeRequest.code = authCode;
            }
            catch (e) {
                this.logger.error("MSAL: Error requesting auth code", e);
                throw new azureAuthError_1.AzureAuthError("error", "Error requesting auth code", e);
            }
            let result = yield this.clientApplication.acquireTokenByCode(authCodeRequest);
            if (!result) {
                this.logger.error("Failed to acquireTokenByCode");
                this.logger.error(`Auth Code Request: ${JSON.stringify(authCodeRequest)}`);
                throw Error("Failed to fetch token using auth code");
            }
            else {
                return {
                    response: result,
                    authComplete: authCompleteDeferred,
                };
            }
        });
    }
    addServerListeners(server, nonce, loginUrl, authComplete) {
        return __awaiter(this, void 0, void 0, function* () {
            const mediaPath = path.join(this.context.extensionPath, "media");
            // Utility function
            const sendFile = (res, filePath, contentType) => __awaiter(this, void 0, void 0, function* () {
                let fileContents;
                try {
                    fileContents = yield fs_1.promises.readFile(filePath);
                }
                catch (ex) {
                    this.logger.error(ex);
                    res.writeHead(400);
                    res.end();
                    return;
                }
                res.writeHead(200, {
                    "Content-Length": fileContents.length,
                    "Content-Type": contentType,
                });
                res.end(fileContents);
            });
            server.on("/landing.css", (req, reqUrl, res) => {
                sendFile(res, path.join(mediaPath, "landing.css"), "text/css; charset=utf-8").catch(this.logger.error);
            });
            server.on("/SignIn.svg", (req, reqUrl, res) => {
                sendFile(res, path.join(mediaPath, "SignIn.svg"), "image/svg+xml").catch(this.logger.error);
            });
            server.on("/signin", (req, reqUrl, res) => {
                let receivedNonce = reqUrl.query.nonce;
                receivedNonce = receivedNonce.replace(/ /g, "+");
                if (receivedNonce !== nonce) {
                    res.writeHead(400, { "content-type": "text/html" });
                    res.write(LocalizedConstants.azureAuthNonceError);
                    res.end();
                    this.logger.error("nonce no match", receivedNonce, nonce);
                    return;
                }
                res.writeHead(302, { Location: loginUrl });
                res.end();
            });
            return new Promise((resolve, reject) => {
                server.on("/redirect", (req, reqUrl, res) => {
                    var _a;
                    const state = (_a = reqUrl.query.state) !== null && _a !== void 0 ? _a : "";
                    const split = state.split(",");
                    if (split.length !== 2) {
                        res.writeHead(400, { "content-type": "text/html" });
                        res.write(LocalizedConstants.azureAuthStateError);
                        res.end();
                        reject(new Error("State mismatch"));
                        return;
                    }
                    const port = split[0];
                    res.writeHead(302, {
                        Location: `http://127.0.0.1:${port}/callback${reqUrl.search}`,
                    });
                    res.end();
                });
                server.on("/callback", (req, reqUrl, res) => {
                    var _a, _b;
                    const state = (_a = reqUrl.query.state) !== null && _a !== void 0 ? _a : "";
                    const code = (_b = reqUrl.query.code) !== null && _b !== void 0 ? _b : "";
                    const stateSplit = state.split(",");
                    if (stateSplit.length !== 2) {
                        res.writeHead(400, { "content-type": "text/html" });
                        res.write(LocalizedConstants.azureAuthStateError);
                        res.end();
                        reject(new Error("State mismatch"));
                        return;
                    }
                    if (stateSplit[1] !== encodeURIComponent(nonce)) {
                        res.writeHead(400, { "content-type": "text/html" });
                        res.write(LocalizedConstants.azureAuthNonceError);
                        res.end();
                        reject(new Error("Nonce mismatch"));
                        return;
                    }
                    resolve(code);
                    authComplete.then(() => {
                        sendFile(res, path.join(mediaPath, "landing.html"), "text/html; charset=utf-8").catch(console.error);
                    }, (ex) => {
                        res.writeHead(400, { "content-type": "text/html" });
                        res.write(ex.message);
                        res.end();
                    });
                });
            });
        });
    }
    createCryptoValuesMsal() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pkceCodes.nonce = this.cryptoProvider.createNewGuid();
            const { verifier, challenge } = yield this.cryptoProvider.generatePkceCodes();
            this.pkceCodes.codeVerifier = verifier;
            this.pkceCodes.codeChallenge = challenge;
        });
    }
}
exports.MsalAzureCodeGrant = MsalAzureCodeGrant;

//# sourceMappingURL=msalAzureCodeGrant.js.map
