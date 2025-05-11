"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeLanguageServiceForFile = changeLanguageServiceForFile;
const constants_1 = require("../constants/constants");
const languageService_1 = require("../models/contracts/languageService");
function changeLanguageServiceForFile(client, uri, flavor, statusView) {
    client.sendNotification(languageService_1.LanguageFlavorChangedNotification.type, {
        uri: uri,
        language: constants_1.languageId,
        flavor: flavor,
    });
    statusView.languageFlavorChanged(uri, flavor);
}

//# sourceMappingURL=utils.js.map
