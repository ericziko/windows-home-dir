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
exports.AccountStore = void 0;
const Constants = require("../constants/constants");
class AccountStore {
    constructor(_context, _logger) {
        this._context = _context;
        this._logger = _logger;
    }
    getAccounts() {
        var _a;
        let configValues = (_a = this._context.globalState.get(Constants.configAzureAccount)) !== null && _a !== void 0 ? _a : [];
        this._logger.verbose(`Retreived ${configValues === null || configValues === void 0 ? void 0 : configValues.length} Azure accounts from account store.`);
        return configValues;
    }
    getAccount(key) {
        let account;
        let configValues = this._context.globalState.get(Constants.configAzureAccount);
        if (!configValues) {
            throw new Error("No Azure accounts stored");
        }
        for (let value of configValues) {
            // Compare account IDs considering multi-tenant account ID format with MSAL.
            if (value.key.id === key ||
                value.key.id.startsWith(key) ||
                key.startsWith(value.key.id)) {
                account = value;
                break;
            }
        }
        return account;
    }
    removeAccount(key) {
        if (!key) {
            this._logger.error("Azure Account key not received for removal request.");
        }
        let configValues = this.getAccounts();
        configValues = configValues.filter((val) => val.key.id !== key);
        this._context.globalState.update(Constants.configAzureAccount, configValues);
        return;
    }
    /**
     * Adds an account to the account store.
     *
     * @param account the account to add
     * @returns a Promise that returns when the account was saved
     */
    addAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            if (account) {
                let configValues = this.getAccounts();
                // remove element if already present in map
                if (configValues.length > 0) {
                    configValues = configValues.filter((val) => val.key.id !== account.key.id);
                }
                else {
                    configValues = [];
                }
                configValues.unshift(account);
                yield this._context.globalState.update(Constants.configAzureAccount, configValues);
            }
            else {
                this._logger.error("Empty Azure Account cannot be added to account store.");
            }
        });
    }
    pruneAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            let configValues = this.getAccounts();
            configValues = configValues.filter((val) => {
                if (val.key) {
                    return true;
                }
                else {
                    this._logger.info("Unexpected empty account key, removing account from account store.");
                    return false;
                }
            });
            yield this._context.globalState.update(Constants.configAzureAccount, configValues);
            return;
        });
    }
    clearAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            let configValues = [];
            yield this._context.globalState.update(Constants.configAzureAccount, configValues);
            this._logger.verbose("Cleared all saved Azure accounts");
        });
    }
}
exports.AccountStore = AccountStore;

//# sourceMappingURL=accountStore.js.map
