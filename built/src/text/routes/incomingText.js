"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var twilio_1 = __importStar(require("twilio"));
var moment_1 = __importDefault(require("moment"));
var phone_1 = require("../models/phone");
var textResponses_1 = __importDefault(require("../textResponses"));
var email_1 = require("../../services/email");
var urls_1 = __importDefault(require("../../services/urls"));
var Feedback = mongoose_1.default.model('Feedback');
var Phone = mongoose_1.default.model('Phone');
var MessagingResponse = twilio_1.twiml.MessagingResponse;
var router = express_1.default.Router();
var DROPOFF_SUBSCRIBERS = [
    'andy@ckoakland.org',
    'mollye@ckoakland.org',
    'ali@ckoakland.org',
];
router.post('/incoming', twilio_1.default.webhook({ protocol: 'https' }), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response, images, responseMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                response = new MessagingResponse();
                images = getImages(req.body);
                return [4 /*yield*/, routeTextToResponse(req.body, images)];
            case 1:
                responseMessage = _a.sent();
                if (!responseMessage) {
                    return [2 /*return*/, res.sendStatus(200)];
                }
                response.message(responseMessage);
                res.set('Content-Type', 'text/xml');
                return [2 /*return*/, res.send(response.toString())];
        }
    });
}); });
router.post('/incoming/dropoff', twilio_1.default.webhook({ protocol: 'https' }), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, Body, From, DateSent, images, textUrl, html, imagesHtml_1, msg, response;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, Body = _a.Body, From = _a.From, DateSent = _a.DateSent;
                images = getImages(req.body);
                textUrl = urls_1.default.client + '/text/send-text';
                html = "\n    <h4>This is a CK Home Chef drop off alert</h4>\n    <p>Go to the <a href='" + textUrl + "'>CK Text Service Portal</a> to send out a text to the subscriber list.</p>\n    <p color='blue'>This message was received at <span color='black'>" + moment_1.default(DateSent)
                    .subtract(8, 'hours')
                    .format('MM/DD/YY hh:mm a') + "</span></p>\n    <p color='blue'>From: <span color='black'>" + From + "</span></p>\n    <p color='blue'>Message:</p>\n    <p>" + Body + "</p>\n    ";
                if (images.length) {
                    imagesHtml_1 = "<p>Images included with message:</p>";
                    images.forEach(function (url) {
                        imagesHtml_1 += "<br /><img src=" + url + " width='300px' height='auto'/>";
                    });
                    html += imagesHtml_1;
                }
                msg = {
                    to: DROPOFF_SUBSCRIBERS,
                    from: 'andy@ckoakland.org',
                    subject: 'You got a text on the Home Chef drop-off line',
                    mediaUrl: images,
                    html: html,
                };
                return [4 /*yield*/, email_1.sendEmail(msg)];
            case 1:
                _b.sent();
                response = new MessagingResponse();
                response.message(textResponses_1.default.dropOffResponse);
                res.set('Content-Type', 'text/xml');
                res.send(response.toString());
                return [2 /*return*/];
        }
    });
}); });
var getImages = function (body) {
    var images = [];
    for (var i = 0; i < body.NumMedia; i++) {
        images.push(body["MediaUrl" + i]);
    }
    return images;
};
var routeTextToResponse = function (_a, images) {
    var Body = _a.Body, From = _a.From, To = _a.To;
    return __awaiter(void 0, void 0, void 0, function () {
        var regions, region, keyword, existingNumber;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    regions = Object.keys(phone_1.REGIONS);
                    region = regions.find(function (reg) { return phone_1.REGIONS[reg] === To; });
                    if (!region) {
                        throw Error('could not map recipient number to a region');
                    }
                    keyword = Body.toLowerCase().replace(' ', '');
                    return [4 /*yield*/, Phone.findOne({ number: From })];
                case 1:
                    existingNumber = _b.sent();
                    if (!textResponses_1.default.SIGN_UP_WORDS.includes(keyword)) return [3 /*break*/, 3];
                    if (existingNumber && existingNumber.region.includes(region)) {
                        return [2 /*return*/, textResponses_1.default.duplicateResponse(region)];
                    }
                    return [4 /*yield*/, addPhoneNumber(existingNumber, From, region)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    if (!textResponses_1.default.CANCEL_WORDS.includes(keyword)) return [3 /*break*/, 5];
                    return [4 /*yield*/, removePhoneNumber(existingNumber, region)];
                case 4:
                    _b.sent();
                    return [2 /*return*/, null];
                case 5:
                    // if we receive a message from someone not signed up, give general info
                    if (!(existingNumber === null || existingNumber === void 0 ? void 0 : existingNumber.region.includes(region)) ||
                        textResponses_1.default.INFO_WORD === keyword) {
                        return [2 /*return*/, textResponses_1.default.generalInfoResponse(region)];
                    }
                    return [4 /*yield*/, receiveFeedback({ message: Body, sender: From, region: region, images: images })];
                case 6: 
                // if it's an existing user with text that has not been matched, it's treated as feedback
                return [2 /*return*/, _b.sent()];
            }
        });
    });
};
var addPhoneNumber = function (user, number, region) { return __awaiter(void 0, void 0, void 0, function () {
    var newPhone;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!user) return [3 /*break*/, 2];
                user.region.push(region);
                return [4 /*yield*/, user.save()];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                newPhone = new Phone({ number: number, region: [region] });
                return [4 /*yield*/, newPhone.save()];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/, textResponses_1.default.signUpResponse(region, number)];
        }
    });
}); };
var removePhoneNumber = function (user, region) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!user) {
                    return [2 /*return*/];
                }
                user.region = user.region.filter(function (r) { return r !== region; });
                return [4 /*yield*/, user.save()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var receiveFeedback = function (feedbackArgs) { return __awaiter(void 0, void 0, void 0, function () {
    var newFeedback;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                newFeedback = new Feedback(feedbackArgs);
                return [4 /*yield*/, newFeedback.save()];
            case 1:
                _a.sent();
                return [2 /*return*/, textResponses_1.default.feedbackResponse(feedbackArgs.sender)];
        }
    });
}); };
exports.default = router;
