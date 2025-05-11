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
exports.MsalAzureDeviceCode = void 0;
const vscode = require("vscode");
const LocalizedConstants = require("../../constants/locConstants");
const azure_1 = require("../../models/contracts/azure");
const msalAzureAuth_1 = require("./msalAzureAuth");
class MsalAzureDeviceCode extends msalAzureAuth_1.MsalAzureAuth {
    constructor(providerSettings, context, clientApplication, vscodeWrapper, logger) {
        super(providerSettings, context, clientApplication, azure_1.AzureAuthType.DeviceCode, vscodeWrapper, logger);
        this.providerSettings = providerSettings;
        this.context = context;
        this.clientApplication = clientApplication;
        this.vscodeWrapper = vscodeWrapper;
        this.logger = logger;
    }
    login(tenant) {
        return __awaiter(this, void 0, void 0, function* () {
            let authCompleteDeferred;
            let authCompletePromise = new Promise((resolve, reject) => (authCompleteDeferred = { resolve, reject }));
            let authority = this.loginEndpointUrl + tenant.id;
            this.logger.info(`Authority URL set to: ${authority}`);
            const deviceCodeRequest = {
                scopes: this.scopes,
                authority: authority,
                deviceCodeCallback: (response) => __awaiter(this, void 0, void 0, function* () {
                    yield this.displayDeviceCodeScreen(response.message, response.userCode, response.verificationUri);
                }),
            };
            const authResult = yield this.clientApplication.acquireTokenByDeviceCode(deviceCodeRequest);
            this.logger.pii(`Authentication completed for account: ${authResult === null || authResult === void 0 ? void 0 : authResult.account.name}, tenant: ${authResult === null || authResult === void 0 ? void 0 : authResult.tenantId}`);
            this.closeOnceComplete(authCompletePromise).catch(this.logger.error);
            return {
                response: authResult,
                authComplete: authCompleteDeferred,
            };
        });
    }
    closeOnceComplete(promise) {
        return __awaiter(this, void 0, void 0, function* () {
            yield promise;
        });
    }
    displayDeviceCodeScreen(msg, userCode, verificationUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            // create a notification with the device code message, usercode, and verificationurl
            const selection = yield this.vscodeWrapper.showInformationMessage(msg, LocalizedConstants.msgCopyAndOpenWebpage);
            if (selection === LocalizedConstants.msgCopyAndOpenWebpage) {
                this.vscodeWrapper.clipboardWriteText(userCode);
                yield vscode.env.openExternal(vscode.Uri.parse(verificationUrl));
                console.log(msg);
                console.log(userCode);
                console.log(verificationUrl);
            }
            return;
        });
    }
}
exports.MsalAzureDeviceCode = MsalAzureDeviceCode;

//# sourceMappingURL=msalAzureDeviceCode.js.map
