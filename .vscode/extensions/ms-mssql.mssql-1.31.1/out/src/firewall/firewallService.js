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
exports.FirewallService = void 0;
const firewallRequest_1 = require("../models/contracts/firewall/firewallRequest");
const Constants = require("../constants/constants");
const azureHelpers_1 = require("../connectionconfig/azureHelpers");
const utils_1 = require("../utils/utils");
const locConstants_1 = require("../constants/locConstants");
class FirewallService {
    constructor(accountService) {
        this.accountService = accountService;
    }
    createFirewallRule(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.accountService.client.sendResourceRequest(firewallRequest_1.CreateFirewallRuleRequest.type, params);
            return result;
        });
    }
    handleFirewallRule(errorCode, errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = {
                errorCode: errorCode,
                errorMessage: errorMessage,
                connectionTypeId: Constants.mssqlProviderName,
            };
            let result = yield this.accountService.client.sendResourceRequest(firewallRequest_1.HandleFirewallRuleRequest.type, params);
            return result;
        });
    }
    createFirewallRuleWithVscodeAccount(firewallRuleSpec, serverName) {
        return __awaiter(this, void 0, void 0, function* () {
            const [startIp, endIp] = typeof firewallRuleSpec.ip === "string"
                ? [firewallRuleSpec.ip, firewallRuleSpec.ip]
                : [firewallRuleSpec.ip.startIp, firewallRuleSpec.ip.endIp];
            let account, tokenMappings;
            try {
                ({ account, tokenMappings } = yield (0, azureHelpers_1.constructAzureAccountForTenant)(firewallRuleSpec.tenantId));
            }
            catch (err) {
                const error = new Error(locConstants_1.Azure.errorCreatingFirewallRule(`"${firewallRuleSpec.name}" (${startIp} - ${endIp})`, (0, utils_1.getErrorMessage)(err)));
                error.name = "constructAzureAccountForTenant";
                throw error;
            }
            try {
                const result = yield this.createFirewallRule({
                    account: account,
                    firewallRuleName: firewallRuleSpec.name,
                    startIpAddress: startIp,
                    endIpAddress: endIp,
                    serverName: serverName,
                    securityTokenMappings: tokenMappings,
                });
                if (!result.result) {
                    throw result.errorMessage;
                }
            }
            catch (err) {
                const error = new Error(locConstants_1.Azure.errorCreatingFirewallRule(`"${firewallRuleSpec.name}" (${startIp} - ${endIp})`, (0, utils_1.getErrorMessage)(err)));
                error.name = "createFirewallRule";
                throw error;
            }
        });
    }
}
exports.FirewallService = FirewallService;

//# sourceMappingURL=firewallService.js.map
