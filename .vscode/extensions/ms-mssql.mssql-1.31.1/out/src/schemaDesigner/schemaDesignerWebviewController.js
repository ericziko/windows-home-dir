"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaDesignerWebviewController = void 0;
const vscode = require("vscode");
const reactWebviewPanelController_1 = require("../controllers/reactWebviewPanelController");
const LocConstants = require("../constants/locConstants");
class SchemaDesignerWebviewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, mainController, schemaDesignerService, connectionString, accessToken, databaseName, treeNode) {
        super(context, vscodeWrapper, "schemaDesigner", "schemaDesigner", {}, {
            title: databaseName,
            viewColumn: vscode.ViewColumn.One,
            iconPath: {
                light: vscode.Uri.joinPath(context.extensionUri, "media", "designSchema_light.svg"),
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "designSchema_dark.svg"),
            },
            showRestorePromptAfterClose: false,
        });
        this.mainController = mainController;
        this.schemaDesignerService = schemaDesignerService;
        this.connectionString = connectionString;
        this.accessToken = accessToken;
        this.databaseName = databaseName;
        this.treeNode = treeNode;
        this._sessionId = "";
        this.registerReducers();
    }
    registerReducers() {
        this.registerRequestHandler("exportToFile", (payload) => __awaiter(this, void 0, void 0, function* () {
            const outputPath = yield vscode.window.showSaveDialog({
                filters: {
                    [payload.format]: [payload.format],
                },
                defaultUri: vscode.Uri.file(`${this.databaseName}.${payload.format}`),
                saveLabel: LocConstants.SchemaDesigner.Save,
                title: LocConstants.SchemaDesigner.SaveAs,
            });
            if (payload.format === "svg") {
                let fileContents = decodeURIComponent(payload.fileContents.split(",")[1]);
                yield vscode.workspace.fs.writeFile(outputPath, Buffer.from(fileContents, "utf8"));
            }
            else {
                let fileContents = Buffer.from(payload.fileContents.split(",")[1], "base64");
                vscode.workspace.fs.writeFile(outputPath, fileContents);
            }
        }));
        this.registerRequestHandler("initializeSchemaDesigner", () => __awaiter(this, void 0, void 0, function* () {
            const sessionResponse = yield this.schemaDesignerService.createSession({
                connectionString: this.connectionString,
                accessToken: this.accessToken,
                databaseName: this.databaseName,
            });
            this._sessionId = sessionResponse.sessionId;
            return sessionResponse;
        }));
        this.registerRequestHandler("getScript", (payload) => __awaiter(this, void 0, void 0, function* () {
            const script = yield this.schemaDesignerService.generateScript({
                updatedSchema: payload.updatedSchema,
                sessionId: this._sessionId,
            });
            return script;
        }));
        this.registerRequestHandler("getReport", (payload) => __awaiter(this, void 0, void 0, function* () {
            try {
                const report = yield this.schemaDesignerService.getReport({
                    updatedSchema: payload.updatedSchema,
                    sessionId: this._sessionId,
                });
                return {
                    report,
                };
            }
            catch (error) {
                return {
                    error: error.toString(),
                };
            }
        }));
        this.registerRequestHandler("publishSession", (payload) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.schemaDesignerService.publishSession({
                    sessionId: this._sessionId,
                });
                return {
                    success: true,
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.toString(),
                };
            }
        }));
        this.registerRequestHandler("copyToClipboard", (payload) => __awaiter(this, void 0, void 0, function* () {
            yield vscode.env.clipboard.writeText(payload.text);
        }));
        this.registerRequestHandler("openInEditor", (payload) => __awaiter(this, void 0, void 0, function* () {
            const document = yield this.vscodeWrapper.openMsSqlTextDocument(payload.text);
            // Open the document in the editor
            yield this.vscodeWrapper.showTextDocument(document, {
                viewColumn: vscode.ViewColumn.Active,
                preserveFocus: true,
            });
        }));
        this.registerRequestHandler("openInEditorWithConnection", (payload) => __awaiter(this, void 0, void 0, function* () {
            void this.mainController.onNewQuery(this.treeNode, payload.text);
        }));
        this.registerRequestHandler("closeDesigner", () => __awaiter(this, void 0, void 0, function* () {
            this.panel.dispose();
        }));
    }
    dispose() {
        super.dispose();
        this.schemaDesignerService.disposeSession({
            sessionId: this._sessionId,
        });
    }
}
exports.SchemaDesignerWebviewController = SchemaDesignerWebviewController;

//# sourceMappingURL=schemaDesignerWebviewController.js.map
