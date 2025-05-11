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
exports.AccountService = void 0;
const Constants = require("../constants/constants");
const providerSettings_1 = require("../azure/providerSettings");
const azure_1 = require("../models/contracts/azure");
class AccountService {
    constructor(_client, _accountStore, _azureController) {
        this._client = _client;
        this._accountStore = _accountStore;
        this._azureController = _azureController;
        this._account = undefined;
        this.commonTenant = {
            id: "common",
            displayName: "common",
        };
    }
    get account() {
        return this._account;
    }
    setAccount(account) {
        this._account = account;
    }
    get client() {
        return this._client;
    }
    convertToAzureAccount(azureSession) {
        let tenant = {
            displayName: Constants.tenantDisplayName,
            id: azureSession.tenantId,
            userId: azureSession.userId,
        };
        let key = {
            providerId: Constants.resourceProviderId,
            id: azureSession.userId,
        };
        let account = {
            key: key,
            displayInfo: {
                userId: azureSession.userId,
                displayName: undefined,
                accountType: undefined,
                name: undefined,
            },
            properties: {
                tenants: [tenant],
                owningTenant: tenant,
                azureAuthType: azure_1.AzureAuthType.AuthCodeGrant,
                providerSettings: providerSettings_1.default,
                isMsAccount: false,
            },
            isStale: this._isStale,
            isSignedIn: false,
        };
        return account;
    }
    /**
     * Creates access token mappings for user selected account and tenant.
     * @param account User account to fetch tokens for.
     * @param tenantId Tenant Id for which refresh token is needed
     * @returns Security token mappings
     */
    createSecurityTokenMapping(account, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: match type for mapping in mssql and sqltoolsservice
            let mapping = {};
            mapping[tenantId] = {
                token: (yield this.refreshToken(account, tenantId)).token,
            };
            return mapping;
        });
    }
    refreshToken(account, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._azureController.refreshAccessToken(account, this._accountStore, tenantId, providerSettings_1.default.resources.azureManagementResource);
        });
    }
    getHomeTenant(account) {
        var _a, _b;
        // Home is defined by the API
        // Lets pick the home tenant - and fall back to commonTenant if they don't exist
        return ((_b = (_a = account.properties.tenants.find((t) => t.tenantCategory === "Home")) !== null && _a !== void 0 ? _a : account.properties.tenants[0]) !== null && _b !== void 0 ? _b : this.commonTenant);
    }
}
exports.AccountService = AccountService;

//# sourceMappingURL=accountService.js.map
