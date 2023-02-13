"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var twilio_1 = __importDefault(require("twilio"));
var path_1 = __importDefault(require("path"));
var moment_1 = __importDefault(require("moment"));
var mongoose_1 = __importDefault(require("mongoose"));
var phone_1 = require("../../models/phone");
var current_user_1 = require("../../middlewares/current-user");
var require_auth_1 = require("../../middlewares/require-auth");
var require_admin_1 = require("../../middlewares/require-admin");
var db_1 = require("../db");
var getSecrets_1 = __importDefault(require("../../services/getSecrets"));
var urls_1 = __importDefault(require("../../services/urls"));
var Phone = mongoose_1.default.model('Phone');
var smsRouter = express_1.default.Router();
smsRouter.post('/outgoing', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, TWILIO_ID, TWILIO_AUTH_TOKEN, twilioClient, _b, message, region, responsePhoneNumber, allPhoneNumbers, formattedNumbers, outgoingText, extension, fileName, imageId, createOutgoingText, textPromises;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, getSecrets_1.default([
                    'TWILIO_ID',
                    'TWILIO_AUTH_TOKEN',
                ])];
            case 1:
                _a = _d.sent(), TWILIO_ID = _a.TWILIO_ID, TWILIO_AUTH_TOKEN = _a.TWILIO_AUTH_TOKEN;
                if (!TWILIO_ID || !TWILIO_AUTH_TOKEN) {
                    throw Error('Could not find twilio credentials');
                }
                twilioClient = new twilio_1.default.Twilio(TWILIO_ID, TWILIO_AUTH_TOKEN);
                _b = req.body, message = _b.message, region = _b.region;
                if (!message) {
                    res.status(422);
                    throw new Error('No message to send');
                }
                if (!region) {
                    res.status(422);
                    throw new Error('No region specified');
                }
                responsePhoneNumber = phone_1.REGIONS[region];
                return [4 /*yield*/, Phone.find({ region: region })];
            case 2:
                allPhoneNumbers = _d.sent();
                formattedNumbers = allPhoneNumbers.map(function (p) { return p.number; });
                outgoingText = {
                    body: message,
                    from: responsePhoneNumber,
                };
                if (!(((_c = req.files) === null || _c === void 0 ? void 0 : _c.photo) && !Array.isArray(req.files.photo))) return [3 /*break*/, 4];
                extension = path_1.default.extname(req.files.photo.name);
                fileName = moment_1.default().format('YYYY-MM-DD-hh-ss-a') + extension;
                return [4 /*yield*/, db_1.uploadFile({
                        data: req.files.photo.data,
                        name: fileName,
                    })];
            case 3:
                imageId = _d.sent();
                outgoingText.mediaUrl = [
                    urls_1.default.server + '/api/db/images/' + imageId + extension,
                ];
                _d.label = 4;
            case 4:
                createOutgoingText = function (phone) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, twilioClient.messages.create(__assign(__assign({}, outgoingText), { to: phone }))];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                textPromises = formattedNumbers.map(createOutgoingText);
                return [4 /*yield*/, Promise.all(textPromises)];
            case 5:
                _d.sent();
                res.send({ message: message, region: region, photoUrl: outgoingText.mediaUrl });
                return [2 /*return*/];
        }
    });
}); });
exports.default = smsRouter;
