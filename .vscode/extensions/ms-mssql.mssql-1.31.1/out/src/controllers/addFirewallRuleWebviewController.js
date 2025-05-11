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
exports.AddFirewallRuleWebviewController = void 0;
const vscode = require("vscode");
const reactWebviewPanelController_1 = require("./reactWebviewPanelController");
const azureHelpers_1 = require("../connectionconfig/azureHelpers");
const telemetry_1 = require("../telemetry/telemetry");
const telemetry_2 = require("../sharedInterfaces/telemetry");
const utils_1 = require("../utils/utils");
const constants_1 = require("../constants/constants");
const protocol_1 = require("../protocol");
const vscode_azext_azureauth_1 = require("@microsoft/vscode-azext-azureauth");
const webview_1 = require("../sharedInterfaces/webview");
const Loc = require("../constants/locConstants");
/**
 * Controller for the Add Firewall Rule dialog
 */
class AddFirewallRuleWebviewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, initializationProps, firewallService) {
        super(context, vscodeWrapper, "AddFirewallRule", "addFirewallRule", {
            serverName: initializationProps.serverName,
            message: initializationProps.errorMessage,
            clientIp: "",
            isSignedIn: false,
            tenants: [],
            addFirewallRuleState: webview_1.ApiStatus.NotStarted,
        }, {
            title: initializationProps.serverName
                ? Loc.FirewallRule.addFirewallRuleToServer(initializationProps.serverName)
                : Loc.FirewallRule.addFirewallRule,
            viewColumn: vscode.ViewColumn.One,
            iconPath: {
                light: vscode.Uri.joinPath(context.extensionUri, "media", "database_light.svg"),
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "database_dark.svg"),
            },
        });
        this.firewallService = firewallService;
        this.initialized = new protocol_1.Deferred();
        this.registerRpcHandlers();
        this.updateState();
        void this.initializeDialog(initializationProps.errorMessage).then(() => {
            this.updateState();
            this.initialized.resolve();
        });
    }
    /**
     * Initialize the controller
     */
    initializeDialog(errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user is signed into Azure, and populate the dialog if they are
            const auth = new vscode_azext_azureauth_1.VSCodeAzureSubscriptionProvider();
            this.state.isSignedIn = yield auth.isSignedIn();
            if (this.state.isSignedIn) {
                yield this.populateTentants(this.state);
            }
            // Extract the client IP address from the error message
            const handleFirewallErrorResult = yield this.firewallService.handleFirewallRule(constants_1.errorFirewallRule, errorMessage);
            if (!handleFirewallErrorResult.result) {
                (0, telemetry_1.sendErrorEvent)(telemetry_2.TelemetryViews.ConnectionDialog, telemetry_2.TelemetryActions.AddFirewallRule, new Error(errorMessage), true, // includeErrorMessage; parse failed because it couldn't detect an IP address, so that'd be the only PII
                undefined, // errorCode
                undefined);
                // Proceed with 0.0.0.0 as the client IP, and let user fill it out manually.
                handleFirewallErrorResult.ipAddress = "0.0.0.0";
            }
            this.state.clientIp = handleFirewallErrorResult.ipAddress;
        });
    }
    /**
     * Register reducers for handling actions from the webview
     */
    registerRpcHandlers() {
        this.registerReducer("closeDialog", (state) => __awaiter(this, void 0, void 0, function* () {
            this.dialogResult.resolve(false);
            this.panel.dispose();
            return state;
        }));
        this.registerReducer("addFirewallRule", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            state.addFirewallRuleState = webview_1.ApiStatus.Loading;
            this.updateState(state);
            try {
                yield this.firewallService.createFirewallRuleWithVscodeAccount(payload.firewallRuleSpec, this.state.serverName);
                (0, telemetry_1.sendActionEvent)(telemetry_2.TelemetryViews.ConnectionDialog, telemetry_2.TelemetryActions.AddFirewallRule);
                this.dialogResult.resolve(true);
                yield this.panel.dispose();
            }
            catch (err) {
                state.message = (0, utils_1.getErrorMessage)(err);
                state.addFirewallRuleState = webview_1.ApiStatus.Error;
                (0, telemetry_1.sendErrorEvent)(telemetry_2.TelemetryViews.AddFirewallRule, telemetry_2.TelemetryActions.AddFirewallRule, err, false, // includeErrorMessage
                undefined, // errorCode
                undefined, // errorType
                {
                    failure: err.Name,
                });
            }
            return state;
        }));
        this.registerReducer("signIntoAzure", (state) => __awaiter(this, void 0, void 0, function* () {
            yield this.populateTentants(state);
            return state;
        }));
    }
    populateTentants(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield (0, azureHelpers_1.confirmVscodeAzureSignin)();
            if (!auth) {
                const errorMessage = Loc.Azure.azureSignInFailedOrWasCancelled;
                this.logger.error(errorMessage);
                this.vscodeWrapper.showErrorMessage(errorMessage);
                return;
            }
            const tenants = yield auth.getTenants();
            state.isSignedIn = true;
            state.tenants = tenants.map((t) => {
                return {
                    name: t.displayName,
                    id: t.tenantId,
                };
            });
        });
    }
}
exports.AddFirewallRuleWebviewController = AddFirewallRuleWebviewController;

//# sourceMappingURL=addFirewallRuleWebviewController.js.map
