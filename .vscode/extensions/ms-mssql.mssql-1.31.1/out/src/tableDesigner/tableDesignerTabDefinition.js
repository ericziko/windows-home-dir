"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvancedOptionsComponents = getAdvancedOptionsComponents;
exports.getColumnsTabComponents = getColumnsTabComponents;
exports.getPrimaryKeyTabComponents = getPrimaryKeyTabComponents;
exports.getIndexesTabComponents = getIndexesTabComponents;
exports.getForeignKeysTabComponents = getForeignKeysTabComponents;
exports.getCheckConstraintsTabComponents = getCheckConstraintsTabComponents;
exports.getDesignerView = getDesignerView;
const locConstants_1 = require("../constants/locConstants");
const designer = require("../sharedInterfaces/tableDesigner");
const vscode = require("vscode");
function getAdvancedOptionsComponents(viewDefinition) {
    if (!viewDefinition) {
        return [];
    }
    const tabComponents = [
        {
            componentType: "textarea",
            propertyName: designer.TableProperty.Description,
            description: vscode.l10n.t("Description for the table."),
            componentProperties: {
                title: vscode.l10n.t("Description"),
                width: 350,
            },
        },
    ];
    if (viewDefinition === null || viewDefinition === void 0 ? void 0 : viewDefinition.additionalTableProperties) {
        tabComponents.push(...viewDefinition.additionalTableProperties);
    }
    return tabComponents;
}
function getColumnsTabComponents(view) {
    var _a;
    if (!view || !(view === null || view === void 0 ? void 0 : view.columnTableOptions)) {
        return [];
    }
    const columnTableOptions = view.columnTableOptions;
    const columnTableColumnDefinitions = [
        {
            componentType: "input",
            propertyName: designer.TableColumnProperty.Name,
            description: vscode.l10n.t("The name of the column object."),
            componentProperties: {
                title: vscode.l10n.t("Name"),
                width: 150,
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableColumnProperty.Description,
            description: vscode.l10n.t("Displays the description of the column"),
            componentProperties: {
                title: vscode.l10n.t("Description"),
                width: 400,
            },
        },
        {
            componentType: "dropdown",
            propertyName: designer.TableColumnProperty.AdvancedType,
            description: vscode.l10n.t("Displays the unified data type (including length, scale and precision) for the column"),
            componentProperties: {
                title: vscode.l10n.t("Data Type"),
                width: 120,
                isEditable: true,
            },
        },
        {
            componentType: "dropdown",
            propertyName: designer.TableColumnProperty.Type,
            showInPropertiesView: false,
            description: vscode.l10n.t("Displays the data type name for the column"),
            componentProperties: {
                title: vscode.l10n.t("Type"),
                width: 100,
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableColumnProperty.Length,
            description: vscode.l10n.t("The maximum length (in characters) that can be stored in this database object."),
            componentProperties: {
                title: vscode.l10n.t("Length"),
                width: 60,
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableColumnProperty.DefaultValue,
            description: vscode.l10n.t("A predefined global default value for the column or binding."),
            componentProperties: {
                title: vscode.l10n.t("Default Value"),
                width: 150,
            },
        },
        {
            componentType: "checkbox",
            propertyName: designer.TableColumnProperty.AllowNulls,
            description: vscode.l10n.t("Specifies whether the column may have a NULL value."),
            componentProperties: {
                title: vscode.l10n.t("Allow Nulls"),
            },
        },
        {
            componentType: "checkbox",
            propertyName: designer.TableColumnProperty.IsPrimaryKey,
            description: vscode.l10n.t("Specifies whether the column is included in the primary key for the table."),
            componentProperties: {
                title: vscode.l10n.t("Primary Key"),
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableColumnProperty.Precision,
            description: vscode.l10n.t("For numeric data, the maximum number of decimal digits that can be stored in this database object."),
            componentProperties: {
                title: vscode.l10n.t("Precision"),
                width: 60,
                inputType: designer.InputType.Number,
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableColumnProperty.Scale,
            description: vscode.l10n.t("For numeric data, the maximum number of decimal digits that can be stored in this database object to the right of decimal point."),
            componentProperties: {
                title: vscode.l10n.t("Scale"),
                width: 60,
                inputType: designer.InputType.Number,
            },
        },
    ];
    const displayProperties = getTableDisplayProperties(columnTableOptions, [
        designer.TableColumnProperty.Name,
        designer.TableColumnProperty.Type,
        designer.TableColumnProperty.IsPrimaryKey,
        designer.TableColumnProperty.IsIdentity,
        designer.TableColumnProperty.AllowNulls,
        designer.TableColumnProperty.DefaultValue,
    ]);
    const tabComponents = [
        {
            componentType: "table",
            propertyName: designer.TableProperty.Columns,
            showInPropertiesView: false,
            componentProperties: {
                ariaLabel: vscode.l10n.t("Columns"),
                columns: displayProperties,
                itemProperties: addAdditionalTableProperties(columnTableOptions, columnTableColumnDefinitions),
                objectTypeDisplayName: vscode.l10n.t("Column"),
                canAddRows: columnTableOptions.canAddRows,
                canInsertRows: columnTableOptions.canInsertRows,
                canMoveRows: columnTableOptions.canMoveRows,
                canRemoveRows: columnTableOptions.canRemoveRows,
                removeRowConfirmationMessage: columnTableOptions.removeRowConfirmationMessage,
                showRemoveRowConfirmation: columnTableOptions.showRemoveRowConfirmation,
                labelForAddNewButton: (_a = columnTableOptions.labelForAddNewButton) !== null && _a !== void 0 ? _a : vscode.l10n.t("New Column"),
                expandedGroups: [locConstants_1.TableDesigner.General],
            },
        },
    ];
    const additionalComponents = getAdditionalComponentsForTab(designer.TableProperty.Columns, view.additionalComponents);
    if (additionalComponents) {
        tabComponents.push(...additionalComponents);
    }
    return tabComponents;
}
function getPrimaryKeyTabComponents(view) {
    var _a;
    if (!view || !view.primaryKeyColumnSpecificationTableOptions) {
        return [];
    }
    const columnSpecProperties = [
        {
            componentType: "dropdown",
            propertyName: designer.TableIndexColumnSpecificationProperty.Column,
            description: vscode.l10n.t("The name of the column."),
            componentProperties: {
                title: vscode.l10n.t("Column"),
                width: 150,
            },
        },
    ];
    const tabComponents = [
        {
            componentType: "input",
            propertyName: designer.TableProperty.PrimaryKeyName,
            showInPropertiesView: false,
            description: vscode.l10n.t("Name of the primary key."),
            componentProperties: {
                title: vscode.l10n.t("Name"),
                width: 250,
            },
        },
        {
            componentType: "textarea",
            propertyName: designer.TableProperty.PrimaryKeyDescription,
            showInPropertiesView: false,
            description: vscode.l10n.t("The description of the primary key."),
            componentProperties: {
                title: vscode.l10n.t("Description"),
                width: 250,
            },
        },
    ];
    if (view.additionalPrimaryKeyProperties) {
        view.additionalPrimaryKeyProperties.forEach((component) => {
            const copy = Object.assign({}, component);
            copy.showInPropertiesView = false;
            tabComponents.push(copy);
        });
    }
    const primaryKeyTableOptions = view.primaryKeyColumnSpecificationTableOptions;
    if (primaryKeyTableOptions) {
        tabComponents.push({
            componentType: "table",
            propertyName: designer.TableProperty.PrimaryKeyColumns,
            showInPropertiesView: false,
            description: vscode.l10n.t("Columns in the primary key."),
            componentProperties: {
                title: vscode.l10n.t("Primary Key Columns"),
                ariaLabel: vscode.l10n.t("Primary Key Columns"),
                columns: getTableDisplayProperties(primaryKeyTableOptions, [
                    designer.TableIndexColumnSpecificationProperty.Column,
                ]),
                itemProperties: addAdditionalTableProperties(primaryKeyTableOptions, columnSpecProperties),
                objectTypeDisplayName: "",
                canAddRows: primaryKeyTableOptions.canAddRows,
                canRemoveRows: primaryKeyTableOptions.canRemoveRows,
                removeRowConfirmationMessage: primaryKeyTableOptions.removeRowConfirmationMessage,
                showRemoveRowConfirmation: primaryKeyTableOptions.showRemoveRowConfirmation,
                showItemDetailInPropertiesView: false,
                labelForAddNewButton: (_a = primaryKeyTableOptions.labelForAddNewButton) !== null && _a !== void 0 ? _a : vscode.l10n.t("Add Column"),
                canMoveRows: primaryKeyTableOptions.canMoveRows,
            },
        });
    }
    const additionalComponents = getAdditionalComponentsForTab(designer.TableProperty.PrimaryKey, view.additionalComponents);
    if (additionalComponents) {
        tabComponents.push(...additionalComponents);
    }
    return tabComponents;
}
function getIndexesTabComponents(view) {
    var _a, _b, _c;
    if (!view || !view.indexTableOptions) {
        return [];
    }
    const indexTableOptions = view.indexTableOptions;
    const columnSpecTableOptions = view.indexColumnSpecificationTableOptions;
    const columnSpecProperties = [
        {
            componentType: "dropdown",
            propertyName: designer.TableIndexColumnSpecificationProperty.Column,
            description: vscode.l10n.t("The name of the column."),
            componentProperties: {
                title: vscode.l10n.t("Column"),
                width: 100,
            },
        },
    ];
    const indexProperties = [
        {
            componentType: "input",
            propertyName: designer.TableIndexProperty.Name,
            description: vscode.l10n.t("The name of the index."),
            group: locConstants_1.TableDesigner.AdvancedOptions,
            componentProperties: {
                title: vscode.l10n.t("Name"),
                width: 200,
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableIndexProperty.Description,
            description: vscode.l10n.t("The description of the index."),
            group: locConstants_1.TableDesigner.AdvancedOptions,
            componentProperties: {
                title: vscode.l10n.t("Description"),
                width: 200,
            },
        },
    ];
    if (columnSpecTableOptions) {
        indexProperties.push({
            componentType: "table",
            propertyName: designer.TableIndexProperty.Columns,
            description: vscode.l10n.t("The columns of the index."),
            group: locConstants_1.TableDesigner.Columns,
            componentProperties: {
                ariaLabel: vscode.l10n.t("Columns"),
                columns: getTableDisplayProperties(columnSpecTableOptions, [
                    designer.TableIndexColumnSpecificationProperty.Column,
                ]),
                itemProperties: addAdditionalTableProperties(columnSpecTableOptions, columnSpecProperties),
                objectTypeDisplayName: "",
                canAddRows: columnSpecTableOptions.canAddRows,
                canRemoveRows: columnSpecTableOptions.canRemoveRows,
                removeRowConfirmationMessage: columnSpecTableOptions.removeRowConfirmationMessage,
                showRemoveRowConfirmation: columnSpecTableOptions.showRemoveRowConfirmation,
                labelForAddNewButton: (_a = columnSpecTableOptions.labelForAddNewButton) !== null && _a !== void 0 ? _a : vscode.l10n.t("Add Column"),
            },
        });
    }
    const tabComponents = [];
    if (indexTableOptions) {
        const includedColumnsGroupName = (_b = indexTableOptions.additionalProperties.find((c) => c.propertyName === designer.TableIndexProperty.IncludedColumns)) === null || _b === void 0 ? void 0 : _b.group;
        // Making all other properties as advanced options
        indexTableOptions.additionalProperties.forEach((property) => {
            if (!property.group) {
                property.group = locConstants_1.TableDesigner.AdvancedOptions;
            }
        });
        tabComponents.push({
            componentType: "table",
            propertyName: designer.TableProperty.Indexes,
            showInPropertiesView: false,
            componentProperties: {
                ariaLabel: vscode.l10n.t("Indexes"),
                columns: getTableDisplayProperties(indexTableOptions, [
                    designer.TableIndexProperty.Name,
                ]),
                itemProperties: addAdditionalTableProperties(indexTableOptions, indexProperties),
                objectTypeDisplayName: vscode.l10n.t("Index"),
                canAddRows: indexTableOptions.canAddRows,
                canRemoveRows: indexTableOptions.canRemoveRows,
                removeRowConfirmationMessage: indexTableOptions.removeRowConfirmationMessage,
                showRemoveRowConfirmation: indexTableOptions.showRemoveRowConfirmation,
                labelForAddNewButton: (_c = indexTableOptions.labelForAddNewButton) !== null && _c !== void 0 ? _c : vscode.l10n.t("New Index"),
                expandedGroups: [locConstants_1.TableDesigner.Columns, includedColumnsGroupName],
            },
        });
    }
    const additionalComponents = getAdditionalComponentsForTab(designer.TableProperty.Indexes, view.additionalComponents);
    if (additionalComponents) {
        additionalComponents.forEach((component) => {
            if (component.propertyName === designer.TableIndexProperty.ColumnStoreIndex) {
                // Making all ungrouped properties of column store index as advanced options
                const properties = component.componentProperties;
                properties.expandedGroups = [locConstants_1.TableDesigner.Columns];
                properties.itemProperties.forEach((property) => {
                    if (!property.group) {
                        property.group = locConstants_1.TableDesigner.AdvancedOptions;
                    }
                });
            }
        });
        tabComponents.push(...additionalComponents);
    }
    return tabComponents;
}
function getForeignKeysTabComponents(view) {
    var _a, _b;
    if (!view || !view.foreignKeyTableOptions) {
        return [];
    }
    const foreignKeyTableOptions = view.foreignKeyTableOptions;
    const columnMappingTableOptions = view.foreignKeyColumnMappingTableOptions;
    const foreignKeyColumnMappingProperties = [
        {
            componentType: "dropdown",
            propertyName: designer.ForeignKeyColumnMappingProperty.ForeignColumn,
            componentProperties: {
                title: vscode.l10n.t("Foreign Column"),
                width: 150,
            },
        },
        {
            componentType: "dropdown",
            propertyName: designer.ForeignKeyColumnMappingProperty.Column,
            componentProperties: {
                title: vscode.l10n.t("Column"),
                width: 150,
            },
        },
    ];
    const foreignKeyProperties = [
        {
            componentType: "input",
            propertyName: designer.TableForeignKeyProperty.Name,
            description: vscode.l10n.t("The name of the foreign key."),
            componentProperties: {
                title: vscode.l10n.t("Name"),
                width: 300,
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableForeignKeyProperty.Description,
            description: vscode.l10n.t("The description of the foreign key."),
            componentProperties: {
                title: vscode.l10n.t("Description"),
            },
        },
        {
            componentType: "dropdown",
            propertyName: designer.TableForeignKeyProperty.ForeignTable,
            description: vscode.l10n.t("The table which contains the primary or unique key column."),
            showInPropertiesView: false,
            componentProperties: {
                title: vscode.l10n.t("Foreign Table"),
                width: 200,
            },
        },
        {
            componentType: "dropdown",
            propertyName: designer.TableForeignKeyProperty.OnUpdateAction,
            description: vscode.l10n.t("The behavior when a user tries to update a row with data that is involved in a foreign key relationship."),
            componentProperties: {
                title: vscode.l10n.t("On Update Action"),
                width: 100,
            },
        },
        {
            componentType: "dropdown",
            propertyName: designer.TableForeignKeyProperty.OnDeleteAction,
            description: vscode.l10n.t("The behavior when a user tries to delete a row with data that is involved in a foreign key relationship."),
            componentProperties: {
                title: vscode.l10n.t("On Delete Action"),
                width: 100,
            },
        },
    ];
    if (columnMappingTableOptions) {
        foreignKeyProperties.push({
            componentType: "table",
            propertyName: designer.TableForeignKeyProperty.Columns,
            description: vscode.l10n.t("The mapping between foreign key columns and primary key columns."),
            group: vscode.l10n.t("Columns"),
            componentProperties: {
                ariaLabel: vscode.l10n.t("Columns"),
                columns: getTableDisplayProperties(columnMappingTableOptions, [
                    designer.ForeignKeyColumnMappingProperty.Column,
                    designer.ForeignKeyColumnMappingProperty.ForeignColumn,
                ]),
                itemProperties: addAdditionalTableProperties(columnMappingTableOptions, foreignKeyColumnMappingProperties),
                canAddRows: columnMappingTableOptions.canAddRows,
                canRemoveRows: columnMappingTableOptions.canRemoveRows,
                removeRowConfirmationMessage: columnMappingTableOptions.removeRowConfirmationMessage,
                labelForAddNewButton: (_a = columnMappingTableOptions.labelForAddNewButton) !== null && _a !== void 0 ? _a : vscode.l10n.t("New Column Mapping"),
            },
        });
    }
    const tabComponents = [];
    if (foreignKeyTableOptions) {
        // Making all ungrouped properties of foreign key as advanced options
        foreignKeyProperties.forEach((property) => {
            if (!property.group) {
                property.group = locConstants_1.TableDesigner.AdvancedOptions;
            }
        });
        foreignKeyTableOptions.additionalProperties.forEach((property) => {
            if (!property.group) {
                property.group = locConstants_1.TableDesigner.AdvancedOptions;
            }
        });
        tabComponents.push({
            componentType: "table",
            propertyName: designer.TableProperty.ForeignKeys,
            showInPropertiesView: false,
            componentProperties: {
                ariaLabel: vscode.l10n.t("Foreign Keys"),
                columns: getTableDisplayProperties(foreignKeyTableOptions, [
                    designer.TableForeignKeyProperty.Name,
                    designer.TableForeignKeyProperty.ForeignTable,
                ]),
                itemProperties: addAdditionalTableProperties(foreignKeyTableOptions, foreignKeyProperties),
                objectTypeDisplayName: vscode.l10n.t("Foreign Key"),
                canAddRows: foreignKeyTableOptions.canAddRows,
                canRemoveRows: foreignKeyTableOptions.canRemoveRows,
                removeRowConfirmationMessage: foreignKeyTableOptions.removeRowConfirmationMessage,
                showRemoveRowConfirmation: foreignKeyTableOptions.showRemoveRowConfirmation,
                labelForAddNewButton: (_b = foreignKeyTableOptions.labelForAddNewButton) !== null && _b !== void 0 ? _b : vscode.l10n.t("New Foreign Key"),
                expandedGroups: [locConstants_1.TableDesigner.Columns],
            },
        });
    }
    const additionalComponents = getAdditionalComponentsForTab(designer.TableProperty.ForeignKeys, view.additionalComponents);
    if (additionalComponents) {
        tabComponents.push(...additionalComponents);
    }
    return tabComponents;
}
function getCheckConstraintsTabComponents(view) {
    var _a;
    if (!view || !view.checkConstraintTableOptions) {
        return [];
    }
    const checkConstraintTableOptions = view.checkConstraintTableOptions;
    const additionalcomponents = view.additionalComponents || [];
    const checkConstraintProperties = [
        {
            componentType: "input",
            propertyName: designer.TableCheckConstraintProperty.Name,
            description: vscode.l10n.t("The name of the check constraint."),
            componentProperties: {
                title: vscode.l10n.t("Name"),
                width: 200,
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableCheckConstraintProperty.Description,
            description: vscode.l10n.t("The description of the check constraint."),
            componentProperties: {
                title: vscode.l10n.t("Description"),
            },
        },
        {
            componentType: "input",
            propertyName: designer.TableCheckConstraintProperty.Expression,
            description: vscode.l10n.t("The expression defining the check constraint."),
            componentProperties: {
                title: vscode.l10n.t("Expression"),
                width: 300,
            },
        },
    ];
    const tabComponents = [];
    if (checkConstraintTableOptions) {
        tabComponents.push({
            componentType: "table",
            propertyName: designer.TableProperty.CheckConstraints,
            showInPropertiesView: false,
            componentProperties: {
                ariaLabel: vscode.l10n.t("Check Constraints"),
                columns: getTableDisplayProperties(checkConstraintTableOptions, [
                    designer.TableCheckConstraintProperty.Name,
                    designer.TableCheckConstraintProperty.Expression,
                ]),
                itemProperties: addAdditionalTableProperties(checkConstraintTableOptions, checkConstraintProperties),
                objectTypeDisplayName: vscode.l10n.t("Check Constraint"),
                canAddRows: checkConstraintTableOptions.canAddRows,
                canRemoveRows: checkConstraintTableOptions.canRemoveRows,
                removeRowConfirmationMessage: checkConstraintTableOptions.removeRowConfirmationMessage,
                showRemoveRowConfirmation: checkConstraintTableOptions.showRemoveRowConfirmation,
                labelForAddNewButton: (_a = checkConstraintTableOptions.labelForAddNewButton) !== null && _a !== void 0 ? _a : vscode.l10n.t("New Check Constraint"),
                expandedGroups: [locConstants_1.TableDesigner.General],
            },
        });
    }
    const additionalComponents = getAdditionalComponentsForTab(designer.TableProperty.CheckConstraints, additionalcomponents);
    if (additionalComponents) {
        tabComponents.push(...additionalComponents);
    }
    return tabComponents;
}
function getDesignerView(view) {
    const viewDefinition = {
        tabs: [
            {
                title: vscode.l10n.t("Columns"),
                id: designer.DesignerMainPaneTabs.Columns,
                components: getColumnsTabComponents(view),
            },
            {
                title: vscode.l10n.t("Primary Key"),
                id: designer.DesignerMainPaneTabs.PrimaryKey,
                components: getPrimaryKeyTabComponents(view),
            },
            {
                title: vscode.l10n.t("Indexes"),
                id: designer.DesignerMainPaneTabs.Indexes,
                components: getIndexesTabComponents(view),
            },
            {
                title: vscode.l10n.t("Foreign Keys"),
                id: designer.DesignerMainPaneTabs.ForeignKeys,
                components: getForeignKeysTabComponents(view),
            },
            {
                title: vscode.l10n.t("Check Constraints"),
                id: designer.DesignerMainPaneTabs.CheckConstraints,
                components: getCheckConstraintsTabComponents(view),
            },
        ],
    };
    for (const tab of view.additionalTabs) {
        viewDefinition.tabs.push({
            title: tab.title,
            id: tab.id,
            components: tab.components,
        });
    }
    viewDefinition.tabs.push({
        title: vscode.l10n.t("Advanced Options"),
        id: designer.DesignerMainPaneTabs.AboutTable,
        components: getAdvancedOptionsComponents(view),
    });
    return viewDefinition;
}
function getTableDisplayProperties(options, defaultProperties) {
    if (!options) {
        return defaultProperties;
    }
    return ((options.propertiesToDisplay.length > 0
        ? options.propertiesToDisplay
        : defaultProperties) || []);
}
function addAdditionalTableProperties(options, properties) {
    if (options.additionalProperties) {
        properties.push(...options.additionalProperties);
    }
    return properties;
}
function getAdditionalComponentsForTab(tabId, additionalComponents) {
    if (additionalComponents) {
        return additionalComponents.filter((c) => c.tab === tabId);
    }
    return [];
}

//# sourceMappingURL=tableDesignerTabDefinition.js.map
