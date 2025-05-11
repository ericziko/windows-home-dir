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
exports.MsalAzureAuth = void 0;
const msal_node_1 = require("@azure/msal-node");
const url = require("url");
const vscode = require("vscode");
const LocalizedConstants = require("../../constants/locConstants");
const azure_1 = require("../../models/contracts/azure");
const azureAuthError_1 = require("../azureAuthError");
const Constants = require("../constants");
const axios_1 = require("axios");
const tunnel = require("tunnel");
class MsalAzureAuth {
    constructor(providerSettings, context, clientApplication, authType, vscodeWrapper, logger) {
        var _a;
        this.providerSettings = providerSettings;
        this.context = context;
        this.clientApplication = clientApplication;
        this.authType = authType;
        this.vscodeWrapper = vscodeWrapper;
        this.logger = logger;
        this.loginEndpointUrl =
            (_a = this.providerSettings.loginEndpoint) !== null && _a !== void 0 ? _a : "https://login.microsoftonline.com/";
        this.redirectUri = "http://localhost";
        this.clientId = this.providerSettings.clientId;
        this.scopes = [...this.providerSettings.scopes];
        this.scopesString = this.scopes.join(" ");
    }
    startLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let loginComplete = undefined;
            try {
                this.logger.verbose("Starting login");
                if (!this.providerSettings.resources.windowsManagementResource) {
                    throw new Error(LocalizedConstants.azureNoMicrosoftResource(this.providerSettings.displayName));
                }
                const result = yield this.login(Constants.organizationTenant);
                loginComplete = result.authComplete;
                if (!(result === null || result === void 0 ? void 0 : result.response) || !((_a = result.response) === null || _a === void 0 ? void 0 : _a.account)) {
                    this.logger.error(`Authentication failed: ${loginComplete}`);
                    return {
                        canceled: false,
                    };
                }
                const token = {
                    token: result.response.accessToken,
                    key: result.response.account.homeAccountId,
                    tokenType: result.response.tokenType,
                };
                const tokenClaims = result.response.idTokenClaims;
                const account = yield this.hydrateAccount(token, tokenClaims);
                loginComplete === null || loginComplete === void 0 ? void 0 : loginComplete.resolve();
                return account;
            }
            catch (ex) {
                this.logger.error(`Login failed: ${ex}`);
                if (ex instanceof azureAuthError_1.AzureAuthError) {
                    if (loginComplete) {
                        loginComplete.reject(ex);
                        this.logger.error(ex);
                    }
                    else {
                        void vscode.window.showErrorMessage(ex.message);
                        this.logger.error(ex.originalMessageAndException);
                    }
                }
                else {
                    this.logger.error(ex);
                }
                return {
                    canceled: false,
                };
            }
        });
    }
    hydrateAccount(token, tokenClaims) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenants = yield this.getTenants(token.token);
            let account = this.createAccount(tokenClaims, token.key, tenants);
            return account;
        });
    }
    /**
     * Gets the access token for the correct account and scope from the token cache, if the correct token doesn't exist in the token cache
     * (i.e. expired token, wrong scope, etc.), sends a request for a new token using the refresh token
     * @param account
     * @param azureResource
     * @returns The authentication result, including the access token
     */
    getToken(account, tenantId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountInfo;
            try {
                accountInfo = yield this.getAccountFromMsalCache(account.key.id);
            }
            catch (e) {
                this.logger.error("Error: Could not fetch account from MSAL cache, re-authentication needed.");
                // build refresh token request
                const tenant = {
                    id: tenantId,
                    displayName: "",
                };
                return this.handleInteractionRequired(tenant, settings, false);
            }
            // Resource endpoint must end with '/' to form a valid scope for MSAL token request.
            const endpoint = settings.endpoint.endsWith("/")
                ? settings.endpoint
                : settings.endpoint + "/";
            if (!account) {
                this.logger.error("Error: Account not received.");
                return null;
            }
            if (!tenantId) {
                tenantId = account.properties.owningTenant.id;
            }
            let newScope;
            if (settings.id === this.providerSettings.resources.windowsManagementResource.id) {
                newScope = [`${endpoint}user_impersonation`];
            }
            else {
                newScope = [`${endpoint}.default`];
            }
            let authority = this.loginEndpointUrl + tenantId;
            this.logger.info(`Authority URL set to: ${authority}`);
            // construct request
            // forceRefresh needs to be set true here in order to fetch the correct token, due to this issue
            // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/3687
            const tokenRequest = {
                account: accountInfo,
                authority: authority,
                scopes: newScope,
                forceRefresh: true,
            };
            try {
                return yield this.clientApplication.acquireTokenSilent(tokenRequest);
            }
            catch (e) {
                this.logger.error("Failed to acquireTokenSilent", e);
                if (e instanceof msal_node_1.AuthError && this.accountNeedsRefresh(e)) {
                    // build refresh token request
                    const tenant = {
                        id: tenantId,
                        displayName: "",
                    };
                    return this.handleInteractionRequired(tenant, settings);
                }
                else if (e.name === "ClientAuthError") {
                    this.logger.verbose("[ClientAuthError] Failed to silently acquire token");
                }
                this.logger.error(`Failed to silently acquire token, not InteractionRequiredAuthError: ${e.message}`);
                throw e;
            }
        });
    }
    /**
     * Determines whether the account needs to be refreshed based on received error instance
     * and STS error codes from errorMessage.
     * @param error AuthError instance
     */
    accountNeedsRefresh(error) {
        return (error instanceof msal_node_1.InteractionRequiredAuthError ||
            error.errorMessage.includes(Constants.AADSTS70043) ||
            error.errorMessage.includes(Constants.AADSTS50020) ||
            error.errorMessage.includes(Constants.AADSTS50173));
    }
    refreshAccessToken(account, tenantId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (account) {
                try {
                    const tokenResult = yield this.getToken(account, tenantId, settings);
                    if (!tokenResult) {
                        account.isStale = true;
                        return account;
                    }
                    const tokenClaims = this.getTokenClaims(tokenResult.accessToken);
                    if (!tokenClaims) {
                        account.isStale = true;
                        return account;
                    }
                    const token = {
                        key: tokenResult.account.homeAccountId,
                        token: tokenResult.accessToken,
                        tokenType: tokenResult.tokenType,
                        expiresOn: tokenResult.account.idTokenClaims.exp,
                    };
                    return yield this.hydrateAccount(token, tokenClaims);
                }
                catch (ex) {
                    account.isStale = true;
                    throw ex;
                }
            }
            else {
                this.logger.error(`refreshAccessToken: Account not received for refreshing access token.`);
                throw Error(LocalizedConstants.msgAccountNotFound);
            }
        });
    }
    loadTokenCache() {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenCache = this.clientApplication.getTokenCache();
            void tokenCache.getAllAccounts();
        });
    }
    getAccountFromMsalCache(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = this.clientApplication.getTokenCache();
            if (!cache) {
                this.logger.error("Error: Could not fetch token cache.");
                return null;
            }
            let account;
            // if the accountId is a home ID, it will include a '.' character
            if (accountId.includes(".")) {
                account = yield cache.getAccountByHomeId(accountId);
            }
            else {
                account = yield cache.getAccountByLocalId(accountId);
            }
            if (!account) {
                throw new Error("Error: Could not find account from MSAL Cache.");
            }
            return account;
        });
    }
    getTenants(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenantUri = url.resolve(this.providerSettings.resources.azureManagementResource.endpoint, "tenants?api-version=2019-11-01");
            try {
                this.logger.verbose("Fetching tenants with uri {0}", tenantUri);
                let tenantList = [];
                const tenantResponse = yield this.makeGetRequest(tenantUri, token);
                const data = tenantResponse.data;
                if (this.isErrorResponseBodyWithError(data)) {
                    this.logger.error(`Error fetching tenants :${data.error.code} - ${data.error.message}`);
                    throw new Error(`${data.error.code} - ${data.error.message}`);
                }
                const tenants = data.value.map((tenantInfo) => {
                    if (tenantInfo.displayName) {
                        tenantList.push(tenantInfo.displayName);
                    }
                    else {
                        tenantList.push(tenantInfo.tenantId);
                        this.logger.info("Tenant display name found empty: {0}", tenantInfo.tenantId);
                    }
                    return {
                        id: tenantInfo.tenantId,
                        displayName: tenantInfo.displayName
                            ? tenantInfo.displayName
                            : tenantInfo.tenantId,
                        userId: token,
                        tenantCategory: tenantInfo.tenantCategory,
                    };
                });
                this.logger.verbose(`Tenants: ${tenantList}`);
                const homeTenantIndex = tenants.findIndex((tenant) => tenant.tenantCategory === Constants.homeCategory);
                // remove home tenant from list of tenants
                if (homeTenantIndex >= 0) {
                    const homeTenant = tenants.splice(homeTenantIndex, 1);
                    tenants.unshift(homeTenant[0]);
                }
                this.logger.verbose(`Filtered Tenants: ${tenantList}`);
                return tenants;
            }
            catch (ex) {
                this.logger.error(`Error fetching tenants :${ex}`);
                throw ex;
            }
        });
    }
    isErrorResponseBodyWithError(body) {
        return "error" in body && body.error;
    }
    makeGetRequest(requestUrl, token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: () => true, // Never throw
            };
            const httpConfig = vscode.workspace.getConfiguration("http");
            let proxy = httpConfig["proxy"];
            if (!proxy) {
                this.logger.verbose("Workspace HTTP config didn't contain a proxy endpoint. Checking environment variables.");
                proxy = this.loadEnvironmentProxyValue();
            }
            if (proxy) {
                this.logger.verbose("Proxy endpoint found in environment variables or workspace configuration.");
                // Turning off automatic proxy detection to avoid issues with tunneling agent by setting proxy to false.
                // https://github.com/axios/axios/blob/bad6d8b97b52c0c15311c92dd596fc0bff122651/lib/adapters/http.js#L85
                config.proxy = false;
                const agent = this.createProxyAgent(requestUrl, proxy, httpConfig["proxyStrictSSL"]);
                if (agent.isHttps) {
                    config.httpsAgent = agent.agent;
                }
                else {
                    config.httpAgent = agent.agent;
                }
                const HTTPS_PORT = 443;
                const HTTP_PORT = 80;
                const parsedRequestUrl = url.parse(requestUrl);
                const port = ((_a = parsedRequestUrl.protocol) === null || _a === void 0 ? void 0 : _a.startsWith("https")) ? HTTPS_PORT : HTTP_PORT;
                // Request URL will include HTTPS port 443 ('https://management.azure.com:443/tenants?api-version=2019-11-01'), so
                // that Axios doesn't try to reach this URL with HTTP port 80 on HTTP proxies, which result in an error. See https://github.com/axios/axios/issues/925
                const requestUrlWithPort = `${parsedRequestUrl.protocol}//${parsedRequestUrl.hostname}:${port}${parsedRequestUrl.path}`;
                const response = yield axios_1.default.get(requestUrlWithPort, config);
                this.logger.piiSanitized("GET request ", [
                    {
                        name: "response",
                        objOrArray: (_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : response.data,
                    },
                ], [], requestUrl);
                return response;
            }
            const response = yield axios_1.default.get(requestUrl, config);
            this.logger.piiSanitized("GET request ", [
                {
                    name: "response",
                    objOrArray: (_e = (_d = response.data) === null || _d === void 0 ? void 0 : _d.value) !== null && _e !== void 0 ? _e : response.data,
                },
            ], [], requestUrl);
            return response;
        });
    }
    loadEnvironmentProxyValue() {
        const HTTP_PROXY = "HTTP_PROXY";
        const HTTPS_PROXY = "HTTPS_PROXY";
        if (!process) {
            this.logger.verbose("No process object found, unable to read environment variables for proxy.");
            return undefined;
        }
        if (process.env[HTTP_PROXY] || process.env[HTTP_PROXY.toLowerCase()]) {
            this.logger.verbose("Loading proxy value from HTTP_PROXY environment variable.");
            return process.env[HTTP_PROXY] || process.env[HTTP_PROXY.toLowerCase()];
        }
        else if (process.env[HTTPS_PROXY] || process.env[HTTPS_PROXY.toLowerCase()]) {
            this.logger.verbose("Loading proxy value from HTTPS_PROXY environment variable.");
            return process.env[HTTPS_PROXY] || process.env[HTTPS_PROXY.toLowerCase()];
        }
        this.logger.verbose("No proxy value found in either HTTPS_PROXY or HTTP_PROXY environment variables.");
        return undefined;
    }
    createProxyAgent(requestUrl, proxy, proxyStrictSSL) {
        const agentOptions = this.getProxyAgentOptions(url.parse(requestUrl), proxy, proxyStrictSSL);
        if (!agentOptions || !agentOptions.host || !agentOptions.port) {
            this.logger.error("Unable to read proxy agent options to create proxy agent.");
            throw new Error(LocalizedConstants.unableToGetProxyAgentOptionsToGetTenants);
        }
        let tunnelOptions = {};
        if (typeof agentOptions.auth === "string" && agentOptions.auth) {
            tunnelOptions = {
                proxy: {
                    proxyAuth: agentOptions.auth,
                    host: agentOptions.host,
                    port: Number(agentOptions.port),
                },
            };
        }
        else {
            tunnelOptions = {
                proxy: {
                    host: agentOptions.host,
                    port: Number(agentOptions.port),
                },
            };
        }
        const isHttpsRequest = requestUrl.startsWith("https");
        const isHttpsProxy = proxy.startsWith("https");
        const proxyAgent = {
            isHttps: isHttpsProxy,
            agent: this.createTunnelingAgent(isHttpsRequest, isHttpsProxy, tunnelOptions),
        };
        return proxyAgent;
    }
    /*
     * Returns the proxy agent using the proxy url in the parameters or the system proxy. Returns null if no proxy found
     */
    getProxyAgentOptions(requestURL, proxy, strictSSL) {
        const proxyURL = proxy || this.getSystemProxyURL(requestURL);
        if (!proxyURL) {
            return undefined;
        }
        const proxyEndpoint = url.parse(proxyURL);
        if (!/^https?:$/.test(proxyEndpoint.protocol)) {
            return undefined;
        }
        const opts = {
            host: proxyEndpoint.hostname,
            port: Number(proxyEndpoint.port),
            auth: proxyEndpoint.auth,
            rejectUnauthorized: this.isBoolean(strictSSL) ? strictSSL : true,
        };
        return opts;
    }
    getSystemProxyURL(requestURL) {
        if (requestURL.protocol === "http:") {
            return process.env.HTTP_PROXY || process.env.http_proxy || undefined;
        }
        else if (requestURL.protocol === "https:") {
            return (process.env.HTTPS_PROXY ||
                process.env.https_proxy ||
                process.env.HTTP_PROXY ||
                process.env.http_proxy ||
                undefined);
        }
        return undefined;
    }
    isBoolean(obj) {
        return obj === true || obj === false;
    }
    createTunnelingAgent(isHttpsRequest, isHttpsProxy, tunnelOptions) {
        if (isHttpsRequest && isHttpsProxy) {
            this.logger.verbose("Creating https request over https proxy tunneling agent");
            return tunnel.httpsOverHttps(tunnelOptions);
        }
        else if (isHttpsRequest && !isHttpsProxy) {
            this.logger.verbose("Creating https request over http proxy tunneling agent");
            return tunnel.httpsOverHttp(tunnelOptions);
        }
        else if (!isHttpsRequest && isHttpsProxy) {
            this.logger.verbose("Creating http request over https proxy tunneling agent");
            return tunnel.httpOverHttps(tunnelOptions);
        }
        else {
            this.logger.verbose("Creating http request over http proxy tunneling agent");
            return tunnel.httpOverHttp(tunnelOptions);
        }
    }
    //#region interaction handling
    handleInteractionRequired(tenant_1, settings_1) {
        return __awaiter(this, arguments, void 0, function* (tenant, settings, promptUser = true) {
            var _a, _b;
            let shouldOpen;
            if (promptUser) {
                shouldOpen = yield this.askUserForInteraction(tenant, settings);
                if (shouldOpen) {
                    const result = yield this.login(tenant);
                    (_a = result === null || result === void 0 ? void 0 : result.authComplete) === null || _a === void 0 ? void 0 : _a.resolve();
                    return result === null || result === void 0 ? void 0 : result.response;
                }
            }
            else {
                const result = yield this.login(tenant);
                (_b = result === null || result === void 0 ? void 0 : result.authComplete) === null || _b === void 0 ? void 0 : _b.resolve();
                return result === null || result === void 0 ? void 0 : result.response;
            }
            return null;
        });
    }
    /**
     * Asks the user if they would like to do the interaction based authentication as required by OAuth2
     * @param tenant
     * @param resource
     */
    askUserForInteraction(tenant, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tenant.displayName && !tenant.id) {
                throw new Error("Tenant did not have display name or id");
            }
            const openItem = {
                title: LocalizedConstants.azureConsentDialogOpen,
                booleanResult: true,
            };
            const closeItem = {
                title: LocalizedConstants.Common.cancel,
                isCloseAffordance: true,
                booleanResult: false,
            };
            const messageBody = LocalizedConstants.azureConsentDialogBodyAccount(settings.id);
            const result = yield vscode.window.showInformationMessage(messageBody, { modal: true }, openItem, closeItem);
            if (result === null || result === void 0 ? void 0 : result.action) {
                yield result.action(tenant.id);
            }
            return (result === null || result === void 0 ? void 0 : result.booleanResult) || false;
        });
    }
    //#endregion
    //#region data modeling
    createAccount(tokenClaims, key, tenants) {
        var _a, _b, _c, _d, _e, _f;
        this.logger.verbose(`Token Claims acccount: ${tokenClaims.name}, TID: ${tokenClaims.tid}`);
        tenants.forEach((tenant) => {
            this.logger.verbose(`Tenant ID: ${tenant.id}, Tenant Name: ${tenant.displayName}`);
        });
        // Determine if this is a microsoft account
        let accountIssuer = "unknown";
        if (tokenClaims.iss === "https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/" ||
            tokenClaims.iss === `${this.loginEndpointUrl}72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0`) {
            accountIssuer = Constants.AccountIssuer.Corp;
        }
        if ((tokenClaims === null || tokenClaims === void 0 ? void 0 : tokenClaims.idp) === "live.com") {
            accountIssuer = Constants.AccountIssuer.Msft;
        }
        const name = (_c = (_b = (_a = tokenClaims.name) !== null && _a !== void 0 ? _a : tokenClaims.preferred_username) !== null && _b !== void 0 ? _b : tokenClaims.email) !== null && _c !== void 0 ? _c : tokenClaims.unique_name;
        const email = (_e = (_d = tokenClaims.preferred_username) !== null && _d !== void 0 ? _d : tokenClaims.email) !== null && _e !== void 0 ? _e : tokenClaims.unique_name;
        let owningTenant = Constants.commonTenant; // default to common tenant
        // Read more about tid > https://learn.microsoft.com/azure/active-directory/develop/id-tokens
        if (tokenClaims.tid) {
            owningTenant = (_f = tenants.find((t) => t.id === tokenClaims.tid)) !== null && _f !== void 0 ? _f : {
                id: tokenClaims.tid,
                displayName: "Microsoft Account",
            };
        }
        else {
            this.logger.info("Could not find tenant information from tokenClaims, falling back to common Tenant.");
        }
        let displayName = name;
        if (email) {
            displayName = `${displayName} - ${email}`;
        }
        let contextualDisplayName;
        switch (accountIssuer) {
            case Constants.AccountIssuer.Corp:
                contextualDisplayName = LocalizedConstants.azureMicrosoftCorpAccount;
                break;
            case Constants.AccountIssuer.Msft:
                contextualDisplayName = LocalizedConstants.azureMicrosoftAccount;
                break;
            default:
                contextualDisplayName = displayName;
        }
        let accountType = accountIssuer === Constants.AccountIssuer.Msft
            ? azure_1.AccountType.Microsoft
            : azure_1.AccountType.WorkSchool;
        const account = {
            key: {
                providerId: this.providerSettings.id,
                id: key,
                accountVersion: Constants.accountVersion,
            },
            name: displayName,
            displayInfo: {
                accountType: accountType,
                userId: key,
                contextualDisplayName: contextualDisplayName,
                displayName,
                email,
                name,
            },
            properties: {
                providerSettings: this.providerSettings,
                isMsAccount: accountIssuer === Constants.AccountIssuer.Msft,
                owningTenant: owningTenant,
                tenants,
                azureAuthType: this.authType,
            },
            isStale: false,
        };
        return account;
    }
    //#endregion
    //#region inconsequential
    getTokenClaims(accessToken) {
        try {
            const split = accessToken.split(".");
            return JSON.parse(Buffer.from(split[1], "base64").toString("utf8"));
        }
        catch (ex) {
            throw new Error("Unable to read token claims: " + JSON.stringify(ex));
        }
    }
    toBase64UrlEncoding(base64string) {
        return base64string.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); // Need to use base64url encoding
    }
    clearCredentials(account) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenCache = this.clientApplication.getTokenCache();
                let accountInfo = yield this.getAccountFromMsalCache(account.key.id);
                yield tokenCache.removeAccount(accountInfo);
            }
            catch (ex) {
                // We need not prompt user for error if token could not be removed from cache.
                this.logger.error("Error when removing token from cache: ", ex);
            }
        });
    }
    // tslint:disable:no-empty
    autoOAuthCancelled() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.MsalAzureAuth = MsalAzureAuth;
//#endregion

//# sourceMappingURL=msalAzureAuth.js.map
