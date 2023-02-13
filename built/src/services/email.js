"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.sendShiftSignupEmail = exports.sendHomeChefSignupEmail = exports.sendDonationAckEmail = exports.sendEmailToSelf = exports.initializeEmail = void 0;
var mail_1 = __importDefault(require("@sendgrid/mail"));
var getSecrets_1 = __importDefault(require("./getSecrets"));
var donationAck_1 = __importDefault(require("./emailTemplates/donationAck"));
var homeChefSignup_1 = __importDefault(require("./emailTemplates/homeChefSignup"));
var shiftSignup_1 = __importDefault(require("./emailTemplates/shiftSignup"));
var initializeEmail = function () { return __awaiter(void 0, void 0, void 0, function () {
    var SENDGRID_KEY;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getSecrets_1.default(['SENDGRID_KEY'])];
            case 1:
                SENDGRID_KEY = (_a.sent()).SENDGRID_KEY;
                if (!SENDGRID_KEY) {
                    throw new Error('Could not find sendgrid key to initialize email');
                }
                mail_1.default.setApiKey(SENDGRID_KEY);
                return [2 /*return*/];
        }
    });
}); };
exports.initializeEmail = initializeEmail;
var sendEmailToSelf = function (_a) {
    var subject = _a.subject, message = _a.message;
    return __awaiter(void 0, void 0, void 0, function () {
        var msg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    msg = {
                        to: 'andy@ckoakland.org',
                        from: 'andy@ckoakland.org',
                        subject: subject,
                        text: 'Sent to self from server: ' + message,
                    };
                    return [4 /*yield*/, exports.sendEmail(msg)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.sendEmailToSelf = sendEmailToSelf;
var sendDonationAckEmail = function (donationData) { return __awaiter(void 0, void 0, void 0, function () {
    var html, msg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                html = donationAck_1.default(donationData.first_name, donationData.last_name, donationData.payment_gross);
                msg = {
                    to: donationData.payer_email,
                    from: 'andy@ckoakland.org',
                    subject: 'Thank you for your donation!',
                    html: html,
                };
                return [4 /*yield*/, exports.sendEmail(msg)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendDonationAckEmail = sendDonationAckEmail;
var sendHomeChefSignupEmail = function (chef) { return __awaiter(void 0, void 0, void 0, function () {
    var html, msg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                html = homeChefSignup_1.default(chef);
                msg = {
                    to: chef.email,
                    from: 'mollye@ckoakland.org',
                    subject: 'Thank you for signing up as a CK Home Chef!',
                    html: html,
                };
                return [4 /*yield*/, exports.sendEmail(msg)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendHomeChefSignupEmail = sendHomeChefSignupEmail;
var sendShiftSignupEmail = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var html, msg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                html = shiftSignup_1.default();
                msg = {
                    to: email,
                    from: 'mollye@ckoakland.org',
                    subject: 'Thank you for signing up for a Town Fridge!',
                    html: html,
                };
                return [4 /*yield*/, exports.sendEmail(msg)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendShiftSignupEmail = sendShiftSignupEmail;
var sendEmail = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.initializeEmail()];
            case 1:
                _a.sent();
                return [4 /*yield*/, mail_1.default.send(msg)];
            case 2:
                _a.sent();
                console.log('Email sent to ' + msg.to);
                return [2 /*return*/];
        }
    });
}); };
exports.sendEmail = sendEmail;
