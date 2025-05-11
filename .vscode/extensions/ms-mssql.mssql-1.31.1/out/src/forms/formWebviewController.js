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
exports.FormWebviewController = void 0;
const reactWebviewPanelController_1 = require("../controllers/reactWebviewPanelController");
class FormWebviewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, sourceFile, _viewId, initialData, options) {
        super(context, vscodeWrapper, sourceFile, _viewId, initialData, options);
        this.registerFormRpcHandlers();
    }
    registerFormRpcHandlers() {
        this.registerReducer("formAction", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            if (payload.event.isAction) {
                const component = this.getFormComponent(this.state, payload.event.propertyName);
                if (component && component.actionButtons) {
                    const actionButton = component.actionButtons.find((b) => b.id === payload.event.value);
                    if (actionButton === null || actionButton === void 0 ? void 0 : actionButton.callback) {
                        yield actionButton.callback();
                    }
                }
            }
            else {
                this.state.formState[payload.event.propertyName
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ] = payload.event.value;
                yield this.validateForm(this.state.formState, payload.event.propertyName, payload.event.updateValidation);
                yield this.afterSetFormProperty(payload.event.propertyName);
            }
            yield this.updateItemVisibility();
            return state;
        }));
    }
    /**
     * Runs validation across the form fields
     * @param formTarget
     * @param propertyName
     * @returns array of fields with errors
     */
    validateForm(formTarget, propertyName, updateValidation) {
        return __awaiter(this, void 0, void 0, function* () {
            const erroredInputs = [];
            const self = this;
            function validateComponent(component) {
                if (!component.validate) {
                    return;
                }
                const validation = component.validate(self.state, formTarget[component.propertyName]);
                if (updateValidation) {
                    component.validation = validation;
                }
                if (!validation.isValid) {
                    erroredInputs.push(component.propertyName);
                }
            }
            if (propertyName) {
                const component = this.state.formComponents[propertyName];
                if (component) {
                    validateComponent(component);
                }
            }
            else {
                this.getActiveFormComponents(this.state)
                    .map((x) => this.state.formComponents[x])
                    .forEach((c) => {
                    if (c.hidden) {
                        c.validation = {
                            isValid: true,
                            validationMessage: "",
                        };
                        return;
                    }
                    else {
                        validateComponent(c);
                    }
                });
            }
            return erroredInputs;
        });
    }
    /**
     * Method called after a form value has been set and validated.
     * Override to perform additional actions after setting a form property.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    afterSetFormProperty(propertyName) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    /** Gets a specific form component */
    getFormComponent(state, propertyName) {
        return this.getActiveFormComponents(state).includes(propertyName)
            ? state.formComponents[propertyName]
            : undefined;
    }
}
exports.FormWebviewController = FormWebviewController;

//# sourceMappingURL=formWebviewController.js.map
