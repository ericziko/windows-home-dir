"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixupConnectionCredentials = fixupConnectionCredentials;
exports.updateEncrypt = updateEncrypt;
exports.getSimpleConnectionDisplayName = getSimpleConnectionDisplayName;
exports.getPicklistDescription = getPicklistDescription;
exports.getPicklistDetails = getPicklistDetails;
exports.getConnectionDisplayString = getConnectionDisplayString;
exports.getUserNameOrDomainLogin = getUserNameOrDomainLogin;
exports.getTooltip = getTooltip;
exports.getEncryptionMode = getEncryptionMode;
exports.getConnectionDisplayName = getConnectionDisplayName;
const Constants = require("../constants/constants");
const LocalizedConstants = require("../constants/locConstants");
const interfaces_1 = require("../models/interfaces");
const Interfaces = require("./interfaces");
const Utils = require("./utils");
/**
 * Sets sensible defaults for key connection properties, especially
 * if connection to Azure
 *
 * @export connectionInfo/fixupConnectionCredentials
 * @param connCreds connection to be fixed up
 * @returns the updated connection
 */
function fixupConnectionCredentials(connCreds) {
    if (!connCreds.server) {
        connCreds.server = "";
    }
    if (!connCreds.database) {
        connCreds.database = "";
    }
    if (!connCreds.user) {
        connCreds.user = "";
    }
    if (!connCreds.password) {
        connCreds.password = "";
    }
    if (!connCreds.connectTimeout) {
        connCreds.connectTimeout = Constants.defaultConnectionTimeout;
    }
    if (!connCreds.commandTimeout) {
        connCreds.commandTimeout = Constants.defaultCommandTimeout;
    }
    // default value for encrypt
    if (connCreds.encrypt === "" || connCreds.encrypt === true) {
        connCreds.encrypt = interfaces_1.EncryptOptions.Mandatory;
    }
    else if (connCreds.encrypt === false) {
        connCreds.encrypt = interfaces_1.EncryptOptions.Optional;
    }
    // default value for appName
    if (!connCreds.applicationName) {
        connCreds.applicationName = Constants.connectionApplicationName;
    }
    if (isAzureDatabase(connCreds.server)) {
        // always encrypt connection when connecting to Azure SQL
        connCreds.encrypt = interfaces_1.EncryptOptions.Mandatory;
        // Ensure minumum connection timeout when connecting to Azure SQL
        if (connCreds.connectTimeout < Constants.azureSqlDbConnectionTimeout) {
            connCreds.connectTimeout = Constants.azureSqlDbConnectionTimeout;
        }
    }
    return connCreds;
}
function updateEncrypt(connection) {
    let updatePerformed = true;
    let resultConnection = Object.assign({}, connection);
    if (connection.encrypt === true) {
        resultConnection.encrypt = interfaces_1.EncryptOptions.Mandatory;
    }
    else if (connection.encrypt === false) {
        resultConnection.encrypt = interfaces_1.EncryptOptions.Optional;
    }
    else {
        updatePerformed = false;
    }
    return { connection: resultConnection, updateStatus: updatePerformed };
}
// return true if server name ends with '.database.windows.net'
function isAzureDatabase(server) {
    return server ? server.endsWith(Constants.sqlDbPrefix) : false;
}
/**
 * Gets a label describing a connection in the picklist UI
 *
 * @export connectionInfo/getPicklistLabel
 * @param connection connection to create a label for
 * @param itemType type of quickpick item to display - this influences the icon shown to the user
 * @returns user readable label
 */
function getSimpleConnectionDisplayName(connection) {
    let profile = connection;
    if (profile.profileName) {
        return profile.profileName;
    }
    else {
        return connection.server ? connection.server : connection.connectionString;
    }
}
/**
 * Gets a description for a connection to display in the picklist UI
 *
 * @export connectionInfo/getPicklistDescription
 * @param connCreds connection
 * @returns description
 */
function getPicklistDescription(connCreds) {
    let desc = `[${getConnectionDisplayString(connCreds)}]`;
    return desc;
}
/**
 * Gets detailed information about a connection, which can be displayed in the picklist UI
 *
 * @export connectionInfo/getPicklistDetails
 * @param connCreds connection
 * @returns details
 */
function getPicklistDetails(connCreds) {
    // In the current spec this is left empty intentionally. Leaving the method as this may change in the future
    return undefined;
}
/**
 * Gets a display string for a connection. This is a concise version of the connection
 * information that can be shown in a number of different UI locations
 *
 * @export connectionInfo/getConnectionDisplayString
 * @param conn connection
 * @returns display string that can be used in status view or other locations
 */
function getConnectionDisplayString(creds) {
    // Update the connection text
    let text = creds.server;
    if (creds.database !== "") {
        text = appendIfNotEmpty(text, creds.database);
    }
    else {
        text = appendIfNotEmpty(text, LocalizedConstants.defaultDatabaseLabel);
    }
    let user = getUserNameOrDomainLogin(creds);
    text = appendIfNotEmpty(text, user);
    // Limit the maximum length of displayed text
    if (text && text.length > Constants.maxDisplayedStatusTextLength) {
        text = text.substr(0, Constants.maxDisplayedStatusTextLength);
        text += " \u2026"; // Ellipsis character (...)
    }
    return text;
}
function appendIfNotEmpty(connectionText, value) {
    if (Utils.isNotEmpty(value)) {
        connectionText += ` : ${value}`;
    }
    return connectionText;
}
/**
 * Gets a formatted display version of a username, or the domain user if using Integrated authentication
 *
 * @export connectionInfo/getUserNameOrDomainLogin
 * @param conn connection
 * @param [defaultValue] optional default value to use if username is empty and this is not an Integrated auth profile
 * @returns
 */
function getUserNameOrDomainLogin(creds, defaultValue) {
    if (!defaultValue) {
        defaultValue = "";
    }
    if (creds.authenticationType ===
        Interfaces.AuthenticationTypes[Interfaces.AuthenticationTypes.Integrated]) {
        return process.platform === "win32"
            ? process.env.USERDOMAIN + "\\" + process.env.USERNAME
            : "";
    }
    else {
        return creds.user ? creds.user : defaultValue;
    }
}
/**
 * Gets a detailed tooltip with information about a connection
 *
 * @export connectionInfo/getTooltip
 * @param connCreds connection
 * @returns tooltip
 */
function getTooltip(connCreds, serverInfo) {
    let tooltip = connCreds.connectionString
        ? "Connection string: " + connCreds.connectionString + "\r\n"
        : "Server: " +
            connCreds.server +
            "\r\n" +
            "Database: " +
            (connCreds.database ? connCreds.database : "<connection default>") +
            "\r\n" +
            (connCreds.authenticationType !== Constants.integratedauth
                ? "User: " + connCreds.user + "\r\n"
                : "") +
            "Encryption Mode: " +
            getEncryptionMode(connCreds.encrypt) +
            "\r\n";
    if (serverInfo && serverInfo.serverVersion) {
        tooltip += "Server version: " + serverInfo.serverVersion + "\r\n";
    }
    return tooltip;
}
function getEncryptionMode(encryption) {
    let encryptionMode = interfaces_1.EncryptOptions.Mandatory;
    if (encryption !== undefined) {
        let encrypt = encryption.toString().toLowerCase();
        switch (encrypt) {
            case "true":
            case interfaces_1.EncryptOptions.Mandatory.toLowerCase():
                encryptionMode = interfaces_1.EncryptOptions.Mandatory;
                break;
            case "false":
            case interfaces_1.EncryptOptions.Optional.toLowerCase():
                encryptionMode = interfaces_1.EncryptOptions.Optional;
                break;
            case interfaces_1.EncryptOptions.Strict.toLowerCase():
                encryptionMode = interfaces_1.EncryptOptions.Strict;
                break;
            default:
                break;
        }
    }
    return encryptionMode;
}
function getConnectionDisplayName(credentials) {
    let database = credentials.database;
    const server = credentials.server;
    const authType = credentials.authenticationType;
    let userOrAuthType = authType;
    if (authType === Constants.sqlAuthentication) {
        userOrAuthType = credentials.user;
    }
    if (authType === Constants.azureMfa) {
        userOrAuthType = credentials.email;
    }
    if (!database || database === "") {
        database = LocalizedConstants.defaultDatabaseLabel;
    }
    return `${server}, ${database} (${userOrAuthType})`;
}

//# sourceMappingURL=connectionInfo.js.map
