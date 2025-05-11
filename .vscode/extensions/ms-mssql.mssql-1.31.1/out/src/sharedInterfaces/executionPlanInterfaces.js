"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortOption = exports.ExpensiveMetricType = exports.SearchType = exports.ExecutionPlanGraphElementPropertyBetterValue = exports.ExecutionPlanGraphElementPropertyDataType = exports.BadgeType = void 0;
var BadgeType;
(function (BadgeType) {
    BadgeType[BadgeType["Warning"] = 0] = "Warning";
    BadgeType[BadgeType["CriticalWarning"] = 1] = "CriticalWarning";
    BadgeType[BadgeType["Parallelism"] = 2] = "Parallelism";
})(BadgeType || (exports.BadgeType = BadgeType = {}));
var ExecutionPlanGraphElementPropertyDataType;
(function (ExecutionPlanGraphElementPropertyDataType) {
    ExecutionPlanGraphElementPropertyDataType[ExecutionPlanGraphElementPropertyDataType["Number"] = 0] = "Number";
    ExecutionPlanGraphElementPropertyDataType[ExecutionPlanGraphElementPropertyDataType["String"] = 1] = "String";
    ExecutionPlanGraphElementPropertyDataType[ExecutionPlanGraphElementPropertyDataType["Boolean"] = 2] = "Boolean";
    ExecutionPlanGraphElementPropertyDataType[ExecutionPlanGraphElementPropertyDataType["Nested"] = 3] = "Nested";
})(ExecutionPlanGraphElementPropertyDataType || (exports.ExecutionPlanGraphElementPropertyDataType = ExecutionPlanGraphElementPropertyDataType = {}));
var ExecutionPlanGraphElementPropertyBetterValue;
(function (ExecutionPlanGraphElementPropertyBetterValue) {
    ExecutionPlanGraphElementPropertyBetterValue[ExecutionPlanGraphElementPropertyBetterValue["LowerNumber"] = 0] = "LowerNumber";
    ExecutionPlanGraphElementPropertyBetterValue[ExecutionPlanGraphElementPropertyBetterValue["HigherNumber"] = 1] = "HigherNumber";
    ExecutionPlanGraphElementPropertyBetterValue[ExecutionPlanGraphElementPropertyBetterValue["True"] = 2] = "True";
    ExecutionPlanGraphElementPropertyBetterValue[ExecutionPlanGraphElementPropertyBetterValue["False"] = 3] = "False";
    ExecutionPlanGraphElementPropertyBetterValue[ExecutionPlanGraphElementPropertyBetterValue["None"] = 4] = "None";
})(ExecutionPlanGraphElementPropertyBetterValue || (exports.ExecutionPlanGraphElementPropertyBetterValue = ExecutionPlanGraphElementPropertyBetterValue = {}));
var SearchType;
(function (SearchType) {
    SearchType[SearchType["Equals"] = 0] = "Equals";
    SearchType[SearchType["Contains"] = 1] = "Contains";
    SearchType[SearchType["LesserThan"] = 2] = "LesserThan";
    SearchType[SearchType["GreaterThan"] = 3] = "GreaterThan";
    SearchType[SearchType["GreaterThanEqualTo"] = 4] = "GreaterThanEqualTo";
    SearchType[SearchType["LesserThanEqualTo"] = 5] = "LesserThanEqualTo";
    SearchType[SearchType["LesserAndGreaterThan"] = 6] = "LesserAndGreaterThan";
})(SearchType || (exports.SearchType = SearchType = {}));
var ExpensiveMetricType;
(function (ExpensiveMetricType) {
    ExpensiveMetricType["Off"] = "off";
    ExpensiveMetricType["ActualElapsedTime"] = "actualElapsedTime";
    ExpensiveMetricType["ActualElapsedCpuTime"] = "actualElapsedCpuTime";
    ExpensiveMetricType["Cost"] = "cost";
    ExpensiveMetricType["SubtreeCost"] = "subtreeCost";
    ExpensiveMetricType["ActualNumberOfRowsForAllExecutions"] = "actualNumberOfRowsForAllExecutions";
    ExpensiveMetricType["NumberOfRowsRead"] = "numberOfRowsRead";
})(ExpensiveMetricType || (exports.ExpensiveMetricType = ExpensiveMetricType = {}));
var SortOption;
(function (SortOption) {
    SortOption[SortOption["Alphabetical"] = 0] = "Alphabetical";
    SortOption[SortOption["ReverseAlphabetical"] = 1] = "ReverseAlphabetical";
    SortOption[SortOption["Importance"] = 2] = "Importance";
})(SortOption || (exports.SortOption = SortOption = {}));

//# sourceMappingURL=executionPlanInterfaces.js.map
