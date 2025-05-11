"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableTrustServerCertificate = exports.encryptMandatoryRecommended = exports.encryptMandatory = exports.encryptOptional = exports.encryptName = exports.encryptPrompt = exports.azureAuthStateError = exports.azureAuthNonceError = exports.azureServerCouldNotStart = exports.unableToGetProxyAgentOptionsToGetTenants = exports.azureMicrosoftAccount = exports.azureMicrosoftCorpAccount = exports.azureConsentDialogIgnore = exports.azureConsentDialogOpen = exports.azureLogChannelName = exports.azureAuthTypeDeviceCode = exports.azureAuthTypeCodeGrant = exports.authTypeAzureActiveDirectory = exports.authTypeSql = exports.authTypeIntegrated = exports.authTypeName = exports.authTypePrompt = exports.databasePlaceholder = exports.firewallRuleNamePrompt = exports.endIpAddressPrompt = exports.startIpAddressPrompt = exports.databasePrompt = exports.serverPlaceholder = exports.serverPrompt = exports.SampleServerName = exports.ManageProfilesPrompt = exports.RemoveProfileLabel = exports.EditProfilesLabel = exports.ClearRecentlyUsedLabel = exports.CreateProfileLabel = exports.CreateProfileFromConnectionsListLabel = exports.recentConnectionsPlaceholder = exports.msgOpenSqlFile = exports.msgPromptClearRecentConnections = exports.msgPromptCancelConnect = exports.connectionErrorChannelName = exports.serverNameMissing = exports.msgChooseDatabasePlaceholder = exports.msgChooseDatabaseNotConnected = exports.msgCancelQueryNotRunning = exports.runQueryBatchStartMessage = exports.msgRunQueryInProgress = exports.releaseNotesPromptDescription = exports.viewMore = exports.Common = void 0;
exports.refreshTokenLabel = exports.msgPromptRetryCreateProfile = exports.msgChangeLanguageMode = exports.untitledScheme = exports.extensionNotInitializedError = exports.updatingIntelliSenseLabel = exports.cancelingQueryLabel = exports.connectErrorMessage = exports.connectErrorCode = exports.connectErrorTooltip = exports.connectErrorLabel = exports.connectingTooltip = exports.connectingLabel = exports.notConnectedTooltip = exports.notConnectedLabel = exports.defaultDatabaseLabel = exports.msgNo = exports.msgYes = exports.msgError = exports.msgIsRequired = exports.msgClearedRecentConnections = exports.msgProfileCreatedAndConnected = exports.msgProfileCreated = exports.msgProfileRemoved = exports.msgNoProfilesSaved = exports.confirmRemoveProfilePrompt = exports.msgSelectProfileToRemove = exports.msgSaveSucceeded = exports.msgSaveFailed = exports.msgSaveStarted = exports.msgCannotOpenContent = exports.profileNamePlaceholder = exports.profileNamePrompt = exports.msgSavePassword = exports.passwordPlaceholder = exports.passwordPrompt = exports.usernamePlaceholder = exports.usernamePrompt = exports.tenant = exports.azureChooseTenant = exports.aad = exports.cannotConnect = exports.clearedAzureTokenCache = exports.noAzureAccountForRemoval = exports.accountRemovedSuccessfully = exports.accountCouldNotBeAdded = exports.azureAddAccount = exports.azureChooseAccount = exports.msgCopyAndOpenWebpage = exports.readMore = void 0;
exports.messagePaneLabel = exports.QueryExecutedLabel = exports.executeQueryLabel = exports.copyWithHeadersLabel = exports.copyLabel = exports.selectAll = exports.resultPaneLabel = exports.fileTypeExcelLabel = exports.fileTypeJSONLabel = exports.fileTypeCSVLabel = exports.saveExcelLabel = exports.saveJSONLabel = exports.saveCSVLabel = exports.restoreLabel = exports.maximizeLabel = exports.noActiveEditorMsg = exports.disconnectConfirmationMsg = exports.disconnectOptionDescription = exports.disconnectOptionLabel = exports.testLocalizationConstant = exports.intelliSenseUpdatedStatus = exports.updatingIntelliSenseStatus = exports.definitionRequestCompletedStatus = exports.definitionRequestedStatus = exports.gettingDefinitionMessage = exports.macSierraRequiredErrorMessage = exports.macOpenSslHelpButton = exports.macOpenSslErrorMessage = exports.msgAzureCredStoreSaveFailedError = exports.msgRefreshTokenError = exports.createFirewallRuleLabel = exports.retryLabel = exports.msgNoQueriesAvailable = exports.msgInvalidRuleName = exports.msgInvalidIpAddress = exports.msgRunQueryHistory = exports.msgOpenQueryHistory = exports.msgChooseQueryHistoryAction = exports.msgChooseQueryHistory = exports.msgAccountNotFound = exports.msgAuthTypeNotFound = exports.msgPromptFirewallRuleCreated = exports.msgUnableToExpand = exports.msgPromptProfileUpdateFailed = exports.msgAccountRefreshFailed = exports.msgPromptRetryFirewallRuleAdded = exports.msgPromptRetryFirewallRuleNotSignedIn = exports.msgPromptSSLCertificateValidationFailed = exports.msgPromptRetryConnectionDifferentCredentials = exports.msgGetTokenFail = void 0;
exports.enableRichExperiences = exports.keepInQueryPane = exports.alwaysShowInNewTab = exports.openQueryResultsInTabByDefaultPrompt = exports.copied = exports.scriptCopiedToClipboard = exports.executionPlanFileFilter = exports.executionPlan = exports.loading = exports.parameters = exports.queryFailed = exports.querySuccess = exports.dismiss = exports.switchToMsal = exports.reloadChoice = exports.reloadPromptGeneric = exports.reloadPrompt = exports.showOutputChannelActionButtonText = exports.objectExplorerNodeRefreshError = exports.columnWidthMustBePositiveError = exports.columnWidthInvalidNumberError = exports.newColumnWidthPrompt = exports.msgMultipleSelectionModeNotSupported = exports.connectProgressNoticationTitle = exports.msgClearedRecentConnectionsWithErrors = exports.nodeErrorMessage = exports.notStarted = exports.canceling = exports.inProgress = exports.canceled = exports.succeededWithWarning = exports.succeeded = exports.failed = exports.azureSignInToAzureCloudDescription = exports.azureSignInToAzureCloud = exports.azureSignInWithDeviceCodeDescription = exports.azureSignInWithDeviceCode = exports.azureSignInDescription = exports.azureSignIn = exports.msgConnect = exports.msgAddConnection = exports.autoDisableNonTSqlLanguageServicePrompt = exports.flavorDescriptionNone = exports.flavorDescriptionMssql = exports.flavorChooseLanguage = exports.noneProviderName = exports.mssqlProviderName = exports.msgCannotSaveMultipleSelections = exports.messagesTableMessageColumn = exports.messagesTableTimeStampColumn = void 0;
exports.SchemaDesigner = exports.SchemaCompare = exports.TableDesigner = exports.Webview = exports.UserSurvey = exports.QueryResult = exports.Azure = exports.FirewallRule = exports.ConnectionDialog = exports.ObjectExplorer = void 0;
exports.msgStartedExecute = msgStartedExecute;
exports.msgFinishedExecute = msgFinishedExecute;
exports.runQueryBatchStartLine = runQueryBatchStartLine;
exports.msgCancelQueryFailed = msgCancelQueryFailed;
exports.msgConnectionError = msgConnectionError;
exports.msgConnectionError2 = msgConnectionError2;
exports.msgConnectionErrorPasswordExpired = msgConnectionErrorPasswordExpired;
exports.azureConsentDialogBody = azureConsentDialogBody;
exports.azureConsentDialogBodyAccount = azureConsentDialogBodyAccount;
exports.azureNoMicrosoftResource = azureNoMicrosoftResource;
exports.accountAddedSuccessfully = accountAddedSuccessfully;
exports.accountRemovalFailed = accountRemovalFailed;
exports.msgChangedDatabaseContext = msgChangedDatabaseContext;
exports.msgPromptRetryFirewallRuleSignedIn = msgPromptRetryFirewallRuleSignedIn;
exports.msgConnecting = msgConnecting;
exports.msgConnectionNotFound = msgConnectionNotFound;
exports.msgFoundPendingReconnect = msgFoundPendingReconnect;
exports.msgPendingReconnectSuccess = msgPendingReconnectSuccess;
exports.msgFoundPendingReconnectFailed = msgFoundPendingReconnectFailed;
exports.msgFoundPendingReconnectError = msgFoundPendingReconnectError;
exports.msgAcessTokenExpired = msgAcessTokenExpired;
exports.msgRefreshConnection = msgRefreshConnection;
exports.msgRefreshTokenSuccess = msgRefreshTokenSuccess;
exports.msgRefreshTokenNotNeeded = msgRefreshTokenNotNeeded;
exports.msgConnectedServerInfo = msgConnectedServerInfo;
exports.msgConnectionFailed = msgConnectionFailed;
exports.msgChangingDatabase = msgChangingDatabase;
exports.msgChangedDatabase = msgChangedDatabase;
exports.msgDisconnected = msgDisconnected;
exports.elapsedBatchTime = elapsedBatchTime;
exports.lineSelectorFormatted = lineSelectorFormatted;
exports.elapsedTimeLabel = elapsedTimeLabel;
exports.taskStatusWithName = taskStatusWithName;
exports.taskStatusWithMessage = taskStatusWithMessage;
exports.taskStatusWithNameAndMessage = taskStatusWithNameAndMessage;
exports.deleteCredentialError = deleteCredentialError;
exports.enableRichExperiencesPrompt = enableRichExperiencesPrompt;
const vscode_1 = require("vscode");
// Warning: Only update these strings if you are sure you want to affect _all_ locations they're shared between.
class Common {
}
exports.Common = Common;
Common.remindMeLater = vscode_1.l10n.t("Remind Me Later");
Common.dontShowAgain = vscode_1.l10n.t("Don't Show Again");
Common.learnMore = vscode_1.l10n.t("Learn More");
Common.delete = vscode_1.l10n.t("Delete");
Common.cancel = vscode_1.l10n.t("Cancel");
Common.areYouSure = vscode_1.l10n.t("Are you sure?");
Common.areYouSureYouWantTo = (action) => vscode_1.l10n.t({
    message: "Are you sure you want to {0}?",
    args: [action],
    comment: ["{0} is the action being confirmed"],
});
exports.viewMore = vscode_1.l10n.t("View More");
exports.releaseNotesPromptDescription = vscode_1.l10n.t("View mssql for Visual Studio Code release notes?");
function msgStartedExecute(documentName) {
    return vscode_1.l10n.t({
        message: 'Started query execution for document "{0}"',
        args: [documentName],
        comment: ["{0} is the document name"],
    });
}
function msgFinishedExecute(documentName) {
    return vscode_1.l10n.t({
        message: 'Finished query execution for document "{0}"',
        args: [documentName],
        comment: ["{0} is the document name"],
    });
}
exports.msgRunQueryInProgress = vscode_1.l10n.t("A query is already running for this editor session. Please cancel this query or wait for its completion.");
exports.runQueryBatchStartMessage = vscode_1.l10n.t("Started executing query at ");
function runQueryBatchStartLine(lineNumber) {
    return vscode_1.l10n.t({
        message: "Line {0}",
        args: [lineNumber],
        comment: ["{0} is the line number"],
    });
}
function msgCancelQueryFailed(error) {
    return vscode_1.l10n.t({
        message: "Canceling the query failed: {0}",
        args: [error],
        comment: ["{0} is the error message"],
    });
}
exports.msgCancelQueryNotRunning = vscode_1.l10n.t("Cannot cancel query as no query is running.");
exports.msgChooseDatabaseNotConnected = vscode_1.l10n.t("No connection was found. Please connect to a server first.");
exports.msgChooseDatabasePlaceholder = vscode_1.l10n.t("Choose a database from the list below");
function msgConnectionError(errorNumber, errorMessage) {
    return vscode_1.l10n.t({
        message: "Error {0}: {1}",
        args: [errorNumber, errorMessage],
        comment: ["{0} is the error number", "{1} is the error message"],
    });
}
function msgConnectionError2(errorMessage) {
    return vscode_1.l10n.t({
        message: "Failed to connect: {0}",
        args: [errorMessage],
        comment: ["{0} is the error message"],
    });
}
exports.serverNameMissing = vscode_1.l10n.t("Server name not set.");
function msgConnectionErrorPasswordExpired(errorNumber, errorMessage) {
    return vscode_1.l10n.t({
        message: "Error {0}: {1} Please login as a different user and change the password using ALTER LOGIN.",
        args: [errorNumber, errorMessage],
        comment: ["{0} is the error number", "{1} is the error message"],
    });
}
exports.connectionErrorChannelName = vscode_1.l10n.t("Connection Errors");
exports.msgPromptCancelConnect = vscode_1.l10n.t("Server connection in progress. Do you want to cancel?");
exports.msgPromptClearRecentConnections = vscode_1.l10n.t("Confirm to clear recent connections list");
exports.msgOpenSqlFile = vscode_1.l10n.t('To use this command, Open a .sql file -or- Change editor language to "SQL" -or- Select T-SQL text in the active SQL editor.');
exports.recentConnectionsPlaceholder = vscode_1.l10n.t("Choose a connection profile from the list below");
exports.CreateProfileFromConnectionsListLabel = vscode_1.l10n.t("Create Connection Profile");
exports.CreateProfileLabel = vscode_1.l10n.t("Create");
exports.ClearRecentlyUsedLabel = vscode_1.l10n.t("Clear Recent Connections List");
exports.EditProfilesLabel = vscode_1.l10n.t("Edit");
exports.RemoveProfileLabel = vscode_1.l10n.t("Remove");
exports.ManageProfilesPrompt = vscode_1.l10n.t("Manage Connection Profiles");
exports.SampleServerName = vscode_1.l10n.t("{{put-server-name-here}}");
exports.serverPrompt = vscode_1.l10n.t("Server name or ADO.NET connection string");
exports.serverPlaceholder = vscode_1.l10n.t("hostname\\instance or <server>.database.windows.net or ADO.NET connection string");
exports.databasePrompt = vscode_1.l10n.t("Database name");
exports.startIpAddressPrompt = vscode_1.l10n.t("Start IP Address");
exports.endIpAddressPrompt = vscode_1.l10n.t("End IP Address");
exports.firewallRuleNamePrompt = vscode_1.l10n.t("Firewall rule name");
exports.databasePlaceholder = vscode_1.l10n.t("[Optional] Database to connect (press Enter to connect to <default> database)");
exports.authTypePrompt = vscode_1.l10n.t("Authentication Type");
exports.authTypeName = vscode_1.l10n.t("authenticationType");
exports.authTypeIntegrated = vscode_1.l10n.t("Integrated");
exports.authTypeSql = vscode_1.l10n.t("SQL Login");
exports.authTypeAzureActiveDirectory = vscode_1.l10n.t("Microsoft Entra Id - Universal w/ MFA Support");
exports.azureAuthTypeCodeGrant = vscode_1.l10n.t("Azure Code Grant");
exports.azureAuthTypeDeviceCode = vscode_1.l10n.t("Azure Device Code");
exports.azureLogChannelName = vscode_1.l10n.t("Azure Logs");
exports.azureConsentDialogOpen = vscode_1.l10n.t("Open");
exports.azureConsentDialogIgnore = vscode_1.l10n.t("Ignore Tenant");
function azureConsentDialogBody(tenantName, tenantId, resource) {
    return vscode_1.l10n.t({
        message: "Your tenant '{0} ({1})' requires you to re-authenticate again to access {2} resources. Press Open to start the authentication process.",
        args: [tenantName, tenantId, resource],
        comment: ["{0} is the tenant name", "{1} is the tenant id", "{2} is the resource"],
    });
}
function azureConsentDialogBodyAccount(resource) {
    return vscode_1.l10n.t({
        message: "Your account needs re-authentication to access {0} resources. Press Open to start the authentication process.",
        args: [resource],
        comment: ["{0} is the resource"],
    });
}
exports.azureMicrosoftCorpAccount = vscode_1.l10n.t("Microsoft Corp");
exports.azureMicrosoftAccount = vscode_1.l10n.t("Microsoft Entra Account");
function azureNoMicrosoftResource(provider) {
    return vscode_1.l10n.t({
        message: "Provider '{0}' does not have a Microsoft resource endpoint defined.",
        args: [provider],
        comment: ["{0} is the provider"],
    });
}
exports.unableToGetProxyAgentOptionsToGetTenants = vscode_1.l10n.t("Unable to read proxy agent options to get tenants.");
exports.azureServerCouldNotStart = vscode_1.l10n.t("Server could not start. This could be a permissions error or an incompatibility on your system. You can try enabling device code authentication from settings.");
exports.azureAuthNonceError = vscode_1.l10n.t("Authentication failed due to a nonce mismatch, please close Azure Data Studio and try again.");
exports.azureAuthStateError = vscode_1.l10n.t("Authentication failed due to a state mismatch, please close ADS and try again.");
exports.encryptPrompt = vscode_1.l10n.t("Encrypt");
exports.encryptName = vscode_1.l10n.t("encrypt");
exports.encryptOptional = vscode_1.l10n.t("Optional (False)");
exports.encryptMandatory = vscode_1.l10n.t("Mandatory (True)");
exports.encryptMandatoryRecommended = vscode_1.l10n.t("Mandatory (Recommended)");
exports.enableTrustServerCertificate = vscode_1.l10n.t("Enable Trust Server Certificate");
exports.readMore = vscode_1.l10n.t("Read more");
exports.msgCopyAndOpenWebpage = vscode_1.l10n.t("Copy code and open webpage");
exports.azureChooseAccount = vscode_1.l10n.t("Choose a Microsoft Entra account");
exports.azureAddAccount = vscode_1.l10n.t("Add a Microsoft Entra account...");
function accountAddedSuccessfully(account) {
    return vscode_1.l10n.t({
        message: "Microsoft Entra account {0} successfully added.",
        args: [account],
        comment: ["{0} is the account name"],
    });
}
exports.accountCouldNotBeAdded = vscode_1.l10n.t("New Microsoft Entra account could not be added.");
exports.accountRemovedSuccessfully = vscode_1.l10n.t("Selected Microsoft Entra account removed successfully.");
function accountRemovalFailed(error) {
    return vscode_1.l10n.t({
        message: "An error occurred while removing Microsoft Entra account: {0}",
        args: [error],
        comment: ["{0} is the error message"],
    });
}
exports.noAzureAccountForRemoval = vscode_1.l10n.t("No Microsoft Entra account can be found for removal.");
exports.clearedAzureTokenCache = vscode_1.l10n.t("Azure token cache cleared successfully.");
exports.cannotConnect = vscode_1.l10n.t("Cannot connect due to expired tokens. Please re-authenticate and try again.");
exports.aad = vscode_1.l10n.t("Microsoft Entra Id");
exports.azureChooseTenant = vscode_1.l10n.t("Choose a Microsoft Entra tenant");
exports.tenant = vscode_1.l10n.t("Tenant");
exports.usernamePrompt = vscode_1.l10n.t("User name");
exports.usernamePlaceholder = vscode_1.l10n.t("User name (SQL Login)");
exports.passwordPrompt = vscode_1.l10n.t("Password");
exports.passwordPlaceholder = vscode_1.l10n.t("Password (SQL Login)");
exports.msgSavePassword = vscode_1.l10n.t("Save Password? If 'No', password will be required each time you connect");
exports.profileNamePrompt = vscode_1.l10n.t("Profile Name");
exports.profileNamePlaceholder = vscode_1.l10n.t("[Optional] Enter a display name for this connection profile");
exports.msgCannotOpenContent = vscode_1.l10n.t("Error occurred opening content in editor.");
exports.msgSaveStarted = vscode_1.l10n.t("Started saving results to ");
exports.msgSaveFailed = vscode_1.l10n.t("Failed to save results. ");
exports.msgSaveSucceeded = vscode_1.l10n.t("Successfully saved results to ");
exports.msgSelectProfileToRemove = vscode_1.l10n.t("Select profile to remove");
exports.confirmRemoveProfilePrompt = vscode_1.l10n.t("Confirm to remove this profile.");
exports.msgNoProfilesSaved = vscode_1.l10n.t("No connection profile to remove.");
exports.msgProfileRemoved = vscode_1.l10n.t("Profile removed successfully");
exports.msgProfileCreated = vscode_1.l10n.t("Profile created successfully");
exports.msgProfileCreatedAndConnected = vscode_1.l10n.t("Profile created and connected");
exports.msgClearedRecentConnections = vscode_1.l10n.t("Recent connections list cleared");
exports.msgIsRequired = vscode_1.l10n.t(" is required.");
exports.msgError = vscode_1.l10n.t("Error: ");
exports.msgYes = vscode_1.l10n.t("Yes");
exports.msgNo = vscode_1.l10n.t("No");
exports.defaultDatabaseLabel = vscode_1.l10n.t("<default>");
exports.notConnectedLabel = vscode_1.l10n.t("Disconnected");
exports.notConnectedTooltip = vscode_1.l10n.t("Click to connect to a database");
exports.connectingLabel = vscode_1.l10n.t("Connecting");
exports.connectingTooltip = vscode_1.l10n.t("Connecting to: ");
exports.connectErrorLabel = vscode_1.l10n.t("Connection error");
exports.connectErrorTooltip = vscode_1.l10n.t("Error connecting to: ");
exports.connectErrorCode = vscode_1.l10n.t("Error code: ");
exports.connectErrorMessage = vscode_1.l10n.t("Error Message: ");
exports.cancelingQueryLabel = vscode_1.l10n.t("Canceling query ");
exports.updatingIntelliSenseLabel = vscode_1.l10n.t("Updating IntelliSense...");
exports.extensionNotInitializedError = vscode_1.l10n.t("Unable to execute the command while the extension is initializing. Please try again later.");
exports.untitledScheme = vscode_1.l10n.t("untitled");
exports.msgChangeLanguageMode = vscode_1.l10n.t('To use this command, you must set the language to "SQL". Confirm to change language mode.');
function msgChangedDatabaseContext(databaseName, documentName) {
    return vscode_1.l10n.t({
        message: 'Changed database context to "{0}" for document "{1}"',
        args: [databaseName, documentName],
        comment: ["{0} is the database name", "{1} is the document name"],
    });
}
exports.msgPromptRetryCreateProfile = vscode_1.l10n.t("Error: Unable to connect using the connection information provided. Retry profile creation?");
exports.refreshTokenLabel = vscode_1.l10n.t("Refresh Credentials");
exports.msgGetTokenFail = vscode_1.l10n.t("Failed to fetch user tokens.");
exports.msgPromptRetryConnectionDifferentCredentials = vscode_1.l10n.t("Error: Login failed. Retry using different credentials?");
exports.msgPromptSSLCertificateValidationFailed = vscode_1.l10n.t("Encryption was enabled on this connection; review your SSL and certificate configuration for the target SQL Server, or set 'Trust server certificate' to 'true' in the settings file. Note: A self-signed certificate offers only limited protection and is not a recommended practice for production environments. Do you want to enable 'Trust server certificate' on this connection and retry?");
exports.msgPromptRetryFirewallRuleNotSignedIn = vscode_1.l10n.t("Your client IP address does not have access to the server. Add a Microsoft Entra account and create a new firewall rule to enable access.");
function msgPromptRetryFirewallRuleSignedIn(clientIp, serverName) {
    return vscode_1.l10n.t({
        message: "Your client IP Address '{0}' does not have access to the server '{1}' you're attempting to connect to. Would you like to create new firewall rule?",
        args: [clientIp, serverName],
        comment: ["{0} is the client IP address", "{1} is the server name"],
    });
}
exports.msgPromptRetryFirewallRuleAdded = vscode_1.l10n.t("Firewall rule successfully added. Retry profile creation? ");
exports.msgAccountRefreshFailed = vscode_1.l10n.t("Credential Error: An error occurred while attempting to refresh account credentials. Please re-authenticate.");
exports.msgPromptProfileUpdateFailed = vscode_1.l10n.t("Connection Profile could not be updated. Please modify the connection details manually in settings.json and try again.");
exports.msgUnableToExpand = vscode_1.l10n.t("Unable to expand. Please check logs for more information.");
exports.msgPromptFirewallRuleCreated = vscode_1.l10n.t("Firewall rule successfully created.");
exports.msgAuthTypeNotFound = vscode_1.l10n.t("Failed to get authentication method, please remove and re-add the account.");
exports.msgAccountNotFound = vscode_1.l10n.t("Account not found");
exports.msgChooseQueryHistory = vscode_1.l10n.t("Choose Query History");
exports.msgChooseQueryHistoryAction = vscode_1.l10n.t("Choose An Action");
exports.msgOpenQueryHistory = vscode_1.l10n.t("Open Query History");
exports.msgRunQueryHistory = vscode_1.l10n.t("Run Query History");
exports.msgInvalidIpAddress = vscode_1.l10n.t("Invalid IP Address");
exports.msgInvalidRuleName = vscode_1.l10n.t("Invalid Firewall rule name");
exports.msgNoQueriesAvailable = vscode_1.l10n.t("No Queries Available");
exports.retryLabel = vscode_1.l10n.t("Retry");
exports.createFirewallRuleLabel = vscode_1.l10n.t("Create Firewall Rule");
function msgConnecting(serverName, documentName) {
    return vscode_1.l10n.t({
        message: 'Connecting to server "{0}" on document "{1}".',
        args: [serverName, documentName],
        comment: ["{0} is the server name", "{1} is the document name"],
    });
}
function msgConnectionNotFound(uri) {
    return vscode_1.l10n.t({
        message: 'Connection not found for uri "{0}".',
        args: [uri],
        comment: ["{0} is the uri"],
    });
}
function msgFoundPendingReconnect(uri) {
    return vscode_1.l10n.t({
        message: "Found pending reconnect promise for uri {0}, waiting.",
        args: [uri],
        comment: ["{0} is the uri"],
    });
}
function msgPendingReconnectSuccess(uri) {
    return vscode_1.l10n.t({
        message: "Previous pending reconnection for uri {0}, succeeded.",
        args: [uri],
        comment: ["{0} is the uri"],
    });
}
function msgFoundPendingReconnectFailed(uri) {
    return vscode_1.l10n.t({
        message: "Found pending reconnect promise for uri {0}, failed.",
        args: [uri],
        comment: ["{0} is the uri"],
    });
}
function msgFoundPendingReconnectError(uri, error) {
    return vscode_1.l10n.t({
        message: "Previous pending reconnect promise for uri {0} is rejected with error {1}, will attempt to reconnect if necessary.",
        args: [uri, error],
        comment: ["{0} is the uri", "{1} is the error"],
    });
}
function msgAcessTokenExpired(connectionId, uri) {
    return vscode_1.l10n.t({
        message: "Access token expired for connection {0} with uri {1}",
        args: [connectionId, uri],
        comment: ["{0} is the connection id", "{1} is the uri"],
    });
}
exports.msgRefreshTokenError = vscode_1.l10n.t("Error when refreshing token");
exports.msgAzureCredStoreSaveFailedError = vscode_1.l10n.t('Keys for token cache could not be saved in credential store, this may cause Microsoft Entra Id access token persistence issues and connection instabilities. It\'s likely that SqlTools has reached credential storage limit on Windows, please clear at least 2 credentials that start with "Microsoft.SqlTools|" in Windows Credential Manager and reload.');
function msgRefreshConnection(connectionId, uri) {
    return vscode_1.l10n.t({
        message: "Failed to refresh connection ${0} with uri {1}, invalid connection result.",
        args: [connectionId, uri],
        comment: ["{0} is the connection id", "{1} is the uri"],
    });
}
function msgRefreshTokenSuccess(connectionId, uri, message) {
    return vscode_1.l10n.t({
        message: "Successfully refreshed token for connection {0} with uri {1}, {2}",
        args: [connectionId, uri, message],
        comment: ["{0} is the connection id", "{1} is the uri", "{2} is the message"],
    });
}
function msgRefreshTokenNotNeeded(connectionId, uri) {
    return vscode_1.l10n.t({
        message: "No need to refresh Microsoft Entra acccount token for connection {0} with uri {1}",
        args: [connectionId, uri],
        comment: ["{0} is the connection id", "{1} is the uri"],
    });
}
function msgConnectedServerInfo(serverName, documentName, serverInfo) {
    return vscode_1.l10n.t({
        message: 'Connected to server "{0}" on document "{1}". Server information: {2}',
        args: [serverName, documentName, serverInfo],
        comment: ["{0} is the server name", "{1} is the document name", "{2} is the server info"],
    });
}
function msgConnectionFailed(serverName, errorMessage) {
    return vscode_1.l10n.t({
        message: 'Error connecting to server "{0}". Details: {1}',
        args: [serverName, errorMessage],
        comment: ["{0} is the server name", "{1} is the error message"],
    });
}
function msgChangingDatabase(databaseName, serverName, documentName) {
    return vscode_1.l10n.t({
        message: 'Changing database context to "{0}" on server "{1}" on document "{2}".',
        args: [databaseName, serverName, documentName],
        comment: ["{0} is the database name", "{1} is the server name", "{2} is the document name"],
    });
}
function msgChangedDatabase(databaseName, serverName, documentName) {
    return vscode_1.l10n.t({
        message: 'Changed database context to "{0}" on server "{1}" on document "{2}".',
        args: [databaseName, serverName, documentName],
        comment: ["{0} is the database name", "{1} is the server name", "{2} is the document name"],
    });
}
function msgDisconnected(documentName) {
    return vscode_1.l10n.t({
        message: 'Disconnected on document "{0}"',
        args: [documentName],
        comment: ["{0} is the document name"],
    });
}
exports.macOpenSslErrorMessage = vscode_1.l10n.t("OpenSSL version >=1.0.1 is required to connect.");
exports.macOpenSslHelpButton = vscode_1.l10n.t("Help");
exports.macSierraRequiredErrorMessage = vscode_1.l10n.t("macOS Sierra or newer is required to use this feature.");
exports.gettingDefinitionMessage = vscode_1.l10n.t("Getting definition ...");
exports.definitionRequestedStatus = vscode_1.l10n.t("DefinitionRequested");
exports.definitionRequestCompletedStatus = vscode_1.l10n.t("DefinitionRequestCompleted");
exports.updatingIntelliSenseStatus = vscode_1.l10n.t("updatingIntelliSense");
exports.intelliSenseUpdatedStatus = vscode_1.l10n.t("intelliSenseUpdated");
exports.testLocalizationConstant = vscode_1.l10n.t("test");
exports.disconnectOptionLabel = vscode_1.l10n.t("Disconnect");
exports.disconnectOptionDescription = vscode_1.l10n.t("Close the current connection");
exports.disconnectConfirmationMsg = vscode_1.l10n.t("Are you sure you want to disconnect?");
function elapsedBatchTime(batchTime) {
    return vscode_1.l10n.t({
        message: "Batch execution time: {0}",
        args: [batchTime],
        comment: ["{0} is the batch time"],
    });
}
exports.noActiveEditorMsg = vscode_1.l10n.t("A SQL editor must have focus before executing this command");
exports.maximizeLabel = vscode_1.l10n.t("Maximize");
exports.restoreLabel = vscode_1.l10n.t("Restore");
exports.saveCSVLabel = vscode_1.l10n.t("Save as CSV");
exports.saveJSONLabel = vscode_1.l10n.t("Save as JSON");
exports.saveExcelLabel = vscode_1.l10n.t("Save as Excel");
exports.fileTypeCSVLabel = vscode_1.l10n.t("CSV");
exports.fileTypeJSONLabel = vscode_1.l10n.t("JSON");
exports.fileTypeExcelLabel = vscode_1.l10n.t("Excel");
exports.resultPaneLabel = vscode_1.l10n.t("Results");
exports.selectAll = vscode_1.l10n.t("Select all");
exports.copyLabel = vscode_1.l10n.t("Copy");
exports.copyWithHeadersLabel = vscode_1.l10n.t("Copy with Headers");
exports.executeQueryLabel = vscode_1.l10n.t("Executing query...");
exports.QueryExecutedLabel = vscode_1.l10n.t("Query executed");
exports.messagePaneLabel = vscode_1.l10n.t("Messages");
exports.messagesTableTimeStampColumn = vscode_1.l10n.t("Timestamp");
exports.messagesTableMessageColumn = vscode_1.l10n.t("Message");
function lineSelectorFormatted(lineNumber) {
    return vscode_1.l10n.t({
        message: "Line {0}",
        args: [lineNumber],
        comment: ["{0} is the line number"],
    });
}
function elapsedTimeLabel(elapsedTime) {
    return vscode_1.l10n.t({
        message: "Total execution time: {0}",
        args: [elapsedTime],
        comment: ["{0} is the elapsed time"],
    });
}
exports.msgCannotSaveMultipleSelections = vscode_1.l10n.t("Save results command cannot be used with multiple selections.");
exports.mssqlProviderName = vscode_1.l10n.t("MSSQL");
exports.noneProviderName = vscode_1.l10n.t("None");
exports.flavorChooseLanguage = vscode_1.l10n.t("Choose SQL Language");
exports.flavorDescriptionMssql = vscode_1.l10n.t("Use T-SQL intellisense and syntax error checking on current document");
exports.flavorDescriptionNone = vscode_1.l10n.t("Disable intellisense and syntax error checking on current document");
exports.autoDisableNonTSqlLanguageServicePrompt = vscode_1.l10n.t("Non-SQL Server SQL file detected. Disable IntelliSense for such files?");
exports.msgAddConnection = vscode_1.l10n.t("Add Connection");
exports.msgConnect = vscode_1.l10n.t("Connect");
exports.azureSignIn = vscode_1.l10n.t("Azure: Sign In");
exports.azureSignInDescription = vscode_1.l10n.t("Sign in to your Azure subscription");
exports.azureSignInWithDeviceCode = vscode_1.l10n.t("Azure: Sign In with Device Code");
exports.azureSignInWithDeviceCodeDescription = vscode_1.l10n.t("Sign in to your Azure subscription with a device code. Use this in setups where the Sign In command does not work");
exports.azureSignInToAzureCloud = vscode_1.l10n.t("Azure: Sign In to Azure Cloud");
exports.azureSignInToAzureCloudDescription = vscode_1.l10n.t("Sign in to your Azure subscription in one of the sovereign clouds.");
function taskStatusWithName(taskName, status) {
    return vscode_1.l10n.t({
        message: "{0}: {1}",
        args: [taskName, status],
        comment: ["{0} is the task name", "{1} is the status"],
    });
}
function taskStatusWithMessage(status, message) {
    return vscode_1.l10n.t({
        message: "{0}. {1}",
        args: [status, message],
        comment: ["{0} is the status", "{1} is the message"],
    });
}
function taskStatusWithNameAndMessage(taskName, status, message) {
    return vscode_1.l10n.t({
        message: "{0}: {1}. {2}",
        args: [taskName, status, message],
        comment: ["{0} is the task name", "{1} is the status", "{2} is the message"],
    });
}
exports.failed = vscode_1.l10n.t("Failed");
exports.succeeded = vscode_1.l10n.t("Succeeded");
exports.succeededWithWarning = vscode_1.l10n.t("Succeeded with warning");
exports.canceled = vscode_1.l10n.t("Canceled");
exports.inProgress = vscode_1.l10n.t("In progress");
exports.canceling = vscode_1.l10n.t("Canceling");
exports.notStarted = vscode_1.l10n.t("Not started");
exports.nodeErrorMessage = vscode_1.l10n.t("Parent node was not TreeNodeInfo.");
function deleteCredentialError(id, error) {
    return vscode_1.l10n.t({
        message: "Failed to delete credential with id: {0}. {1}",
        args: [id, error],
        comment: ["{0} is the id", "{1} is the error"],
    });
}
exports.msgClearedRecentConnectionsWithErrors = vscode_1.l10n.t("The recent connections list has been cleared but there were errors while deleting some associated credentials. View the errors in the MSSQL output channel.");
exports.connectProgressNoticationTitle = vscode_1.l10n.t("Testing connection profile...");
exports.msgMultipleSelectionModeNotSupported = vscode_1.l10n.t("Running query is not supported when the editor is in multiple selection mode.");
exports.newColumnWidthPrompt = vscode_1.l10n.t("Enter new column width");
exports.columnWidthInvalidNumberError = vscode_1.l10n.t("Invalid column width");
exports.columnWidthMustBePositiveError = vscode_1.l10n.t("Width cannot be 0 or negative");
exports.objectExplorerNodeRefreshError = vscode_1.l10n.t("An error occurred refreshing nodes. See the MSSQL output channel for more details.");
exports.showOutputChannelActionButtonText = vscode_1.l10n.t("Show MSSQL output");
exports.reloadPrompt = vscode_1.l10n.t("Authentication Library has changed, please reload Visual Studio Code.");
exports.reloadPromptGeneric = vscode_1.l10n.t("Visual Studio Code must be relaunched for this setting to come into effect.  Please reload Visual Studio Code.");
exports.reloadChoice = vscode_1.l10n.t("Reload Visual Studio Code");
exports.switchToMsal = vscode_1.l10n.t("Switch to MSAL");
exports.dismiss = vscode_1.l10n.t("Dismiss");
exports.querySuccess = vscode_1.l10n.t("Query succeeded");
exports.queryFailed = vscode_1.l10n.t("Query failed");
exports.parameters = vscode_1.l10n.t("Parameters");
exports.loading = vscode_1.l10n.t("Loading");
exports.executionPlan = vscode_1.l10n.t("Execution Plan");
exports.executionPlanFileFilter = vscode_1.l10n.t("SQL Plan Files");
exports.scriptCopiedToClipboard = vscode_1.l10n.t("Script copied to clipboard");
exports.copied = vscode_1.l10n.t("Copied");
exports.openQueryResultsInTabByDefaultPrompt = vscode_1.l10n.t("Do you want to always display query results in a new tab instead of the query pane?");
exports.alwaysShowInNewTab = vscode_1.l10n.t("Always show in new tab");
exports.keepInQueryPane = vscode_1.l10n.t("Keep in query pane");
function enableRichExperiencesPrompt(learnMoreUrl) {
    return vscode_1.l10n.t({
        message: "The MSSQL for VS Code extension is introducing new modern data development features! Would you like to enable them? [Learn more]({0})",
        args: [learnMoreUrl],
        comment: ["{0} is a url to learn more about the new features"],
    });
}
exports.enableRichExperiences = vscode_1.l10n.t("Enable Experiences & Reload");
class ObjectExplorer {
}
exports.ObjectExplorer = ObjectExplorer;
ObjectExplorer.ErrorLoadingRefreshToTryAgain = vscode_1.l10n.t("Error loading; refresh to try again");
ObjectExplorer.NoItems = vscode_1.l10n.t("No items");
ObjectExplorer.FailedOEConnectionError = vscode_1.l10n.t("We couldn’t connect using the current connection information. Would you like to retry the connection or edit the connection profile?");
ObjectExplorer.FailedOEConnectionErrorRetry = vscode_1.l10n.t("Retry");
ObjectExplorer.FailedOEConnectionErrorUpdate = vscode_1.l10n.t("Edit Connection Profile");
ObjectExplorer.Connecting = vscode_1.l10n.t("Connecting...");
class ConnectionDialog {
    static errorLoadingAzureDatabases(subscriptionName, subscriptionId) {
        return vscode_1.l10n.t({
            message: "Error loading Azure databases for subscription {0} ({1}).  Confirm that you have permission.",
            args: [subscriptionName, subscriptionId],
            comment: ["{0} is the subscription name", "{1} is the subscription id"],
        });
    }
}
exports.ConnectionDialog = ConnectionDialog;
ConnectionDialog.connectionDialog = vscode_1.l10n.t("Connection Dialog (Preview)");
ConnectionDialog.azureAccount = vscode_1.l10n.t("Azure Account");
ConnectionDialog.azureAccountIsRequired = vscode_1.l10n.t("Azure Account is required");
ConnectionDialog.selectAnAccount = vscode_1.l10n.t("Select an account");
ConnectionDialog.savePassword = vscode_1.l10n.t("Save Password");
ConnectionDialog.tenantId = vscode_1.l10n.t("Tenant ID");
ConnectionDialog.selectATenant = vscode_1.l10n.t("Select a tenant");
ConnectionDialog.tenantIdIsRequired = vscode_1.l10n.t("Tenant ID is required");
ConnectionDialog.profileName = vscode_1.l10n.t("Profile Name");
ConnectionDialog.serverIsRequired = vscode_1.l10n.t("Server is required");
ConnectionDialog.usernameIsRequired = vscode_1.l10n.t("User name is required");
ConnectionDialog.connectionString = vscode_1.l10n.t("Connection String");
ConnectionDialog.connectionStringIsRequired = vscode_1.l10n.t("Connection string is required");
ConnectionDialog.signIn = vscode_1.l10n.t("Sign in");
ConnectionDialog.additionalParameters = vscode_1.l10n.t("Additional parameters");
ConnectionDialog.connect = vscode_1.l10n.t("Connect");
ConnectionDialog.deleteTheSavedConnection = (connectionName) => {
    return vscode_1.l10n.t({
        message: "delete the saved connection: {0}?",
        args: [connectionName],
        comment: ["{0} is the connection name"],
    });
};
class FirewallRule {
}
exports.FirewallRule = FirewallRule;
FirewallRule.addFirewallRule = vscode_1.l10n.t("Add Firewall Rule");
FirewallRule.addFirewallRuleToServer = (serverName) => {
    return vscode_1.l10n.t({
        message: "Add Firewall Rule to {0}",
        args: [serverName],
        comment: ["{0} is the server name"],
    });
};
class Azure {
}
exports.Azure = Azure;
Azure.azureSignInFailedOrWasCancelled = vscode_1.l10n.t("Azure sign-in failed or was cancelled.");
Azure.errorLoadingAzureAccountInfoForTenantId = (tenantId) => {
    return vscode_1.l10n.t({
        message: "Error loading Azure account information for tenant ID '{0}'",
        args: [tenantId],
        comment: ["{0} is the tenant ID"],
    });
};
Azure.errorCreatingFirewallRule = (ruleInfo, error) => {
    return vscode_1.l10n.t({
        message: "Error creating firewall rule {0}.  Check your Azure account settings and try again.  Error: {1}",
        args: [ruleInfo, error],
        comment: [
            "{0} is the rule info in format 'name (startIp - endIp)'",
            "{1} is the error message",
        ],
    });
};
class QueryResult {
}
exports.QueryResult = QueryResult;
QueryResult.nonNumericSelectionSummary = (count, distinctCount, nullCount) => vscode_1.l10n.t({
    message: "Count: {0}  Distinct Count: {1}  Null Count: {2}",
    args: [count, distinctCount, nullCount],
    comment: ["{0} is the count, {1} is the distinct count, and {2} is the null count"],
});
QueryResult.numericSelectionSummary = (average, count, sum) => vscode_1.l10n.t({
    message: "Average: {0}  Count: {1}  Sum: {2}",
    args: [average, count, sum],
    comment: ["{0} is the average, {1} is the count, {2} is the sum"],
});
QueryResult.numericSelectionSummaryTooltip = (average, count, distinctCount, max, min, nullCount, sum) => vscode_1.l10n.t({
    message: "Average: {0}  Count: {1}  Distinct Count: {2}  Max: {3}  Min: {4}  Null Count: {5}  Sum: {6}",
    args: [average, count, distinctCount, max, min, nullCount, sum],
    comment: [
        "{0} is the average, {1} is the count, {2} is the distinct count, {3} is the max, {4} is the min, {5} is the null count, {6} is the sum",
    ],
});
class UserSurvey {
}
exports.UserSurvey = UserSurvey;
UserSurvey.overallHowSatisfiedAreYouWithMSSQLExtension = vscode_1.l10n.t("Overall, how satisfied are you with the MSSQL extension?");
UserSurvey.howlikelyAreYouToRecommendMSSQLExtension = vscode_1.l10n.t("How likely it is that you would recommend the MSSQL extension to a friend or colleague?");
UserSurvey.whatCanWeDoToImprove = vscode_1.l10n.t("What can we do to improve?");
UserSurvey.takeSurvey = vscode_1.l10n.t("Take Survey");
UserSurvey.doYouMindTakingAQuickFeedbackSurvey = vscode_1.l10n.t("Do you mind taking a quick feedback survey about the MSSQL Extension for VS Code?");
UserSurvey.mssqlFeedback = vscode_1.l10n.t("MSSQL Feedback");
UserSurvey.privacyDisclaimer = vscode_1.l10n.t("Microsoft reviews your feedback to improve our products, so don't share any personal data or confidential/proprietary content.");
UserSurvey.overallHowStatisfiedAreYouWithFeature = (featureName) => vscode_1.l10n.t({
    message: "Overall, how satisfied are you with {0}?",
    args: [featureName],
    comment: ["{0} is the feature name"],
});
UserSurvey.howLikelyAreYouToRecommendFeature = (featureName) => vscode_1.l10n.t({
    message: "How likely it is that you would recommend {0} to a friend or colleague?",
    args: [featureName],
    comment: ["{0} is the feature name"],
});
UserSurvey.fileAnIssuePrompt = vscode_1.l10n.t("Encountering a problem?  Share the details with us by opening a GitHub issue so we can improve!");
UserSurvey.submitIssue = vscode_1.l10n.t("Submit an issue");
class Webview {
}
exports.Webview = Webview;
Webview.webviewRestorePrompt = (webviewName) => vscode_1.l10n.t({
    message: "{0} has been closed. Would you like to restore it?",
    args: [webviewName],
    comment: ["{0} is the webview name"],
});
Webview.Restore = vscode_1.l10n.t("Restore");
class TableDesigner {
}
exports.TableDesigner = TableDesigner;
TableDesigner.General = vscode_1.l10n.t("General");
TableDesigner.Columns = vscode_1.l10n.t("Columns");
TableDesigner.AdvancedOptions = vscode_1.l10n.t("Advanced Options");
class SchemaCompare {
}
exports.SchemaCompare = SchemaCompare;
SchemaCompare.Title = vscode_1.l10n.t("Schema Compare (Preview)");
SchemaCompare.Open = vscode_1.l10n.t("Open");
SchemaCompare.Save = vscode_1.l10n.t("Save");
SchemaCompare.defaultUserName = vscode_1.l10n.t("default");
SchemaCompare.Yes = vscode_1.l10n.t("Yes");
SchemaCompare.No = vscode_1.l10n.t("No");
SchemaCompare.optionsChangedMessage = vscode_1.l10n.t("Options have changed. Recompare to see the comparison?");
SchemaCompare.generateScriptErrorMessage = (errorMessage) => vscode_1.l10n.t({
    message: "Failed to generate script: '{0}'",
    args: [errorMessage ? errorMessage : "Unknown"],
    comment: ["{0} is the error message returned from the generate script operation"],
});
SchemaCompare.areYouSureYouWantToUpdateTheTarget = vscode_1.l10n.t("Are you sure you want to update the target?");
SchemaCompare.schemaCompareApplyFailed = (errorMessage) => vscode_1.l10n.t({
    message: "Failed to apply changes: '{0}'",
    args: [errorMessage ? errorMessage : "Unknown"],
    comment: ["{0} is the error message returned from the publish changes operation"],
});
SchemaCompare.openScmpErrorMessage = (errorMessage) => vscode_1.l10n.t({
    message: "Failed to open scmp file: '{0}'",
    args: [errorMessage ? errorMessage : "Unknown"],
    comment: ["{0} is the error message returned from the open scmp operation"],
});
SchemaCompare.saveScmpErrorMessage = (errorMessage) => vscode_1.l10n.t({
    message: "Failed to save scmp file: '{0}'",
    args: [errorMessage ? errorMessage : "Unknown"],
    comment: ["{0} is the error message returned from the save scmp operation"],
});
SchemaCompare.cancelErrorMessage = (errorMessage) => vscode_1.l10n.t({
    message: "Cancel schema compare failed: '{0}'",
    args: [errorMessage ? errorMessage : "Unknown"],
    comment: ["{0} is the error message returned from the cancel operation"],
});
SchemaCompare.compareErrorMessage = (errorMessage) => vscode_1.l10n.t({
    message: "Schema Compare failed: '{0}'",
    args: [errorMessage ? errorMessage : "Unknown"],
    comment: ["{0} is the error message returned from the compare operation"],
});
SchemaCompare.cannotExcludeEntryWithBlockingDependency = (diffEntryName, firstDependentName) => vscode_1.l10n.t({
    message: "Cannot exclude {0}. Included dependents exist, such as {1}",
    args: [diffEntryName, firstDependentName],
    comment: [
        "{0} is the name of the entry",
        "{1} is the name of the blocking dependency preventing exclusion.",
    ],
});
SchemaCompare.cannotIncludeEntryWithBlockingDependency = (diffEntryName, firstDependentName) => vscode_1.l10n.t({
    message: "Cannot include {0}. Excluded dependents exist, such as {1}",
    args: [diffEntryName, firstDependentName],
    comment: [
        "{0} is the name of the entry",
        "{1} is the name of the blocking dependency preventing inclusion.",
    ],
});
SchemaCompare.cannotExcludeEntry = (diffEntryName) => vscode_1.l10n.t({
    message: "Cannot exclude {0}. Included dependents exist",
    args: [diffEntryName],
    comment: ["{0} is the name of the entry"],
});
SchemaCompare.cannotIncludeEntry = (diffEntryName) => vscode_1.l10n.t({
    message: "Cannot include {0}. Excluded dependents exist",
    args: [diffEntryName],
    comment: ["{0} is the name of the entry"],
});
class SchemaDesigner {
}
exports.SchemaDesigner = SchemaDesigner;
SchemaDesigner.LoadingSchemaDesginerModel = vscode_1.l10n.t("Loading Schema Designer Model...");
SchemaDesigner.SchemaReady = vscode_1.l10n.t("Schema Designer Model is ready. Changes can now be published.");
SchemaDesigner.SaveAs = vscode_1.l10n.t("Save As");
SchemaDesigner.Save = vscode_1.l10n.t("Save");

//# sourceMappingURL=locConstants.js.map
