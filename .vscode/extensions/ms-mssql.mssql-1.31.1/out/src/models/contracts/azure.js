"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountType = exports.AzureAuthType = void 0;
var AzureAuthType;
(function (AzureAuthType) {
    AzureAuthType[AzureAuthType["AuthCodeGrant"] = 0] = "AuthCodeGrant";
    AzureAuthType[AzureAuthType["DeviceCode"] = 1] = "DeviceCode";
})(AzureAuthType || (exports.AzureAuthType = AzureAuthType = {}));
var AccountType;
(function (AccountType) {
    AccountType["Microsoft"] = "microsoft";
    AccountType["WorkSchool"] = "work_school";
})(AccountType || (exports.AccountType = AccountType = {}));

//# sourceMappingURL=azure.js.map
