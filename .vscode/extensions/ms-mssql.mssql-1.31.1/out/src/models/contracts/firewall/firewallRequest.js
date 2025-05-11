"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleFirewallRuleRequest = exports.CreateFirewallRuleRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
// ------------------------------- < Resource Events > ------------------------------------
var CreateFirewallRuleRequest;
(function (CreateFirewallRuleRequest) {
    CreateFirewallRuleRequest.type = new vscode_languageclient_1.RequestType("resource/createFirewallRule");
})(CreateFirewallRuleRequest || (exports.CreateFirewallRuleRequest = CreateFirewallRuleRequest = {}));
var HandleFirewallRuleRequest;
(function (HandleFirewallRuleRequest) {
    HandleFirewallRuleRequest.type = new vscode_languageclient_1.RequestType("resource/handleFirewallRule");
})(HandleFirewallRuleRequest || (exports.HandleFirewallRuleRequest = HandleFirewallRuleRequest = {}));

//# sourceMappingURL=firewallRequest.js.map
