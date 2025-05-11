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
exports.UserSurvey = void 0;
exports.sendSurveyTelemetry = sendSurveyTelemetry;
exports.getGithubIssueText = getGithubIssueText;
exports.getStandardNPSQuestions = getStandardNPSQuestions;
const constants = require("../constants/constants");
const locConstants = require("../constants/locConstants");
const vscode = require("vscode");
const os = require("os");
const telemetry_1 = require("../sharedInterfaces/telemetry");
const reactWebviewPanelController_1 = require("../controllers/reactWebviewPanelController");
const telemetry_2 = require("../telemetry/telemetry");
const PROBABILITY = 0.15;
const SESSION_COUNT_KEY = "nps/sessionCount";
const LAST_SESSION_DATE_KEY = "nps/lastSessionDate";
const SKIP_VERSION_KEY = "nps/skipVersion";
const IS_CANDIDATE_KEY = "nps/isCandidate";
const NEVER_KEY = "nps/never";
class UserSurvey {
    constructor(_context, vscodeWrapper) {
        this._context = _context;
        this.vscodeWrapper = vscodeWrapper;
    }
    static createInstance(_context, vscodeWrapper) {
        UserSurvey._instance = new UserSurvey(_context, vscodeWrapper);
    }
    static getInstance() {
        return UserSurvey._instance;
    }
    /** checks user eligibility for NPS survey and, if eligible, displays the survey and submits feedback */
    promptUserForNPSFeedback() {
        void this.promptUserForNPSFeedbackAsync().catch((err) => {
            // Handle any errors that occur during the prompt and not throwing them in order to not break the calling function
            console.error("Error prompting for NPS feedback:", err);
        });
    }
    promptUserForNPSFeedbackAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const globalState = this._context.globalState;
            const sessionCount = globalState.get(SESSION_COUNT_KEY, 0) + 1;
            const extensionVersion = vscode.extensions.getExtension(constants.extensionId).packageJSON.version || "unknown";
            if (!(yield this.shouldPromptForFeedback())) {
                return;
            }
            const take = {
                title: locConstants.UserSurvey.takeSurvey,
                run: () => __awaiter(this, void 0, void 0, function* () {
                    const state = getStandardNPSQuestions();
                    yield this.launchSurvey("nps", state);
                    yield globalState.update(IS_CANDIDATE_KEY, false);
                    yield globalState.update(SKIP_VERSION_KEY, extensionVersion);
                }),
            };
            const remind = {
                title: locConstants.Common.remindMeLater,
                run: () => __awaiter(this, void 0, void 0, function* () {
                    yield globalState.update(SESSION_COUNT_KEY, sessionCount - 3);
                }),
            };
            const never = {
                title: locConstants.Common.dontShowAgain,
                isSecondary: true,
                run: () => __awaiter(this, void 0, void 0, function* () {
                    yield globalState.update(NEVER_KEY, true);
                }),
            };
            const button = yield vscode.window.showInformationMessage(locConstants.UserSurvey.doYouMindTakingAQuickFeedbackSurvey, take, remind, never);
            yield (button || remind).run();
        });
    }
    /** launches the survey directly and submits feedback; does not check for survey eligibility first */
    launchSurvey(surveyId, survey) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = survey;
            if (!this._webviewController || this._webviewController.isDisposed) {
                this._webviewController = new UserSurveyWebviewController(this._context, this.vscodeWrapper, state);
            }
            else {
                this._webviewController.updateState(state);
            }
            this._webviewController.revealToForeground();
            const answers = yield new Promise((resolve) => {
                this._webviewController.onSubmit((e) => {
                    resolve(e);
                });
                this._webviewController.onCancel(() => {
                    resolve({});
                });
            });
            sendSurveyTelemetry(surveyId, answers);
            return answers;
        });
    }
    shouldPromptForFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            const globalState = this._context.globalState;
            // If the user has opted out of the survey, don't prompt for feedback
            const isNeverUser = globalState.get(NEVER_KEY, false);
            if (isNeverUser) {
                return false;
            }
            // If the user has already been prompted for feedback in this version, don't prompt again
            const extensionVersion = vscode.extensions.getExtension(constants.extensionId).packageJSON.version || "unknown";
            const skipVersion = globalState.get(SKIP_VERSION_KEY, "");
            if (skipVersion === extensionVersion) {
                return false;
            }
            const date = new Date().toDateString();
            const lastSessionDate = globalState.get(LAST_SESSION_DATE_KEY, new Date(0).toDateString());
            if (date === lastSessionDate) {
                return false;
            }
            const sessionCount = globalState.get(SESSION_COUNT_KEY, 0) + 1;
            yield globalState.update(LAST_SESSION_DATE_KEY, date);
            yield globalState.update(SESSION_COUNT_KEY, sessionCount);
            // don't prompt for feedback from users until they've had a chance to use the extension a few times
            if (sessionCount < 5) {
                return false;
            }
            const isCandidate = globalState.get(IS_CANDIDATE_KEY, false) || Math.random() < PROBABILITY;
            yield globalState.update(IS_CANDIDATE_KEY, isCandidate);
            if (!isCandidate) {
                yield globalState.update(SKIP_VERSION_KEY, extensionVersion);
                return false;
            }
            return true;
        });
    }
}
exports.UserSurvey = UserSurvey;
function sendSurveyTelemetry(surveyId, answers) {
    // Separate string answers from number answers
    const stringAnswers = Object.keys(answers).reduce((acc, key) => {
        if (typeof answers[key] === "string") {
            acc[key] = answers[key];
        }
        return acc;
    }, {});
    const numericalAnswers = Object.keys(answers).reduce((acc, key) => {
        if (typeof answers[key] === "number") {
            acc[key] = answers[key];
        }
        return acc;
    }, {});
    (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.UserSurvey, telemetry_1.TelemetryActions.SurveySubmit, Object.assign({ surveyId: surveyId, modernFeaturesEnabled: vscode.workspace
            .getConfiguration()
            .get(constants.configEnableRichExperiences) }, stringAnswers), numericalAnswers);
}
class UserSurveyWebviewController extends reactWebviewPanelController_1.ReactWebviewPanelController {
    constructor(context, vscodeWrapper, state) {
        super(context, vscodeWrapper, "userSurvey", "userSurvey", state, {
            title: locConstants.UserSurvey.mssqlFeedback,
            viewColumn: vscode.ViewColumn.Active,
            iconPath: {
                dark: vscode.Uri.joinPath(context.extensionUri, "media", "feedback_dark.svg"),
                light: vscode.Uri.joinPath(context.extensionUri, "media", "feedback_light.svg"),
            },
        });
        this._onSubmit = new vscode.EventEmitter();
        this.onSubmit = this._onSubmit.event;
        this._onCancel = new vscode.EventEmitter();
        this.onCancel = this._onCancel.event;
        this.registerReducer("submit", (state, payload) => __awaiter(this, void 0, void 0, function* () {
            this._onSubmit.fire(payload.answers);
            this.panel.dispose();
            if (payload.answers.nps < 7 /* NPS detractor */ ||
                payload.answers.nsat < 2 /* NSAT dissatisfied */) {
                const response = yield vscode.window.showInformationMessage(locConstants.UserSurvey.fileAnIssuePrompt, locConstants.UserSurvey.submitIssue, locConstants.Common.cancel);
                (0, telemetry_2.sendActionEvent)(telemetry_1.TelemetryViews.UserSurvey, telemetry_1.TelemetryActions.SubmitGithubIssue, {
                    response: response === locConstants.UserSurvey.submitIssue
                        ? "submitted"
                        : "not submitted",
                });
                if (response === locConstants.UserSurvey.submitIssue) {
                    const encodedIssueBody = encodeURIComponent(getGithubIssueText(typeof payload.answers.comments === "string"
                        ? payload.answers.comments
                        : "", context.extension.packageJSON.version || "unknown"));
                    const issueUrl = `https://github.com/microsoft/vscode-mssql/issues/new?labels=User-filed,Triage:%20Needed&body=${encodedIssueBody}`;
                    vscode.env.openExternal(vscode.Uri.parse(issueUrl));
                }
            }
            return state;
        }));
        this.registerReducer("cancel", (state) => __awaiter(this, void 0, void 0, function* () {
            this._onCancel.fire();
            this.panel.dispose();
            return state;
        }));
        this.registerReducer("openPrivacyStatement", (state) => __awaiter(this, void 0, void 0, function* () {
            vscode.env.openExternal(vscode.Uri.parse(constants.microsoftPrivacyStatementUrl));
            return state;
        }));
        this.panel.onDidDispose(() => {
            this._onCancel.fire();
        });
    }
}
function getGithubIssueText(comments, extensionVersion) {
    return `**Describe issue:**
${comments}

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


----
|Software|Version|
|--|--|
|MSSQL Extension|${extensionVersion}|
|VS Code|${vscode.version}|
|OS|${os.type()} ${os.release()}|`;
}
function getStandardNPSQuestions(featureName) {
    return {
        questions: [
            {
                id: "nps",
                label: featureName
                    ? locConstants.UserSurvey.howLikelyAreYouToRecommendFeature(featureName)
                    : locConstants.UserSurvey.howlikelyAreYouToRecommendMSSQLExtension,
                type: "nps",
                required: true,
            },
            {
                id: "nsat",
                label: featureName
                    ? locConstants.UserSurvey.overallHowStatisfiedAreYouWithFeature(featureName)
                    : locConstants.UserSurvey.overallHowSatisfiedAreYouWithMSSQLExtension,
                type: "nsat",
                required: true,
            },
            {
                type: "divider",
            },
            {
                id: "comments",
                label: locConstants.UserSurvey.whatCanWeDoToImprove,
                type: "textarea",
                required: false,
                placeholder: locConstants.UserSurvey.privacyDisclaimer,
            },
        ],
    };
}

//# sourceMappingURL=userSurvey.js.map
