"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBCellValue = void 0;
exports.isHyperlinkCellValue = isHyperlinkCellValue;
exports.isCssIconCellValue = isCssIconCellValue;
exports.hyperLinkFormatter = hyperLinkFormatter;
exports.textFormatter = textFormatter;
exports.getCellDisplayValue = getCellDisplayValue;
exports.iconCssFormatter = iconCssFormatter;
exports.imageFormatter = imageFormatter;
exports.slickGridDataItemColumnValueExtractor = slickGridDataItemColumnValueExtractor;
exports.slickGridDataItemColumnValueWithNoData = slickGridDataItemColumnValueWithNoData;
exports.escape = escape;
var DBCellValue;
(function (DBCellValue) {
    function isDBCellValue(object) {
        return (object !== undefined && object.displayValue !== undefined && object.isNull !== undefined);
    }
    DBCellValue.isDBCellValue = isDBCellValue;
})(DBCellValue || (exports.DBCellValue = DBCellValue = {}));
/**
 * Checks whether the specified object is a HyperlinkCellValue object or not
 * @param obj The object to test
 */
function isHyperlinkCellValue(obj) {
    return !!(obj === null || obj === void 0 ? void 0 : obj.linkOrCommand);
}
function isCssIconCellValue(obj) {
    return !!(obj === null || obj === void 0 ? void 0 : obj.iconCssClass);
}
/**
 * Format xml field into a hyperlink and performs HTML entity encoding
 */
function hyperLinkFormatter(_row, _cell, value, _columnDef, _dataContext) {
    let cellClasses = "grid-cell-value-container";
    let valueToDisplay = "";
    let isHyperlink = false;
    if (DBCellValue.isDBCellValue(value)) {
        valueToDisplay = "NULL";
        if (!value.isNull) {
            valueToDisplay = getCellDisplayValue(value.displayValue);
            isHyperlink = true;
        }
        else {
            cellClasses += " missing-value";
        }
    }
    else if (isHyperlinkCellValue(value)) {
        valueToDisplay = getCellDisplayValue(value.displayText);
        isHyperlink = true;
    }
    if (isHyperlink) {
        return `<a class="${cellClasses}" title="${valueToDisplay}">${valueToDisplay}</a>`;
    }
    else {
        return `<span title="${valueToDisplay}" class="${cellClasses}">${valueToDisplay}</span>`;
    }
}
/**
 * Format all text to replace all new lines with spaces and performs HTML entity encoding
 */
function textFormatter(_row, _cell, value, _columnDef, _dataContext, addClasses) {
    let cellClasses = "grid-cell-value-container";
    let valueToDisplay = "";
    let titleValue = "";
    let cellStyle = "";
    if (DBCellValue.isDBCellValue(value)) {
        valueToDisplay = "NULL";
        if (!value.isNull) {
            valueToDisplay = getCellDisplayValue(value.displayValue);
            titleValue = valueToDisplay;
        }
        else {
            cellClasses += " missing-value";
        }
    }
    else if (typeof value === "string" || (value && value.text)) {
        if (value.text) {
            valueToDisplay = value.text;
            if (value.style) {
                cellStyle = value.style;
            }
        }
        else {
            valueToDisplay = value;
        }
        valueToDisplay = getCellDisplayValue(valueToDisplay);
        titleValue = valueToDisplay;
    }
    else if (value && value.title) {
        if (value.title) {
            valueToDisplay = value.title;
            if (value.style) {
                cellStyle = value.style;
            }
        }
        valueToDisplay = getCellDisplayValue(valueToDisplay);
        titleValue = valueToDisplay;
    }
    const formattedValue = `<span title="${titleValue}" style="${cellStyle}" class="${cellClasses}">${valueToDisplay}</span>`;
    if (addClasses) {
        return { text: formattedValue, addClasses: addClasses };
    }
    return formattedValue;
}
function getCellDisplayValue(cellValue) {
    let valueToDisplay = cellValue.length > 250 ? cellValue.slice(0, 250) + "..." : cellValue;
    // allow-any-unicode-next-line
    valueToDisplay = valueToDisplay.replace(/(\r\n|\n|\r)/g, "↵");
    return escape(valueToDisplay);
}
function iconCssFormatter(row, cell, value, columnDef, dataContext) {
    var _a, _b;
    if (isCssIconCellValue(value)) {
        return `<div role="image" title="${escape((_a = value.title) !== null && _a !== void 0 ? _a : "")}" aria-label="${escape((_b = value.title) !== null && _b !== void 0 ? _b : "")}" class="grid-cell-value-container icon codicon slick-icon-cell-content ${value.iconCssClass}"></div>`;
    }
    return textFormatter(row, cell, value, columnDef, dataContext);
}
function imageFormatter(_row, _cell, value, _columnDef, _dataContext) {
    return `<img src="${value.text}" />`;
}
/**
 * Extracts the specified field into the expected object to be handled by SlickGrid and/or formatters as needed.
 */
function slickGridDataItemColumnValueExtractor(value, columnDef) {
    let fieldValue = value[columnDef.field];
    if (columnDef.type === "hyperlink") {
        return {
            displayText: fieldValue.displayText,
            linkOrCommand: fieldValue.linkOrCommand,
        };
    }
    else {
        return {
            text: fieldValue,
            ariaLabel: fieldValue ? escape(fieldValue) : fieldValue,
        };
    }
}
/**
 * Alternate function to provide slick grid cell with ariaLabel and plain text
 * In this case, for no display value ariaLabel will be set to specific string "no data available" for accessibily support for screen readers
 * Set 'no data' label only if cell is present and has no value (so that checkbox and other custom plugins do not get 'no data' label)
 */
function slickGridDataItemColumnValueWithNoData(value, columnDef) {
    let displayValue = value[columnDef.field];
    if (typeof displayValue === "number") {
        displayValue = displayValue.toString();
    }
    if (displayValue instanceof Array) {
        displayValue = displayValue.toString();
    }
    if (isCssIconCellValue(displayValue)) {
        return displayValue;
    }
    return {
        text: displayValue,
        ariaLabel: displayValue
            ? escape(displayValue)
            : displayValue !== undefined
                ? "TODO loc No Value"
                : displayValue,
    };
}
/**
 * Converts HTML characters inside the string to use entities instead. Makes the string safe from
 * being used e.g. in HTMLElement.innerHTML.
 */
function escape(html) {
    return html.replace(/[<|>|&|"|\']/g, function (match) {
        switch (match) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case '"':
                return "&quot;";
            case "'":
                return "&#39;";
            default:
                return match;
        }
    });
}
/** The following code is a rewrite over the both formatter function using dom builder
 * rather than string manipulation, which is a safer and easier method of achieving the same goal.
 * However, when electron is in "Run as node" mode, dom creation acts differently than normal and therefore
 * the tests to test for html escaping fail. I'm keeping this code around as we should migrate to it if we ever
 * integrate into actual DOM testing (electron running in normal mode) later on.

export const hyperLinkFormatter: Slick.Formatter<any> = (row, cell, value, columnDef, dataContext): string => {
    let classes: Array<string> = ['grid-cell-value-container'];
    let displayValue = '';

    if (DBCellValue.isDBCellValue(value)) {
        if (!value.isNull) {
            displayValue = value.displayValue;
            classes.push('queryLink');
            let linkContainer = $('a', {
                class: classes.join(' '),
                title: displayValue
            });
            linkContainer.innerText = displayValue;
            return linkContainer.outerHTML;
        } else {
            classes.push('missing-value');
        }
    }

    let cellContainer = $('span', { class: classes.join(' '), title: displayValue });
    cellContainer.innerText = displayValue;
    return cellContainer.outerHTML;
};

export const textFormatter: Slick.Formatter<any> = (row, cell, value, columnDef, dataContext): string => {
    let displayValue = '';
    let classes: Array<string> = ['grid-cell-value-container'];

    if (DBCellValue.isDBCellValue(value)) {
        if (!value.isNull) {
            displayValue = value.displayValue.replace(/(\r\n|\n|\r)/g, ' ');
        } else {
            classes.push('missing-value');
            displayValue = 'NULL';
        }
    }

    let cellContainer = $('span', { class: classes.join(' '), title: displayValue });
    cellContainer.innerText = displayValue;

    return cellContainer.outerHTML;
};

*/

//# sourceMappingURL=formatters.js.map
