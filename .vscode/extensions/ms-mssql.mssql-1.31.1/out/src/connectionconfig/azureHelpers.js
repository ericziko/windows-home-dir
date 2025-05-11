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
exports.azureSubscriptionFilterConfigKey = void 0;
exports.confirmVscodeAzureSignin = confirmVscodeAzureSignin;
exports.promptForAzureSubscriptionFilter = promptForAzureSubscriptionFilter;
exports.getQuickPickItems = getQuickPickItems;
exports.fetchResourcesForSubscription = fetchResourcesForSubscription;
exports.fetchServersFromAzure = fetchServersFromAzure;
exports.getAccounts = getAccounts;
exports.getTenants = getTenants;
exports.constructAzureAccountForTenant = constructAzureAccountForTenant;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const locConstants_1 = require("../constants/locConstants");
const vscode_azext_azureauth_1 = require("@microsoft/vscode-azext-azureauth");
const arm_resources_1 = require("@azure/arm-resources");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const telemetry_2 = require("../telemetry/telemetry");
const utils_1 = require("../utils/utils");
exports.azureSubscriptionFilterConfigKey = "azureResourceGroups.selectedSubscriptions";
//#region VS Code integration
function confirmVscodeAzureSignin() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new vscode_azext_azureauth_1.VSCodeAzureSubscriptionProvider();
        if (!(yield auth.isSignedIn())) {
            const result = yield auth.signIn();
            if (!result) {
                return undefined;
            }
        }
        return auth;
    });
}
function promptForAzureSubscriptionFilter(state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const auth = yield confirmVscodeAzureSignin();
            if (!auth) {
                state.formError = vscode_1.l10n.t("Azure sign in failed.");
                return;
            }
            const selectedSubs = yield vscode.window.showQuickPick(getQuickPickItems(auth), {
                canPickMany: true,
                ignoreFocusOut: true,
                placeHolder: vscode_1.l10n.t("Select subscriptions"),
            });
            if (!selectedSubs) {
                return;
            }
            yield vscode.workspace.getConfiguration().update(exports.azureSubscriptionFilterConfigKey, selectedSubs.map((s) => `${s.tenantId}/${s.subscriptionId}`), vscode.ConfigurationTarget.Global);
        }
        catch (error) {
            state.formError = vscode_1.l10n.t("Error loading Azure subscriptions.");
            console.error(state.formError + "\n" + (0, utils_1.getErrorMessage)(error));
            return;
        }
    });
}
function getQuickPickItems(auth) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const allSubs = yield auth.getSubscriptions(false /* don't use the current filter, 'cause we're gonna set it */);
        const prevSelectedSubs = (_a = vscode.workspace
            .getConfiguration()
            .get(exports.azureSubscriptionFilterConfigKey)) === null || _a === void 0 ? void 0 : _a.map((entry) => entry.split("/")[1]);
        const quickPickItems = allSubs
            .map((sub) => {
            return {
                label: `${sub.name} (${sub.subscriptionId})`,
                tenantId: sub.tenantId,
                subscriptionId: sub.subscriptionId,
                picked: prevSelectedSubs ? prevSelectedSubs.includes(sub.subscriptionId) : true,
            };
        })
            .sort((a, b) => a.label.localeCompare(b.label));
        return quickPickItems;
    });
}
const serverResourceType = "Microsoft.Sql/servers";
const databaseResourceType = "Microsoft.Sql/servers/databases";
function fetchResourcesForSubscription(sub) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new arm_resources_1.ResourceManagementClient(sub.credential, sub.subscriptionId);
        const resources = yield (0, utils_1.listAllIterator)(client.resources.list());
        return resources;
    });
}
function fetchServersFromAzure(sub) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        const resources = yield fetchResourcesForSubscription(sub);
        // for some subscriptions, supplying a `resourceType eq 'Microsoft.Sql/servers/databases'` filter to list() causes an error:
        // > invalid filter in query string 'resourceType eq "Microsoft.Sql/servers/databases'"
        // no idea why, so we're fetching all resources and filtering them ourselves
        const servers = resources.filter((r) => r.type === serverResourceType);
        const databases = resources.filter((r) => r.type === databaseResourceType);
        for (const server of servers) {
            result.push({
                server: server.name,
                databases: [],
                location: server.location,
                resourceGroup: extractFromResourceId(server.id, "resourceGroups"),
                subscription: `${sub.name} (${sub.subscriptionId})`,
            });
        }
        for (const database of databases) {
            const serverName = extractFromResourceId(database.id, "servers");
            const server = result.find((s) => s.server === serverName);
            if (server) {
                server.databases.push(database.name.substring(serverName.length + 1)); // database.name is in the form 'serverName/databaseName', so we need to remove the server name and slash
            }
        }
        return result;
    });
}
//#endregion
//#region Azure Entra auth helpers
function getAccounts(azureAccountService) {
    return __awaiter(this, void 0, void 0, function* () {
        let accounts = [];
        try {
            accounts = yield azureAccountService.getAccounts();
            return accounts.map((account) => {
                return {
                    displayName: account.displayInfo.displayName,
                    value: account.displayInfo.userId,
                };
            });
        }
        catch (error) {
            console.error(`Error loading Azure accounts: ${(0, utils_1.getErrorMessage)(error)}`);
            (0, telemetry_2.sendErrorEvent)(telemetry_1.TelemetryViews.ConnectionDialog, telemetry_1.TelemetryActions.LoadAzureAccountsForEntraAuth, error, false, // includeErrorMessage
            undefined, // errorCode
            undefined, // errorType
            undefined, // additionalProperties
            {
                accountCount: accounts.length,
                undefinedAccountCount: accounts.filter((x) => x === undefined).length,
                undefinedDisplayInfoCount: accounts.filter((x) => x !== undefined && x.displayInfo === undefined).length,
            });
            return [];
        }
    });
}
function getTenants(azureAccountService, accountId) {
    return __awaiter(this, void 0, void 0, function* () {
        let tenants = [];
        try {
            const account = (yield azureAccountService.getAccounts()).find((account) => { var _a; return ((_a = account.displayInfo) === null || _a === void 0 ? void 0 : _a.userId) === accountId; });
            if (!account) {
                return [];
            }
            tenants = account.properties.tenants;
            if (!tenants) {
                return [];
            }
            return tenants.map((tenant) => {
                return {
                    displayName: tenant.displayName,
                    value: tenant.id,
                };
            });
        }
        catch (error) {
            console.error(`Error loading Azure tenants: ${(0, utils_1.getErrorMessage)(error)}`);
            (0, telemetry_2.sendErrorEvent)(telemetry_1.TelemetryViews.ConnectionDialog, telemetry_1.TelemetryActions.LoadAzureTenantsForEntraAuth, error, false, // includeErrorMessage
            undefined, // errorCode
            undefined, // errorType
            undefined, // additionalProperties
            {
                tenant: tenants.length,
                undefinedTenantCount: tenants.filter((x) => x === undefined).length,
            });
            return [];
        }
    });
}
function constructAzureAccountForTenant(tenantId) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield confirmVscodeAzureSignin();
        const subs = yield auth.getSubscriptions(false /* filter */);
        const sub = subs.filter((s) => s.tenantId === tenantId)[0];
        if (!sub) {
            throw new Error(locConstants_1.Azure.errorLoadingAzureAccountInfoForTenantId(tenantId));
        }
        const token = yield sub.credential.getToken(".default");
        const session = yield sub.authentication.getSession();
        const account = {
            displayInfo: {
                displayName: session.account.label,
                userId: session.account.label,
                name: session.account.label,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                accountType: session.account.type,
            },
            key: {
                providerId: "microsoft",
                id: session.account.label,
            },
            isStale: false,
            properties: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                azureAuthType: 0,
                providerSettings: undefined,
                isMsAccount: false,
                owningTenant: undefined,
                tenants: [
                    {
                        displayName: sub.tenantId,
                        id: sub.tenantId,
                        userId: token.token,
                    },
                ],
            },
        };
        const tokenMappings = {};
        tokenMappings[sub.tenantId] = {
            Token: token.token,
        };
        return { account, tokenMappings };
    });
}
//#endregion
//#region Miscellaneous Auzre helpers
function extractFromResourceId(resourceId, property) {
    if (!property.endsWith("/")) {
        property += "/";
    }
    let startIndex = resourceId.indexOf(property);
    if (startIndex === -1) {
        return undefined;
    }
    else {
        startIndex += property.length;
    }
    return resourceId.substring(startIndex, resourceId.indexOf("/", startIndex));
}
//#endregion

//# sourceMappingURL=azureHelpers.js.map
