"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCapabilitiesRequest = exports.ClearPooledConnectionsRequest = exports.EncryptionKeysChangedNotification = exports.DidChangeEncryptionIVKeyParams = exports.ParseConnectionStringRequest = exports.GetConnectionStringParams = exports.GetConnectionStringRequest = exports.ListDatabasesResult = exports.ListDatabasesParams = exports.ListDatabasesRequest = exports.DisconnectParams = exports.DisconnectRequest = exports.ConnectionChangedParams = exports.ConnectionSummary = exports.ConnectionChangedNotification = exports.CancelConnectParams = exports.CancelConnectRequest = exports.ConnectionCompleteParams = exports.ConnectionCompleteNotification = exports.ConnectParams = exports.ConnectionRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
// ------------------------------- < Connect Request > ----------------------------------------------
// Connection request message callback declaration
var ConnectionRequest;
(function (ConnectionRequest) {
    ConnectionRequest.type = new vscode_languageclient_1.RequestType("connection/connect");
})(ConnectionRequest || (exports.ConnectionRequest = ConnectionRequest = {}));
/**
 * Connection request message format
 */
class ConnectParams {
}
exports.ConnectParams = ConnectParams;
// ------------------------------- </ Connect Request > ---------------------------------------------
// ------------------------------- < Connection Complete Event > ------------------------------------
/**
 * Connection complete event callback declaration.
 */
var ConnectionCompleteNotification;
(function (ConnectionCompleteNotification) {
    ConnectionCompleteNotification.type = new vscode_languageclient_1.NotificationType("connection/complete");
})(ConnectionCompleteNotification || (exports.ConnectionCompleteNotification = ConnectionCompleteNotification = {}));
/**
 * Connection response format.
 */
class ConnectionCompleteParams {
}
exports.ConnectionCompleteParams = ConnectionCompleteParams;
// ------------------------------- </ Connection Complete Event > -----------------------------------
// ------------------------------- < Cancel Connect Request > ---------------------------------------
/**
 * Cancel connect request message callback declaration
 */
var CancelConnectRequest;
(function (CancelConnectRequest) {
    CancelConnectRequest.type = new vscode_languageclient_1.RequestType("connection/cancelconnect");
})(CancelConnectRequest || (exports.CancelConnectRequest = CancelConnectRequest = {}));
/**
 * Cancel connect request message format
 */
class CancelConnectParams {
}
exports.CancelConnectParams = CancelConnectParams;
// ------------------------------- </ Cancel Connect Request > --------------------------------------
// ------------------------------- < Connection Changed Event > -------------------------------------
/**
 * Connection changed event callback declaration.
 */
var ConnectionChangedNotification;
(function (ConnectionChangedNotification) {
    ConnectionChangedNotification.type = new vscode_languageclient_1.NotificationType("connection/connectionchanged");
})(ConnectionChangedNotification || (exports.ConnectionChangedNotification = ConnectionChangedNotification = {}));
/**
 * Summary that identifies a unique database connection.
 */
class ConnectionSummary {
}
exports.ConnectionSummary = ConnectionSummary;
/**
 * Parameters for the ConnectionChanged notification.
 */
class ConnectionChangedParams {
}
exports.ConnectionChangedParams = ConnectionChangedParams;
// ------------------------------- </ Connection Changed Event > ------------------------------------
// ------------------------------- < Disconnect Request > -------------------------------------------
// Disconnect request message callback declaration
var DisconnectRequest;
(function (DisconnectRequest) {
    DisconnectRequest.type = new vscode_languageclient_1.RequestType("connection/disconnect");
})(DisconnectRequest || (exports.DisconnectRequest = DisconnectRequest = {}));
// Disconnect request message format
class DisconnectParams {
}
exports.DisconnectParams = DisconnectParams;
// ------------------------------- </ Disconnect Request > ------------------------------------------
// ------------------------------- < List Databases Request > ---------------------------------------
// List databases request callback declaration
var ListDatabasesRequest;
(function (ListDatabasesRequest) {
    ListDatabasesRequest.type = new vscode_languageclient_1.RequestType("connection/listdatabases");
})(ListDatabasesRequest || (exports.ListDatabasesRequest = ListDatabasesRequest = {}));
// List databases request format
class ListDatabasesParams {
}
exports.ListDatabasesParams = ListDatabasesParams;
// List databases response format
class ListDatabasesResult {
}
exports.ListDatabasesResult = ListDatabasesResult;
// ------------------------------- </ List Databases Request > --------------------------------------
// ------------------------------- < Get Connection String Request > ---------------------------------------
/**
 * Get Connection String request callback declaration
 */
var GetConnectionStringRequest;
(function (GetConnectionStringRequest) {
    GetConnectionStringRequest.type = new vscode_languageclient_1.RequestType("connection/getconnectionstring");
})(GetConnectionStringRequest || (exports.GetConnectionStringRequest = GetConnectionStringRequest = {}));
/**
 * Get Connection String request format
 */
class GetConnectionStringParams {
}
exports.GetConnectionStringParams = GetConnectionStringParams;
// ------------------------------- </ Get Connection String Request > --------------------------------------
// ------------------------------- < Parse Connection String Request > ---------------------------------------
/**
 * Parse Connection String request callback declaration
 */
var ParseConnectionStringRequest;
(function (ParseConnectionStringRequest) {
    ParseConnectionStringRequest.type = new vscode_languageclient_1.RequestType("connection/parseConnectionString");
})(ParseConnectionStringRequest || (exports.ParseConnectionStringRequest = ParseConnectionStringRequest = {}));
// ------------------------------- </ Build Connection Details > --------------------------------------
// ------------------------------- < Encryption IV/KEY updation Event > ------------------------------------
/**
 * Parameters for the MSAL cache encryption key notification
 */
class DidChangeEncryptionIVKeyParams {
}
exports.DidChangeEncryptionIVKeyParams = DidChangeEncryptionIVKeyParams;
/**
 * Notification sent when the encryption keys are changed.
 */
var EncryptionKeysChangedNotification;
(function (EncryptionKeysChangedNotification) {
    EncryptionKeysChangedNotification.type = new vscode_languageclient_1.NotificationType("connection/encryptionKeysChanged");
})(EncryptionKeysChangedNotification || (exports.EncryptionKeysChangedNotification = EncryptionKeysChangedNotification = {}));
// ------------------------------- < Clear Pooled Connections Request > ---------------------------------------
var ClearPooledConnectionsRequest;
(function (ClearPooledConnectionsRequest) {
    ClearPooledConnectionsRequest.type = new vscode_languageclient_1.RequestType("connection/clearpooledconnections");
})(ClearPooledConnectionsRequest || (exports.ClearPooledConnectionsRequest = ClearPooledConnectionsRequest = {}));
//#region Connection capabilities
/**
 * Gets the capabilities of the data protocol server
 */
var GetCapabilitiesRequest;
(function (GetCapabilitiesRequest) {
    GetCapabilitiesRequest.type = new vscode_languageclient_1.RequestType("capabilities/list");
})(GetCapabilitiesRequest || (exports.GetCapabilitiesRequest = GetCapabilitiesRequest = {}));
//#endregion

//# sourceMappingURL=connection.js.map
