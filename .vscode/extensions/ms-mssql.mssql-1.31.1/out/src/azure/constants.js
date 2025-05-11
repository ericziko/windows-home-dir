"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = exports.ProxyStatus = exports.HttpStatus = exports.HttpMethod = exports.AccountIssuer = exports.organizationTenant = exports.commonTenant = exports.selectAccount = exports.s256CodeChallengeMethod = exports.bearer = exports.accountVersion = exports.noAccountInSilentRequestError = exports.mdsUserAccountNotReceived = exports.mdsUserAccountNotFound = exports.AADSTS50020 = exports.AADSTS50173 = exports.AADSTS70043 = exports.oldMsalCacheFileName = exports.azureTenantConfigSection = exports.accountsAzureCloudSection = exports.accountsAzureAuthSection = exports.accountsClearTokenCacheCommand = exports.mssqlAuthenticationProviderConfig = exports.enableConnectionPoolingSection = exports.sqlAuthProviderSection = exports.tenantSection = exports.mssqlSection = exports.configSection = exports.clearTokenCacheCommand = exports.cloudSection = exports.azureAccountProviderCredentials = exports.azureSection = exports.authSection = exports.accountsSection = exports.account = exports.homeCategory = exports.azureAccountDirectory = exports.extensionConfigSectionName = exports.httpConfigSectionName = exports.serviceName = void 0;
exports.serviceName = "Code";
exports.httpConfigSectionName = "http";
exports.extensionConfigSectionName = "mssql";
exports.azureAccountDirectory = "Azure Accounts";
exports.homeCategory = "Home";
exports.account = "account";
exports.accountsSection = "accounts";
exports.authSection = "auth";
exports.azureSection = "azure";
exports.azureAccountProviderCredentials = "azureAccountProviderCredentials";
exports.cloudSection = "cloud";
exports.clearTokenCacheCommand = "clearTokenCache";
exports.configSection = "config";
exports.mssqlSection = "mssql";
exports.tenantSection = "tenant";
exports.sqlAuthProviderSection = "enableSqlAuthenticationProvider";
exports.enableConnectionPoolingSection = "enableConnectionPooling";
exports.mssqlAuthenticationProviderConfig = exports.mssqlSection + "." + exports.sqlAuthProviderSection;
exports.accountsClearTokenCacheCommand = exports.accountsSection + "." + exports.clearTokenCacheCommand;
exports.accountsAzureAuthSection = exports.accountsSection + "." + exports.azureSection + "." + exports.authSection;
exports.accountsAzureCloudSection = exports.accountsSection + "." + exports.azureSection + "." + exports.cloudSection;
exports.azureTenantConfigSection = exports.azureSection + "." + exports.tenantSection + "." + exports.configSection;
exports.oldMsalCacheFileName = "azureTokenCacheMsal-azure_publicCloud";
/////// MSAL ERROR CODES, ref: https://learn.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
/**
 * The refresh token has expired or is invalid due to sign-in frequency checks by conditional access.
 * The token was issued on {issueDate} and the maximum allowed lifetime for this request is {time}.
 */
exports.AADSTS70043 = "AADSTS70043";
/**
 * FreshTokenNeeded - The provided grant has expired due to it being revoked, and a fresh auth token is needed.
 * Either an admin or a user revoked the tokens for this user, causing subsequent token refreshes to fail and
 * require reauthentication. Have the user sign in again.
 */
exports.AADSTS50173 = "AADSTS50173";
/**
 * User account 'user@domain.com' from identity provider {IdentityProviderURL} does not exist in tenant {ResourceTenantName}.
 * This error occurs when account is authenticated without a tenant id, which happens when tenant Id is not available in connection profile.
 * We have the user sign in again when this error occurs.
 */
exports.AADSTS50020 = "AADSTS50020";
/**
 * Error thrown from STS - indicates user account not found in MSAL cache.
 * We request user to sign in again.
 */
exports.mdsUserAccountNotFound = `User account '{0}' not found in MSAL cache, please add linked account or refresh account credentials.`;
/**
 * Error thrown from STS - indicates user account info not received from connection profile.
 * This is possible when account info is not available when populating user's preferred name in connection profile.
 * We request user to sign in again, to refresh their account credentials.
 */
exports.mdsUserAccountNotReceived = "User account not received.";
/**
 * This error is thrown by MSAL when user account is not received in silent authentication request.
 * Thrown by TS layer, indicates user account hint not provided. We request user to reauthenticate when this error occurs.
 */
exports.noAccountInSilentRequestError = "no_account_in_silent_request";
/** MSAL Account version */
exports.accountVersion = "2.0";
exports.bearer = "Bearer";
/**
 * Use SHA-256 algorithm
 */
exports.s256CodeChallengeMethod = "S256";
exports.selectAccount = "select_account";
exports.commonTenant = {
    id: "common",
    displayName: "common",
};
exports.organizationTenant = {
    id: "organizations",
    displayName: "organizations",
};
/**
 * Account issuer as received from access token
 */
var AccountIssuer;
(function (AccountIssuer) {
    AccountIssuer["Corp"] = "corp";
    AccountIssuer["Msft"] = "msft";
})(AccountIssuer || (exports.AccountIssuer = AccountIssuer = {}));
/**
 * http methods
 */
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "get";
    HttpMethod["POST"] = "post";
})(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["SUCCESS_RANGE_START"] = 200] = "SUCCESS_RANGE_START";
    HttpStatus[HttpStatus["SUCCESS_RANGE_END"] = 299] = "SUCCESS_RANGE_END";
    HttpStatus[HttpStatus["REDIRECT"] = 302] = "REDIRECT";
    HttpStatus[HttpStatus["CLIENT_ERROR_RANGE_START"] = 400] = "CLIENT_ERROR_RANGE_START";
    HttpStatus[HttpStatus["CLIENT_ERROR_RANGE_END"] = 499] = "CLIENT_ERROR_RANGE_END";
    HttpStatus[HttpStatus["SERVER_ERROR_RANGE_START"] = 500] = "SERVER_ERROR_RANGE_START";
    HttpStatus[HttpStatus["SERVER_ERROR_RANGE_END"] = 599] = "SERVER_ERROR_RANGE_END";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
var ProxyStatus;
(function (ProxyStatus) {
    ProxyStatus[ProxyStatus["SUCCESS_RANGE_START"] = 200] = "SUCCESS_RANGE_START";
    ProxyStatus[ProxyStatus["SUCCESS_RANGE_END"] = 299] = "SUCCESS_RANGE_END";
    ProxyStatus[ProxyStatus["SERVER_ERROR"] = 500] = "SERVER_ERROR";
})(ProxyStatus || (exports.ProxyStatus = ProxyStatus = {}));
/**
 * Constants
 */
exports.constants = {
    MSAL_SKU: "msal.js.node",
    JWT_BEARER_ASSERTION_TYPE: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    AUTHORIZATION_PENDING: "authorization_pending",
    HTTP_PROTOCOL: "http://",
    LOCALHOST: "localhost",
};

//# sourceMappingURL=constants.js.map
