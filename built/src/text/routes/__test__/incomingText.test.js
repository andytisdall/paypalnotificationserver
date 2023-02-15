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
var index_1 = __importDefault(require("../../../../index"));
var supertest_1 = __importDefault(require("supertest"));
var textResponses_1 = __importDefault(require("../../textResponses"));
var phone_1 = require("../../models/phone");
jest.mock('twilio');
var from = '+14158190251';
it('gets general info', function () { return __awaiter(void 0, void 0, void 0, function () {
    var incomingText, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                incomingText = {
                    Body: 'What Up?',
                    From: from,
                    To: phone_1.REGIONS['WEST_OAKLAND'],
                };
                return [4 /*yield*/, supertest_1.default(index_1.default)
                        .post('/api/text/incoming')
                        .send(incomingText)
                        .expect(200)];
            case 1:
                res = _a.sent();
                expect(res.text).toEqual(textResponses_1.default.generalInfoResponse('WEST_OAKLAND'));
                return [2 /*return*/];
        }
    });
}); });
it('signs up for west oakland', function () { return __awaiter(void 0, void 0, void 0, function () {
    var incomingText, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                incomingText = {
                    Body: 'signup',
                    From: from,
                    To: phone_1.REGIONS['WEST_OAKLAND'],
                };
                return [4 /*yield*/, supertest_1.default(index_1.default)
                        .post('/api/text/incoming')
                        .send(incomingText)
                        .expect(200)];
            case 1:
                res = _a.sent();
                expect(res.text).toEqual(textResponses_1.default.signUpResponse('WEST_OAKLAND', from));
                return [2 /*return*/];
        }
    });
}); });
it('signs up for east oakland', function () { return __awaiter(void 0, void 0, void 0, function () {
    var incomingText, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                incomingText = {
                    Body: 'signup',
                    From: from,
                    To: phone_1.REGIONS['EAST_OAKLAND'],
                };
                return [4 /*yield*/, supertest_1.default(index_1.default)
                        .post('/api/text/incoming')
                        .send(incomingText)
                        .expect(200)];
            case 1:
                res = _a.sent();
                expect(res.text).toEqual(textResponses_1.default.signUpResponse('EAST_OAKLAND', from));
                return [2 /*return*/];
        }
    });
}); });
it('gets a duplicate response', function () { return __awaiter(void 0, void 0, void 0, function () {
    var incomingText, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                incomingText = {
                    Body: 'signup',
                    From: from,
                    To: phone_1.REGIONS['EAST_OAKLAND'],
                };
                return [4 /*yield*/, supertest_1.default(index_1.default)
                        .post('/api/text/incoming')
                        .send(incomingText)
                        .expect(200)];
            case 1:
                res = _a.sent();
                expect(res.text).toEqual(textResponses_1.default.duplicateResponse('EAST_OAKLAND'));
                return [2 /*return*/];
        }
    });
}); });
it('texts feedback', function () { return __awaiter(void 0, void 0, void 0, function () {
    var incomingText, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                incomingText = {
                    Body: 'The meals are delicious',
                    From: from,
                    To: phone_1.REGIONS['WEST_OAKLAND'],
                };
                return [4 /*yield*/, supertest_1.default(index_1.default)
                        .post('/api/text/incoming')
                        .send(incomingText)
                        .expect(200)];
            case 1:
                res = _a.sent();
                expect(res.text).toEqual(textResponses_1.default.feedbackResponse(from));
                return [2 /*return*/];
        }
    });
}); });
it('unsubscribes', function () { return __awaiter(void 0, void 0, void 0, function () {
    var number, cancelText, updatedNumber;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, phone_1.Phone.findOne({ number: from })];
            case 1:
                number = _a.sent();
                expect(number === null || number === void 0 ? void 0 : number.region.length).toEqual(2);
                cancelText = {
                    Body: 'stop',
                    From: from,
                    To: phone_1.REGIONS['EAST_OAKLAND'],
                };
                return [4 /*yield*/, supertest_1.default(index_1.default).post('/api/text/incoming').send(cancelText)];
            case 2:
                _a.sent();
                return [4 /*yield*/, phone_1.Phone.findOne({ number: from })];
            case 3:
                updatedNumber = _a.sent();
                expect(updatedNumber === null || updatedNumber === void 0 ? void 0 : updatedNumber.region.length).toEqual(1);
                return [2 /*return*/];
        }
    });
}); });
it('un-unsubscribes', function () { return __awaiter(void 0, void 0, void 0, function () {
    var incomingText, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                incomingText = {
                    Body: 'signup',
                    From: from,
                    To: phone_1.REGIONS['EAST_OAKLAND'],
                };
                return [4 /*yield*/, supertest_1.default(index_1.default)
                        .post('/api/text/incoming')
                        .send(incomingText)
                        .expect(200)];
            case 1:
                res = _a.sent();
                expect(res.text).toEqual(textResponses_1.default.signUpResponse('EAST_OAKLAND', from));
                return [2 /*return*/];
        }
    });
}); });
