"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorThemeKind = exports.ApiStatus = void 0;
var ApiStatus;
(function (ApiStatus) {
    ApiStatus["NotStarted"] = "notStarted";
    ApiStatus["Loading"] = "loading";
    ApiStatus["Loaded"] = "loaded";
    ApiStatus["Error"] = "error";
})(ApiStatus || (exports.ApiStatus = ApiStatus = {}));
var ColorThemeKind;
(function (ColorThemeKind) {
    ColorThemeKind[ColorThemeKind["Light"] = 1] = "Light";
    ColorThemeKind[ColorThemeKind["Dark"] = 2] = "Dark";
    ColorThemeKind[ColorThemeKind["HighContrast"] = 3] = "HighContrast";
    ColorThemeKind[ColorThemeKind["HighContrastLight"] = 4] = "HighContrastLight";
})(ColorThemeKind || (exports.ColorThemeKind = ColorThemeKind = {}));

//# sourceMappingURL=webview.js.map
