"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputType = exports.DesignerResultPaneTabs = exports.DesignerMainPaneTabs = exports.LoadState = exports.InputBoxType = exports.DesignerEditType = exports.TableIndexColumnSpecificationProperty = exports.TableIndexProperty = exports.TableCheckConstraintProperty = exports.ForeignKeyColumnMappingProperty = exports.TableForeignKeyProperty = exports.TableColumnProperty = exports.TableProperty = exports.TableIcon = void 0;
/**
 * Table icon that's shown on the editor tab
 */
var TableIcon;
(function (TableIcon) {
    TableIcon["Basic"] = "Basic";
    TableIcon["Temporal"] = "Temporal";
    TableIcon["GraphNode"] = "GraphNode";
    TableIcon["GraphEdge"] = "GraphEdge";
})(TableIcon || (exports.TableIcon = TableIcon = {}));
/**
 * Name of the common table properties.
 * Extensions can use the names to access the designer view model.
 */
var TableProperty;
(function (TableProperty) {
    TableProperty["Columns"] = "columns";
    TableProperty["Description"] = "description";
    TableProperty["Name"] = "name";
    TableProperty["Schema"] = "schema";
    TableProperty["Script"] = "script";
    TableProperty["ForeignKeys"] = "foreignKeys";
    TableProperty["CheckConstraints"] = "checkConstraints";
    TableProperty["Indexes"] = "indexes";
    TableProperty["PrimaryKey"] = "primaryKey";
    TableProperty["PrimaryKeyName"] = "primaryKeyName";
    TableProperty["PrimaryKeyDescription"] = "primaryKeyDescription";
    TableProperty["PrimaryKeyColumns"] = "primaryKeyColumns";
})(TableProperty || (exports.TableProperty = TableProperty = {}));
/**
 * Name of the common table column properties.
 * Extensions can use the names to access the designer view model.
 */
var TableColumnProperty;
(function (TableColumnProperty) {
    TableColumnProperty["AllowNulls"] = "allowNulls";
    TableColumnProperty["DefaultValue"] = "defaultValue";
    TableColumnProperty["Length"] = "length";
    TableColumnProperty["Name"] = "name";
    TableColumnProperty["Description"] = "description";
    TableColumnProperty["Type"] = "type";
    TableColumnProperty["AdvancedType"] = "advancedType";
    TableColumnProperty["IsPrimaryKey"] = "isPrimaryKey";
    TableColumnProperty["Precision"] = "precision";
    TableColumnProperty["Scale"] = "scale";
    TableColumnProperty["IsIdentity"] = "isIdentity";
})(TableColumnProperty || (exports.TableColumnProperty = TableColumnProperty = {}));
/**
 * Name of the common foreign key constraint properties.
 * Extensions can use the names to access the designer view model.
 */
var TableForeignKeyProperty;
(function (TableForeignKeyProperty) {
    TableForeignKeyProperty["Name"] = "name";
    TableForeignKeyProperty["Description"] = "description";
    TableForeignKeyProperty["ForeignTable"] = "foreignTable";
    TableForeignKeyProperty["OnDeleteAction"] = "onDeleteAction";
    TableForeignKeyProperty["OnUpdateAction"] = "onUpdateAction";
    TableForeignKeyProperty["Columns"] = "columns";
})(TableForeignKeyProperty || (exports.TableForeignKeyProperty = TableForeignKeyProperty = {}));
/**
 * Name of the columns mapping properties for foreign key.
 */
var ForeignKeyColumnMappingProperty;
(function (ForeignKeyColumnMappingProperty) {
    ForeignKeyColumnMappingProperty["Column"] = "column";
    ForeignKeyColumnMappingProperty["ForeignColumn"] = "foreignColumn";
})(ForeignKeyColumnMappingProperty || (exports.ForeignKeyColumnMappingProperty = ForeignKeyColumnMappingProperty = {}));
/**
 * Name of the common check constraint properties.
 * Extensions can use the name to access the designer view model.
 */
var TableCheckConstraintProperty;
(function (TableCheckConstraintProperty) {
    TableCheckConstraintProperty["Name"] = "name";
    TableCheckConstraintProperty["Description"] = "description";
    TableCheckConstraintProperty["Expression"] = "expression";
})(TableCheckConstraintProperty || (exports.TableCheckConstraintProperty = TableCheckConstraintProperty = {}));
/**
 * Name of the common index properties.
 * Extensions can use the name to access the designer view model.
 */
var TableIndexProperty;
(function (TableIndexProperty) {
    TableIndexProperty["Name"] = "name";
    TableIndexProperty["Description"] = "description";
    TableIndexProperty["Columns"] = "columns";
    TableIndexProperty["IncludedColumns"] = "includedColumns";
    TableIndexProperty["ColumnStoreIndex"] = "columnStoreIndexes";
})(TableIndexProperty || (exports.TableIndexProperty = TableIndexProperty = {}));
/**
 * Name of the common properties of table index column specification.
 */
var TableIndexColumnSpecificationProperty;
(function (TableIndexColumnSpecificationProperty) {
    TableIndexColumnSpecificationProperty["Column"] = "column";
})(TableIndexColumnSpecificationProperty || (exports.TableIndexColumnSpecificationProperty = TableIndexColumnSpecificationProperty = {}));
/**
 * Type of the edit originated from the designer UI.
 */
var DesignerEditType;
(function (DesignerEditType) {
    /**
     * Add a row to a table.
     */
    DesignerEditType[DesignerEditType["Add"] = 0] = "Add";
    /**
     * Remove a row from a table.
     */
    DesignerEditType[DesignerEditType["Remove"] = 1] = "Remove";
    /**
     * Update a property.
     */
    DesignerEditType[DesignerEditType["Update"] = 2] = "Update";
    /**
     * Change the position of an item in the collection.
     */
    DesignerEditType[DesignerEditType["Move"] = 3] = "Move";
})(DesignerEditType || (exports.DesignerEditType = DesignerEditType = {}));
var InputBoxType;
(function (InputBoxType) {
    InputBoxType[InputBoxType["TEXT"] = 0] = "TEXT";
    InputBoxType[InputBoxType["NUMBER"] = 1] = "NUMBER";
})(InputBoxType || (exports.InputBoxType = InputBoxType = {}));
var LoadState;
(function (LoadState) {
    LoadState["NotStarted"] = "NotStarted";
    LoadState["Loading"] = "Loading";
    LoadState["Loaded"] = "Loaded";
    LoadState["Error"] = "Error";
})(LoadState || (exports.LoadState = LoadState = {}));
var DesignerMainPaneTabs;
(function (DesignerMainPaneTabs) {
    DesignerMainPaneTabs["AboutTable"] = "general";
    DesignerMainPaneTabs["Columns"] = "columns";
    DesignerMainPaneTabs["PrimaryKey"] = "primaryKey";
    DesignerMainPaneTabs["ForeignKeys"] = "foreignKeys";
    DesignerMainPaneTabs["Indexes"] = "indexes";
    DesignerMainPaneTabs["CheckConstraints"] = "checkConstraints";
})(DesignerMainPaneTabs || (exports.DesignerMainPaneTabs = DesignerMainPaneTabs = {}));
var DesignerResultPaneTabs;
(function (DesignerResultPaneTabs) {
    DesignerResultPaneTabs["Script"] = "script";
    DesignerResultPaneTabs["Issues"] = "issues";
})(DesignerResultPaneTabs || (exports.DesignerResultPaneTabs = DesignerResultPaneTabs = {}));
var InputType;
(function (InputType) {
    InputType["Text"] = "text";
    InputType["Number"] = "number";
})(InputType || (exports.InputType = InputType = {}));

//# sourceMappingURL=tableDesigner.js.map
