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
var express_1 = __importDefault(require("express"));
var current_user_1 = require("../../middlewares/current-user");
var require_auth_1 = require("../../middlewares/require-auth");
var fetcher_1 = __importDefault(require("../../services/fetcher"));
var urls_1 = __importDefault(require("../../services/urls"));
var email_1 = require("../../services/email");
var router = express_1.default.Router();
router.get('/hours', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, query, hoursQueryUri, response, hours;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
            case 1:
                _c.sent();
                id = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.salesforceId;
                query = "SELECT Id, GW_Volunteers__Status__c, Number_of_Meals__c, GW_Volunteers__Shift_Start_Date_Time__c, GW_Volunteers__Volunteer_Job__c from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Contact__c = '" + id + "' AND (GW_Volunteers__Status__c = 'Confirmed' OR GW_Volunteers__Status__c = 'Completed')";
                hoursQueryUri = urls_1.default.SFQueryPrefix + encodeURIComponent(query);
                return [4 /*yield*/, fetcher_1.default.get(hoursQueryUri)];
            case 2:
                response = _c.sent();
                if (!((_b = response.data) === null || _b === void 0 ? void 0 : _b.records)) {
                    throw Error('Could not query volunteer hours');
                }
                hours = response.data.records.map(function (h) {
                    var mealCount = h.Number_of_Meals__c;
                    if (!mealCount) {
                        mealCount = 0;
                    }
                    return {
                        id: h.Id,
                        mealCount: mealCount.toString(),
                        time: h.GW_Volunteers__Shift_Start_Date_Time__c,
                        job: h.GW_Volunteers__Volunteer_Job__c,
                        status: h.GW_Volunteers__Status__c,
                    };
                });
                res.send(hours);
                return [2 /*return*/];
        }
    });
}); });
router.post('/hours', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mealCount, shiftId, jobId, date, salesforceId, chef;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, mealCount = _a.mealCount, shiftId = _a.shiftId, jobId = _a.jobId, date = _a.date;
                salesforceId = (_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.salesforceId;
                if (!salesforceId) {
                    throw Error('User does not have a salesforce ID');
                }
                return [4 /*yield*/, createHours({
                        contactId: salesforceId,
                        mealCount: mealCount,
                        shiftId: shiftId,
                        jobId: jobId,
                        date: date,
                    })];
            case 1:
                chef = _c.sent();
                return [4 /*yield*/, email_1.sendShiftSignupEmail(chef.Email)];
            case 2:
                _c.sent();
                res.status(201);
                res.send(shiftId);
                return [2 /*return*/];
        }
    });
}); });
router.patch('/hours/:id', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, mealCount, cancel, hoursToUpdate, hoursUpdateUri;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, mealCount = _a.mealCount, cancel = _a.cancel;
                return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
            case 1:
                _b.sent();
                hoursToUpdate = {
                    Number_of_Meals__c: mealCount,
                };
                if (cancel) {
                    hoursToUpdate.GW_Volunteers__Status__c = 'Canceled';
                }
                hoursUpdateUri = urls_1.default.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c/' + id;
                return [4 /*yield*/, fetcher_1.default.patch(hoursUpdateUri, hoursToUpdate)];
            case 2:
                _b.sent();
                res.send({ id: id, mealCount: mealCount });
                return [2 /*return*/];
        }
    });
}); });
var createHours = function (_a) {
    var contactId = _a.contactId, shiftId = _a.shiftId, mealCount = _a.mealCount, jobId = _a.jobId, date = _a.date;
    return __awaiter(void 0, void 0, void 0, function () {
        var data, hoursToAdd, hoursInsertUri, insertRes, res;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, fetcher_1.default.get(urls_1.default.SFOperationPrefix + '/GW_Volunteers__Volunteer_Shift__c/' + shiftId)];
                case 2:
                    data = (_c.sent()).data;
                    if (data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === 0) {
                        throw new Error('This shift has no available slots');
                    }
                    hoursToAdd = {
                        GW_Volunteers__Contact__c: contactId,
                        GW_Volunteers__Volunteer_Shift__c: shiftId,
                        GW_Volunteers__Status__c: 'Confirmed',
                        Number_of_Meals__c: mealCount,
                        GW_Volunteers__Volunteer_Job__c: jobId,
                        GW_Volunteers__Start_Date__c: date,
                    };
                    hoursInsertUri = urls_1.default.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c';
                    return [4 /*yield*/, fetcher_1.default.post(hoursInsertUri, hoursToAdd)];
                case 3:
                    insertRes = _c.sent();
                    if (!((_b = insertRes.data) === null || _b === void 0 ? void 0 : _b.success)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fetcher_1.default.get(urls_1.default.SFOperationPrefix + '/Contact/' + contactId)];
                case 4:
                    res = _c.sent();
                    return [2 /*return*/, res.data];
                case 5: throw new Error('Unable to insert hours!');
            }
        });
    });
};
exports.default = router;
