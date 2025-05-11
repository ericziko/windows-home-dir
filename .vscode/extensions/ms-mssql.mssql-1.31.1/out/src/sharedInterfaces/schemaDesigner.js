"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaDesigner = void 0;
var SchemaDesigner;
(function (SchemaDesigner) {
    let OnAction;
    (function (OnAction) {
        OnAction[OnAction["CASCADE"] = 0] = "CASCADE";
        OnAction[OnAction["NO_ACTION"] = 1] = "NO_ACTION";
        OnAction[OnAction["SET_NULL"] = 2] = "SET_NULL";
        OnAction[OnAction["SET_DEFAULT"] = 3] = "SET_DEFAULT";
    })(OnAction = SchemaDesigner.OnAction || (SchemaDesigner.OnAction = {}));
    let SchemaDesignerReportTableState;
    (function (SchemaDesignerReportTableState) {
        SchemaDesignerReportTableState[SchemaDesignerReportTableState["Created"] = 0] = "Created";
        SchemaDesignerReportTableState[SchemaDesignerReportTableState["Updated"] = 1] = "Updated";
        SchemaDesignerReportTableState[SchemaDesignerReportTableState["Dropped"] = 2] = "Dropped";
    })(SchemaDesignerReportTableState = SchemaDesigner.SchemaDesignerReportTableState || (SchemaDesigner.SchemaDesignerReportTableState = {}));
})(SchemaDesigner || (exports.SchemaDesigner = SchemaDesigner = {}));

//# sourceMappingURL=schemaDesigner.js.map
