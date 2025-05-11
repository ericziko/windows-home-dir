"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveResultsAsExcelRequest = exports.SaveResultsAsJsonRequest = exports.SaveResultsAsCsvRequest = exports.SaveResultRequestResult = exports.SaveResultsAsExcelRequestParams = exports.SaveResultsAsJsonRequestParams = exports.SaveResultsAsCsvRequestParams = exports.SaveResultsRequestParams = exports.DeleteCredentialRequest = exports.SaveCredentialRequest = exports.Credential = exports.ReadCredentialRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
// --------------------------------- < Read Credential Request > -------------------------------------------------
// Read Credential request message callback declaration
var ReadCredentialRequest;
(function (ReadCredentialRequest) {
    ReadCredentialRequest.type = new vscode_languageclient_1.RequestType("credential/read");
})(ReadCredentialRequest || (exports.ReadCredentialRequest = ReadCredentialRequest = {}));
/**
 * Parameters to initialize a connection to a database
 */
class Credential {
}
exports.Credential = Credential;
// --------------------------------- </ Read Credential Request > -------------------------------------------------
// --------------------------------- < Save Credential Request > -------------------------------------------------
// Save Credential request message callback declaration
var SaveCredentialRequest;
(function (SaveCredentialRequest) {
    SaveCredentialRequest.type = new vscode_languageclient_1.RequestType("credential/save");
})(SaveCredentialRequest || (exports.SaveCredentialRequest = SaveCredentialRequest = {}));
// --------------------------------- </ Save Credential Request > -------------------------------------------------
// --------------------------------- < Delete Credential Request > -------------------------------------------------
// Delete Credential request message callback declaration
var DeleteCredentialRequest;
(function (DeleteCredentialRequest) {
    DeleteCredentialRequest.type = new vscode_languageclient_1.RequestType("credential/delete");
})(DeleteCredentialRequest || (exports.DeleteCredentialRequest = DeleteCredentialRequest = {}));
// --------------------------------- </ Delete Credential Request > -------------------------------------------------
class SaveResultsRequestParams {
}
exports.SaveResultsRequestParams = SaveResultsRequestParams;
class SaveResultsAsCsvRequestParams extends SaveResultsRequestParams {
    constructor() {
        super(...arguments);
        this.includeHeaders = true;
        this.delimiter = ",";
        this.lineSeperator = undefined;
        this.textIdentifier = '"';
        this.encoding = "utf-8";
    }
}
exports.SaveResultsAsCsvRequestParams = SaveResultsAsCsvRequestParams;
class SaveResultsAsJsonRequestParams extends SaveResultsRequestParams {
}
exports.SaveResultsAsJsonRequestParams = SaveResultsAsJsonRequestParams;
class SaveResultsAsExcelRequestParams extends SaveResultsRequestParams {
    constructor() {
        super(...arguments);
        this.includeHeaders = true;
    }
}
exports.SaveResultsAsExcelRequestParams = SaveResultsAsExcelRequestParams;
class SaveResultRequestResult {
}
exports.SaveResultRequestResult = SaveResultRequestResult;
// --------------------------------- < Save Results as CSV Request > ------------------------------------------
// save results in csv format
var SaveResultsAsCsvRequest;
(function (SaveResultsAsCsvRequest) {
    SaveResultsAsCsvRequest.type = new vscode_languageclient_1.RequestType("query/saveCsv");
})(SaveResultsAsCsvRequest || (exports.SaveResultsAsCsvRequest = SaveResultsAsCsvRequest = {}));
// --------------------------------- </ Save Results as CSV Request > ------------------------------------------
// --------------------------------- < Save Results as JSON Request > ------------------------------------------
// save results in json format
var SaveResultsAsJsonRequest;
(function (SaveResultsAsJsonRequest) {
    SaveResultsAsJsonRequest.type = new vscode_languageclient_1.RequestType("query/saveJson");
})(SaveResultsAsJsonRequest || (exports.SaveResultsAsJsonRequest = SaveResultsAsJsonRequest = {}));
// --------------------------------- </ Save Results as JSON Request > ------------------------------------------
// --------------------------------- < Save Results as Excel Request > ------------------------------------------
// save results in Excel format
var SaveResultsAsExcelRequest;
(function (SaveResultsAsExcelRequest) {
    SaveResultsAsExcelRequest.type = new vscode_languageclient_1.RequestType("query/saveExcel");
})(SaveResultsAsExcelRequest || (exports.SaveResultsAsExcelRequest = SaveResultsAsExcelRequest = {}));
// --------------------------------- </ Save Results as Excel Request > ------------------------------------------

//# sourceMappingURL=contracts.js.map
