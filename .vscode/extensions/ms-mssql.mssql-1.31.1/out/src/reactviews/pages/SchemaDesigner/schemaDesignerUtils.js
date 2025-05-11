"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowUtils = exports.LAYOUT_CONSTANTS = exports.foreignKeyUtils = exports.columnUtils = exports.tableUtils = exports.namingUtils = void 0;
const schemaDesigner_1 = require("../../../sharedInterfaces/schemaDesigner");
const locConstants_1 = require("../../common/locConstants");
const react_1 = require("@xyflow/react");
const dagre_1 = require("@dagrejs/dagre");
const uuid_1 = require("uuid");
exports.namingUtils = {
    getNextColumnName: (columns) => {
        let index = 1;
        while (columns.some((c) => c.name === `column_${index}`))
            index++;
        return `column_${index}`;
    },
    getNextForeignKeyName: (foreignKeys, tables) => {
        // Collect all existing FK names across all tables
        const existingFkNames = new Set();
        for (const table of tables) {
            for (const fk of table.foreignKeys) {
                existingFkNames.add(fk.name);
            }
        }
        for (const fk of foreignKeys) {
            existingFkNames.add(fk.name);
        }
        let index = 1;
        // Find the next available FK name
        while (existingFkNames.has(`FK_${index}`)) {
            index++;
        }
        return `FK_${index}`;
    },
    getNextTableName: (tables) => {
        let index = 1;
        while (tables.some((t) => t.name === `table_${index}`))
            index++;
        return `table_${index}`;
    },
};
exports.tableUtils = {
    getAllTables: (schema, current) => {
        return schema.tables
            .filter((t) => t.schema !== current.schema || t.name !== current.name)
            .sort();
    },
    getTableFromDisplayName: (schema, displayName) => {
        return schema.tables.find((t) => `${t.schema}.${t.name}` === displayName);
    },
    tableNameValidationError: (schema, table) => {
        const conflict = schema.tables.find((t) => t.name.toLowerCase() === table.name.toLowerCase() &&
            t.schema.toLowerCase() === table.schema.toLowerCase() &&
            t.id !== table.id);
        if (conflict)
            return locConstants_1.locConstants.schemaDesigner.tableNameRepeatedError(table.name);
        if (!table.name)
            return locConstants_1.locConstants.schemaDesigner.tableNameEmptyError;
        return undefined;
    },
    createNewTable: (schema, schemaNames) => {
        const name = exports.namingUtils.getNextTableName(schema.tables);
        return {
            name,
            schema: schemaNames[0],
            columns: [
                {
                    name: "Id",
                    dataType: "int",
                    maxLength: "",
                    precision: 0,
                    scale: 0,
                    isNullable: false,
                    isPrimaryKey: true,
                    id: (0, uuid_1.v4)(),
                    isIdentity: true,
                    identitySeed: 1,
                    identityIncrement: 1,
                    defaultValue: "",
                    isComputed: false,
                    computedFormula: "",
                    computedPersisted: false,
                },
            ],
            foreignKeys: [],
            id: (0, uuid_1.v4)(),
        };
    },
};
exports.columnUtils = {
    isColumnValid: (column, columns) => {
        const conflict = columns.find((c) => c.name.toLowerCase() === column.name.toLowerCase() &&
            c.id !== column.id &&
            c.dataType === column.dataType);
        if (conflict)
            return locConstants_1.locConstants.schemaDesigner.columnNameRepeatedError(column.name);
        if (!column.name)
            return locConstants_1.locConstants.schemaDesigner.columnNameEmptyError;
        if (column.isPrimaryKey && column.isNullable)
            return locConstants_1.locConstants.schemaDesigner.columnPKCannotBeNull(column.name);
        // Check if maxlength is a valid number or MAX
        if (exports.columnUtils.isLengthBasedType(column.dataType)) {
            if (!column.maxLength) {
                return locConstants_1.locConstants.schemaDesigner.columnMaxLengthEmptyError;
            }
            if (column.maxLength && column.maxLength !== "MAX") {
                const maxLength = parseInt(column.maxLength);
                if (isNaN(maxLength) || maxLength <= 0) {
                    return locConstants_1.locConstants.schemaDesigner.columnMaxLengthInvalid(column.maxLength);
                }
            }
        }
    },
    isLengthBasedType: (type) => {
        return ["char", "varchar", "nchar", "nvarchar", "binary", "varbinary", "vector"].includes(type);
    },
    isTimeBasedWithScale: (type) => {
        return ["datetime2", "datetimeoffset", "time"].includes(type);
    },
    isPrecisionBasedType: (type) => {
        return ["decimal", "numeric"].includes(type);
    },
    isIdentityBasedType: (type, scale) => {
        if (type === "decimal" || type === "numeric") {
            return scale === 0;
        }
        return ["int", "bigint", "smallint", "tinyint"].includes(type);
    },
    getDefaultLength: (type) => {
        switch (type) {
            case "char":
            case "nchar":
            case "binary":
            case "vector":
                return "1";
            case "varchar":
            case "nvarchar":
            case "varbinary":
                return "50";
            default:
                return "0";
        }
    },
    getDefaultPrecision: (type) => {
        switch (type) {
            case "decimal":
            case "numeric":
                return 18;
            default:
                return 0;
        }
    },
    getDefaultScale: (type) => {
        switch (type) {
            case "decimal":
            case "numeric":
                return 0;
            default:
                return 0;
        }
    },
    fillColumnDefaults: (column) => {
        if (exports.columnUtils.isLengthBasedType(column.dataType))
            column.maxLength = exports.columnUtils.getDefaultLength(column.dataType);
        else
            column.maxLength = "";
        if (exports.columnUtils.isPrecisionBasedType(column.dataType)) {
            column.precision = exports.columnUtils.getDefaultPrecision(column.dataType);
            column.scale = exports.columnUtils.getDefaultScale(column.dataType);
        }
        else {
            column.precision = 0;
            column.scale = 0;
        }
        if (exports.columnUtils.isTimeBasedWithScale(column.dataType)) {
            column.scale = exports.columnUtils.getDefaultScale(column.dataType);
        }
        else {
            column.scale = 0;
        }
        return column;
    },
    getAdvancedOptions: (column) => {
        const options = [];
        // Adding allow null option
        if (!column.isPrimaryKey) {
            options.push({
                label: locConstants_1.locConstants.schemaDesigner.allowNull,
                type: "checkbox",
                value: false,
                columnProperty: "isNullable",
                columnModifier: (column, value) => {
                    column.isNullable = value;
                    return column;
                },
            });
        }
        if (!column.isComputed) {
            if (exports.columnUtils.isIdentityBasedType(column.dataType, column.scale) &&
                (!column.isNullable || column.isPrimaryKey)) {
                // Push is identity option
                options.push({
                    label: locConstants_1.locConstants.schemaDesigner.isIdentity,
                    value: "isIdentity",
                    type: "checkbox",
                    columnProperty: "isIdentity",
                    columnModifier: (column, value) => {
                        column.isIdentity = value;
                        column.identitySeed = value ? 1 : 0;
                        column.identityIncrement = value ? 1 : 0;
                        return column;
                    },
                });
            }
            if (exports.columnUtils.isLengthBasedType(column.dataType)) {
                options.push({
                    label: locConstants_1.locConstants.schemaDesigner.maxLength,
                    value: "",
                    type: "input",
                    columnProperty: "maxLength",
                    columnModifier: (column, value) => {
                        column.maxLength = value;
                        if (!column.maxLength) {
                            column.maxLength = "0";
                        }
                        return column;
                    },
                });
            }
            if (exports.columnUtils.isPrecisionBasedType(column.dataType)) {
                options.push({
                    label: locConstants_1.locConstants.schemaDesigner.precision,
                    value: "",
                    type: "input-number",
                    columnProperty: "precision",
                    columnModifier: (column, value) => {
                        column.precision = value;
                        return column;
                    },
                });
            }
            if (exports.columnUtils.isTimeBasedWithScale(column.dataType) ||
                exports.columnUtils.isPrecisionBasedType(column.dataType)) {
                options.push({
                    label: locConstants_1.locConstants.schemaDesigner.scale,
                    value: "",
                    type: "input-number",
                    columnProperty: "scale",
                    columnModifier: (column, value) => {
                        column.scale = value;
                        return column;
                    },
                });
            }
            options.push({
                label: locConstants_1.locConstants.schemaDesigner.defaultValue,
                value: "",
                type: "textarea",
                columnProperty: "defaultValue",
                columnModifier: (column, value) => {
                    column.defaultValue = value;
                    return column;
                },
            });
        }
        options.push({
            label: locConstants_1.locConstants.schemaDesigner.isComputed,
            value: false,
            type: "checkbox",
            columnProperty: "isComputed",
            columnModifier: (column, value) => {
                column.isComputed = value;
                column.isPrimaryKey = false;
                column.isIdentity = false;
                column.identitySeed = 0;
                column.identityIncrement = 0;
                column.isNullable = true;
                column.computedFormula = value ? "1" : "";
                column.computedPersisted = false;
                column.dataType = value ? "int" : column.dataType;
                return column;
            },
        });
        if (column.isComputed) {
            options.push({
                label: locConstants_1.locConstants.schemaDesigner.computedFormula,
                value: "",
                type: "textarea",
                columnProperty: "computedFormula",
                columnModifier: (column, value) => {
                    column.computedFormula = value;
                    return column;
                },
            });
            options.push({
                label: locConstants_1.locConstants.schemaDesigner.isPersisted,
                value: false,
                type: "checkbox",
                columnProperty: "computedPersisted",
                columnModifier: (column, value) => {
                    column.computedPersisted = value;
                    return column;
                },
            });
        }
        return options;
    },
};
exports.foreignKeyUtils = {
    areDataTypesCompatible: (col, refCol) => {
        if (col.dataType !== refCol.dataType) {
            return {
                isValid: false,
                errorMessage: locConstants_1.locConstants.schemaDesigner.incompatibleDataTypes(col.dataType, col.name, refCol.dataType, refCol.name),
            };
        }
        if (exports.columnUtils.isLengthBasedType(col.dataType) && col.maxLength !== refCol.maxLength) {
            return {
                isValid: false,
                errorMessage: locConstants_1.locConstants.schemaDesigner.incompatibleLength(col.name, refCol.name, col.maxLength, refCol.maxLength),
            };
        }
        if (exports.columnUtils.isPrecisionBasedType(col.dataType) &&
            (col.precision !== refCol.precision || col.scale !== refCol.scale)) {
            return {
                isValid: false,
                errorMessage: locConstants_1.locConstants.schemaDesigner.incompatiblePrecisionOrScale(col.name, refCol.name),
            };
        }
        if (exports.columnUtils.isTimeBasedWithScale(col.dataType) && col.scale !== refCol.scale) {
            return {
                isValid: false,
                errorMessage: locConstants_1.locConstants.schemaDesigner.incompatibleScale(col.name, refCol.name),
            };
        }
        return { isValid: true };
    },
    isCyclicForeignKey: (tables, current, target, visited = new Set()) => {
        if (!current || !target)
            return false;
        if (visited.has(current.id))
            return true;
        visited.add(current.id);
        for (const fk of current.foreignKeys) {
            const next = tables.find((t) => t.name === fk.referencedTableName && t.schema === fk.referencedSchemaName);
            if (!next)
                continue;
            if (next.id === target.id ||
                exports.foreignKeyUtils.isCyclicForeignKey(tables, next, target, new Set(visited)))
                return true;
        }
        return false;
    },
    isForeignKeyValid: (tables, table, fk) => {
        // Check if foreign table exists
        const refTable = tables.find((t) => t.name === fk.referencedTableName && t.schema === fk.referencedSchemaName);
        if (!refTable)
            return {
                isValid: false,
                errorMessage: locConstants_1.locConstants.schemaDesigner.referencedTableNotFound(fk.referencedTableName),
            };
        const existingFks = table.foreignKeys.filter((f) => f.id !== fk.id);
        // Check if columns do not have other foreign keys
        const columnsSet = new Set();
        for (const fks of existingFks) {
            for (const col of fks.columns) {
                columnsSet.add(col);
            }
        }
        for (const cols of fk.columns) {
            if (columnsSet.has(cols)) {
                return {
                    isValid: false,
                    errorMessage: locConstants_1.locConstants.schemaDesigner.duplicateForeignKeyColumns(cols),
                };
            }
            columnsSet.add(cols);
        }
        // Check if columns exist in the table
        for (let i = 0; i < fk.columns.length; i++) {
            const col = table.columns.find((c) => c.name === fk.columns[i]);
            const refCol = refTable.columns.find((c) => c.name === fk.referencedColumns[i]);
            if (!col)
                return {
                    isValid: false,
                    errorMessage: locConstants_1.locConstants.schemaDesigner.columnNotFound(fk.columns[i]),
                };
            if (!refCol)
                return {
                    isValid: false,
                    errorMessage: locConstants_1.locConstants.schemaDesigner.referencedColumnNotFound(fk.referencedColumns[i]),
                };
            // Check if column mapping data types are compatible
            const typeCheck = exports.foreignKeyUtils.areDataTypesCompatible(col, refCol);
            if (!typeCheck.isValid)
                return typeCheck;
            // Check if referenced column is primary key or unique
            if (!refCol.isPrimaryKey) {
                return {
                    isValid: false,
                    errorMessage: locConstants_1.locConstants.schemaDesigner.referencedColumnNotPK(refCol.name),
                };
            }
            if (col.isIdentity &&
                (fk.onUpdateAction !== schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION ||
                    fk.onDeleteAction !== schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION)) {
                return {
                    isValid: false,
                    errorMessage: locConstants_1.locConstants.schemaDesigner.identityColumnFKConstraint(col.name),
                };
            }
        }
        return { isValid: true };
    },
    getForeignKeyWarnings: (tables, table, fk) => {
        // Check if foreign key name is empty
        let hasWarnings = false;
        let warningMessages = [];
        // Check if foreign table exists
        const refTable = tables.find((t) => t.name === fk.referencedTableName && t.schema === fk.referencedSchemaName);
        if (!refTable) {
            return {
                isValid: false,
                errorMessage: locConstants_1.locConstants.schemaDesigner.referencedTableNotFound(fk.referencedTableName),
            };
        }
        if (!fk.name) {
            hasWarnings = true;
            warningMessages.push(locConstants_1.locConstants.schemaDesigner.foreignKeyNameEmptyWarning);
        }
        if (exports.foreignKeyUtils.isCyclicForeignKey(tables, refTable, table)) {
            hasWarnings = true;
            warningMessages.push(locConstants_1.locConstants.schemaDesigner.cyclicForeignKeyDetected(table.name, refTable.name));
        }
        return {
            isValid: !hasWarnings,
            errorMessage: hasWarnings ? warningMessages.join(", ") : undefined,
        };
    },
    extractForeignKeysFromEdges: (edges, sourceTableId, schema) => {
        const filteredEdges = edges.filter((edge) => edge.source === sourceTableId);
        const edgesMap = new Map();
        filteredEdges.forEach((edge) => {
            const sourceTable = schema.tables.find((t) => t.id === edge.source);
            const targetTable = schema.tables.find((t) => t.id === edge.target);
            if (!sourceTable || !targetTable || !edge.data) {
                return;
            }
            const foreignKey = {
                id: edge.data.id,
                columns: [...edge.data.columns],
                name: edge.data.name,
                onDeleteAction: edge.data.onDeleteAction,
                onUpdateAction: edge.data.onUpdateAction,
                referencedColumns: [...edge.data.referencedColumns],
                referencedSchemaName: edge.data.referencedSchemaName,
                referencedTableName: edge.data.referencedTableName,
            };
            if (edgesMap.has(edge.data.id)) {
                // If the edge already exists, append columns and referencedColumns
                const existingForeignKey = edgesMap.get(edge.data.id);
                if (existingForeignKey) {
                    existingForeignKey.columns.push(...foreignKey.columns);
                    existingForeignKey.referencedColumns.push(...foreignKey.referencedColumns);
                }
            }
            else {
                edgesMap.set(edge.data.id, foreignKey);
            }
        });
        return Array.from(edgesMap.values());
    },
    /**
     * Extract column name from a handle ID
     */
    extractColumnNameFromHandle: (handleId) => {
        return handleId.replace("left-", "").replace("right-", "");
    },
    /**
     * Creates a foreign key object from connection data
     */
    createForeignKeyFromConnection: (sourceNode, targetNode, sourceColumnName, targetColumnName, existingFkId, existingFkName) => {
        return {
            id: existingFkId || (0, uuid_1.v4)(),
            name: existingFkName || `FK_${sourceNode.data.name}_${targetNode.data.name}`,
            columns: [sourceColumnName],
            referencedSchemaName: targetNode.data.schema,
            referencedTableName: targetNode.data.name,
            referencedColumns: [targetColumnName],
            onDeleteAction: schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION,
            onUpdateAction: schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION,
        };
    },
    /**
     * Validates a connection between nodes
     */
    validateConnection: (connection, nodes, edges) => {
        const sourceTable = nodes.find((node) => node.id === connection.source);
        const targetTable = nodes.find((node) => node.id === connection.target);
        if (!sourceTable || !targetTable) {
            return {
                isValid: false,
                errorMessage: "Source or target table not found",
            };
        }
        const sourceColumnName = connection.sourceHandle
            ? exports.foreignKeyUtils.extractColumnNameFromHandle(connection.sourceHandle)
            : "";
        const targetColumnName = connection.targetHandle
            ? exports.foreignKeyUtils.extractColumnNameFromHandle(connection.targetHandle)
            : "";
        if (!sourceColumnName || !targetColumnName) {
            return {
                isValid: false,
                errorMessage: "Source or target column not found",
            };
        }
        // Create a foreign key for validation
        const foreignKey = exports.foreignKeyUtils.createForeignKeyFromConnection(sourceTable, targetTable, sourceColumnName, targetColumnName);
        // Validate the foreign key relationship
        return exports.foreignKeyUtils.isForeignKeyValid(exports.flowUtils.extractSchemaModel(nodes, edges).tables, sourceTable.data, foreignKey);
    },
    getOnActionOptions: () => {
        return [
            {
                label: locConstants_1.locConstants.schemaDesigner.cascade,
                value: schemaDesigner_1.SchemaDesigner.OnAction.CASCADE,
            },
            {
                label: locConstants_1.locConstants.schemaDesigner.noAction,
                value: schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION,
            },
            {
                label: locConstants_1.locConstants.schemaDesigner.setNull,
                value: schemaDesigner_1.SchemaDesigner.OnAction.SET_NULL,
            },
            {
                label: locConstants_1.locConstants.schemaDesigner.setDefault,
                value: schemaDesigner_1.SchemaDesigner.OnAction.SET_DEFAULT,
            },
        ];
    },
    convertStringToOnAction: (action) => {
        switch (action) {
            case locConstants_1.locConstants.schemaDesigner.cascade:
                return schemaDesigner_1.SchemaDesigner.OnAction.CASCADE;
            case locConstants_1.locConstants.schemaDesigner.noAction:
                return schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION;
            case locConstants_1.locConstants.schemaDesigner.setNull:
                return schemaDesigner_1.SchemaDesigner.OnAction.SET_NULL;
            case locConstants_1.locConstants.schemaDesigner.setDefault:
                return schemaDesigner_1.SchemaDesigner.OnAction.SET_DEFAULT;
            default:
                return schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION;
        }
    },
    convertOnActionToString: (action) => {
        switch (action) {
            case schemaDesigner_1.SchemaDesigner.OnAction.CASCADE:
                return locConstants_1.locConstants.schemaDesigner.cascade;
            case schemaDesigner_1.SchemaDesigner.OnAction.NO_ACTION:
                return locConstants_1.locConstants.schemaDesigner.noAction;
            case schemaDesigner_1.SchemaDesigner.OnAction.SET_NULL:
                return locConstants_1.locConstants.schemaDesigner.setNull;
            case schemaDesigner_1.SchemaDesigner.OnAction.SET_DEFAULT:
                return locConstants_1.locConstants.schemaDesigner.setDefault;
            default:
                return locConstants_1.locConstants.schemaDesigner.noAction;
        }
    },
};
// Constants for layout and dimensions
exports.LAYOUT_CONSTANTS = {
    NODE_WIDTH: 300,
    NODE_MARGIN: 50,
    BASE_NODE_HEIGHT: 70,
    COLUMN_HEIGHT: 30,
    LAYOUT_OPTIONS: {
        rankdir: "LR",
        marginx: 50,
        marginy: 50,
        nodesep: 50,
        ranksep: 50,
    },
};
// Flow layout utilities
exports.flowUtils = {
    getTableWidth: () => exports.LAYOUT_CONSTANTS.NODE_WIDTH + exports.LAYOUT_CONSTANTS.NODE_MARGIN,
    getTableHeight: (table) => exports.LAYOUT_CONSTANTS.BASE_NODE_HEIGHT + table.columns.length * exports.LAYOUT_CONSTANTS.COLUMN_HEIGHT,
    generateSchemaDesignerFlowComponents: (schema) => {
        if (!schema) {
            return { nodes: [], edges: [] };
        }
        const graph = new dagre_1.default.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
        graph.setGraph(exports.LAYOUT_CONSTANTS.LAYOUT_OPTIONS);
        const rawNodes = schema.tables.map((table) => ({
            id: table.id,
            type: "tableNode",
            data: Object.assign({}, table),
        }));
        // Layout nodes and connect tables via foreign keys
        rawNodes.forEach((node) => {
            graph.setNode(node.id, {
                width: exports.flowUtils.getTableWidth(),
                height: exports.flowUtils.getTableHeight(node.data),
            });
            node.data.foreignKeys.forEach((fk) => {
                const referencedTable = schema.tables.find((t) => t.name === fk.referencedTableName && t.schema === fk.referencedSchemaName);
                if (referencedTable) {
                    graph.setEdge(node.id, referencedTable.id);
                }
            });
        });
        dagre_1.default.layout(graph);
        const layoutedNodes = rawNodes.map((node) => {
            const dagreNode = graph.node(node.id);
            return Object.assign(Object.assign({}, node), { position: {
                    x: dagreNode.x - exports.flowUtils.getTableWidth() / 2,
                    y: dagreNode.y - exports.flowUtils.getTableHeight(node.data) / 2,
                } });
        });
        const edges = [];
        for (const table of schema.tables) {
            for (const fk of table.foreignKeys) {
                const referencedTable = schema.tables.find((t) => t.name === fk.referencedTableName && t.schema === fk.referencedSchemaName);
                if (!referencedTable)
                    continue;
                fk.columns.forEach((col, idx) => {
                    const refCol = fk.referencedColumns[idx];
                    edges.push({
                        id: `${table.name}-${referencedTable.name}-${col}-${refCol}`,
                        source: table.id,
                        target: referencedTable.id,
                        sourceHandle: `right-${col}`,
                        targetHandle: `left-${refCol}`,
                        markerEnd: {
                            type: react_1.MarkerType.ArrowClosed,
                        },
                        data: {
                            name: fk.name,
                            id: fk.id,
                            columns: [col],
                            referencedSchemaName: fk.referencedSchemaName,
                            referencedTableName: fk.referencedTableName,
                            referencedColumns: [refCol],
                            onDeleteAction: fk.onDeleteAction,
                            onUpdateAction: fk.onUpdateAction,
                        },
                    });
                });
            }
        }
        return {
            nodes: layoutedNodes,
            edges,
        };
    },
    extractSchemaModel: (nodes, edges) => {
        // Create a deep copy of the nodes to avoid mutating the original data
        const tables = nodes.map((node) => (Object.assign(Object.assign({}, node.data), { foreignKeys: [] })));
        // Process edges to create foreign keys
        edges.forEach((edge) => {
            const sourceNode = nodes.find((node) => node.id === edge.source);
            const targetNode = nodes.find((node) => node.id === edge.target);
            if (!sourceNode || !targetNode || !edge.data) {
                console.warn(`Edge ${edge.id} references non-existent nodes or has no data`);
                return;
            }
            const foreignKey = {
                id: edge.data.id,
                name: edge.data.name,
                columns: [...edge.data.columns],
                referencedSchemaName: edge.data.referencedSchemaName,
                referencedTableName: edge.data.referencedTableName,
                referencedColumns: [...edge.data.referencedColumns],
                onDeleteAction: edge.data.onDeleteAction,
                onUpdateAction: edge.data.onUpdateAction,
            };
            // Find the table node that corresponds to the source of the edge
            const sourceTable = tables.find((node) => node.id === edge.source);
            if (!sourceTable) {
                console.warn(`Source table ${edge.source} not found`);
                return;
            }
            // Find if the foreign key already exists in the source table
            const existingForeignKey = sourceTable.foreignKeys.find((fk) => fk.id === foreignKey.id);
            if (existingForeignKey) {
                // Update the existing foreign key
                existingForeignKey.columns.push(foreignKey.columns[0]);
                existingForeignKey.referencedColumns.push(foreignKey.referencedColumns[0]);
            }
            else {
                // Add the new foreign key to the source table
                sourceTable.foreignKeys.push(foreignKey);
            }
        });
        return {
            tables: tables,
        };
    },
};

//# sourceMappingURL=schemaDesignerUtils.js.map
