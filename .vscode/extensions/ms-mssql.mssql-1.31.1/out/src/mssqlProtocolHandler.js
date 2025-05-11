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
exports.MssqlProtocolHandler = void 0;
const Utils = require("./models/utils");
const connection_1 = require("./models/contracts/connection");
var Command;
(function (Command) {
    Command["connect"] = "/connect";
    Command["openConnectionDialog"] = "/openConnectionDialog";
})(Command || (Command = {}));
/**
 * Handles MSSQL protocol URIs.
 */
class MssqlProtocolHandler {
    constructor(client) {
        this.client = client;
    }
    /**
     * Handles the given URI and returns connection information if applicable. Examples of URIs handled:
     * - vscode://ms-mssql.mssql/connect?server=myServer&database=dbName&user=sa&authenticationType=SqlLogin
     * - vscode://ms-mssql.mssql/connect?connectionString=Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;
     *
     * @param uri - The URI to handle.
     * @returns The connection information or undefined if not applicable.
     */
    handleUri(uri) {
        Utils.logDebug(`[MssqlProtocolHandler][handleUri] URI: ${uri.toString()}`);
        switch (uri.path) {
            case Command.connect:
                Utils.logDebug(`[MssqlProtocolHandler][handleUri] connect: ${uri.path}`);
                return this.connect(uri);
            case Command.openConnectionDialog:
                return undefined;
            default:
                Utils.logDebug(`[MssqlProtocolHandler][handleUri] Unknown URI path, defaulting to connect: ${uri.path}`);
                return this.connect(uri);
        }
    }
    /**
     * Connects using the given URI.
     *
     * @param uri - The URI containing connection information.
     * @returns The connection information or undefined if not applicable.
     */
    connect(uri) {
        return this.readProfileFromArgs(uri.query);
    }
    /**
     * Reads the profile information from the query string and returns an IConnectionInfo object.
     *
     * @param query - The query string containing connection information.
     * @returns The connection information object or undefined if the query is empty.
     */
    readProfileFromArgs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query) {
                return undefined;
            }
            const capabilitiesResult = yield this.client.sendRequest(connection_1.GetCapabilitiesRequest.type, {});
            const connectionOptions = capabilitiesResult.capabilities.connectionProvider.options;
            const connectionInfo = {};
            const args = new URLSearchParams(query);
            const profileName = args.get("profileName");
            if (profileName) {
                connectionInfo["profileName"] = profileName;
            }
            const connectionString = args.get("connectionString");
            if (connectionString) {
                connectionInfo["connectionString"] = connectionString;
                return connectionInfo;
            }
            const connectionOptionProperties = connectionOptions.map((option) => ({
                name: option.name,
                type: option.valueType,
            }));
            for (const property of connectionOptionProperties) {
                const propName = property.name;
                const propValue = args.get(propName);
                if (propValue === undefined || propValue === null) {
                    continue;
                }
                switch (property.type) {
                    case "string":
                    case "category":
                        connectionInfo[propName] = propValue;
                        break;
                    case "number":
                        const numericalValue = parseInt(propValue);
                        if (!isNaN(numericalValue)) {
                            connectionInfo[propName] = numericalValue;
                        }
                        break;
                    case "boolean":
                        connectionInfo[propName] = propValue === "true" || propValue === "1";
                        break;
                    default:
                        break;
                }
            }
            return connectionInfo;
        });
    }
}
exports.MssqlProtocolHandler = MssqlProtocolHandler;

//# sourceMappingURL=mssqlProtocolHandler.js.map
