"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFilterOperator = exports.NodeFilterPropertyDataType = void 0;
var NodeFilterPropertyDataType;
(function (NodeFilterPropertyDataType) {
    NodeFilterPropertyDataType[NodeFilterPropertyDataType["String"] = 0] = "String";
    NodeFilterPropertyDataType[NodeFilterPropertyDataType["Number"] = 1] = "Number";
    NodeFilterPropertyDataType[NodeFilterPropertyDataType["Boolean"] = 2] = "Boolean";
    NodeFilterPropertyDataType[NodeFilterPropertyDataType["Date"] = 3] = "Date";
    NodeFilterPropertyDataType[NodeFilterPropertyDataType["Choice"] = 4] = "Choice";
})(NodeFilterPropertyDataType || (exports.NodeFilterPropertyDataType = NodeFilterPropertyDataType = {}));
var NodeFilterOperator;
(function (NodeFilterOperator) {
    NodeFilterOperator[NodeFilterOperator["Equals"] = 0] = "Equals";
    NodeFilterOperator[NodeFilterOperator["NotEquals"] = 1] = "NotEquals";
    NodeFilterOperator[NodeFilterOperator["LessThan"] = 2] = "LessThan";
    NodeFilterOperator[NodeFilterOperator["LessThanOrEquals"] = 3] = "LessThanOrEquals";
    NodeFilterOperator[NodeFilterOperator["GreaterThan"] = 4] = "GreaterThan";
    NodeFilterOperator[NodeFilterOperator["GreaterThanOrEquals"] = 5] = "GreaterThanOrEquals";
    NodeFilterOperator[NodeFilterOperator["Between"] = 6] = "Between";
    NodeFilterOperator[NodeFilterOperator["NotBetween"] = 7] = "NotBetween";
    NodeFilterOperator[NodeFilterOperator["Contains"] = 8] = "Contains";
    NodeFilterOperator[NodeFilterOperator["NotContains"] = 9] = "NotContains";
    NodeFilterOperator[NodeFilterOperator["StartsWith"] = 10] = "StartsWith";
    NodeFilterOperator[NodeFilterOperator["NotStartsWith"] = 11] = "NotStartsWith";
    NodeFilterOperator[NodeFilterOperator["EndsWith"] = 12] = "EndsWith";
    NodeFilterOperator[NodeFilterOperator["NotEndsWith"] = 13] = "NotEndsWith";
})(NodeFilterOperator || (exports.NodeFilterOperator = NodeFilterOperator = {}));

//# sourceMappingURL=objectExplorerFilter.js.map
