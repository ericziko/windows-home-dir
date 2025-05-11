"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationType = exports.ConnectionInputMode = exports.ConnectionDialogWebviewState = void 0;
const webview_1 = require("./webview");
class ConnectionDialogWebviewState {
    /** The underlying connection profile for the form target; a more intuitively-named alias for `formState` */
    get connectionProfile() {
        return this.formState;
    }
    set connectionProfile(value) {
        this.formState = value;
    }
    constructor(params) {
        /** the underlying connection profile for the form target; same as `connectionProfile` */
        this.formState = {};
        this.formComponents = {};
        this.selectedInputMode = ConnectionInputMode.Parameters;
        this.connectionComponents = {
            mainOptions: [],
            topAdvancedOptions: [],
            groupedAdvancedOptions: [],
        };
        this.azureSubscriptions = [];
        this.azureServers = [];
        this.savedConnections = [];
        this.recentConnections = [];
        this.connectionStatus = webview_1.ApiStatus.NotStarted;
        this.readyToConnect = false;
        this.formError = "";
        this.loadingAzureSubscriptionsStatus = webview_1.ApiStatus.NotStarted;
        this.loadingAzureServersStatus = webview_1.ApiStatus.NotStarted;
        for (const key in params) {
            if (key in this) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- safe due to key in this check being a Partial of the class
                this[key] =
                    params[key];
            }
        }
    }
}
exports.ConnectionDialogWebviewState = ConnectionDialogWebviewState;
var ConnectionInputMode;
(function (ConnectionInputMode) {
    ConnectionInputMode["Parameters"] = "parameters";
    ConnectionInputMode["AzureBrowse"] = "azureBrowse";
})(ConnectionInputMode || (exports.ConnectionInputMode = ConnectionInputMode = {}));
var AuthenticationType;
(function (AuthenticationType) {
    AuthenticationType["SqlLogin"] = "SqlLogin";
    AuthenticationType["Integrated"] = "Integrated";
    AuthenticationType["AzureMFA"] = "AzureMFA";
})(AuthenticationType || (exports.AuthenticationType = AuthenticationType = {}));

//# sourceMappingURL=connectionDialog.js.map
