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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var moment_1 = __importDefault(require("moment"));
var html_entities_1 = require("html-entities");
var current_user_1 = require("../../middlewares/current-user");
var require_auth_1 = require("../../middlewares/require-auth");
var createHours_1 = __importDefault(require("./createHours"));
var email_1 = require("../../services/email");
var urls_1 = __importDefault(require("../../services/urls"));
var fetcher_1 = __importDefault(require("../../services/fetcher"));
var router = express_1.default.Router();
router.get('/job-listing', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var jobs, renamedJobs, shifts, shiftPromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
            case 1:
                _a.sent();
                return [4 /*yield*/, getJobs(urls_1.default.townFridgeCampaignId)];
            case 2:
                jobs = _a.sent();
                renamedJobs = jobs.map(function (j) {
                    var _a;
                    // rename attributes to something sane
                    return {
                        id: j.Id,
                        name: j.Name,
                        shifts: [],
                        location: html_entities_1.decode((_a = j.GW_Volunteers__Location_Information__c) === null || _a === void 0 ? void 0 : _a.replace('<p>', '').replace('</p>', '')),
                    };
                });
                shifts = [];
                shiftPromises = renamedJobs.map(function (j) { return __awaiter(void 0, void 0, void 0, function () {
                    var jobShifts;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getShifts(j.id)];
                            case 1:
                                jobShifts = _a.sent();
                                shifts.push.apply(shifts, __spread(jobShifts.map(function (js) {
                                    // rename attributes to something sane
                                    j.shifts.push(js.Id);
                                    return {
                                        id: js.Id,
                                        startTime: js.GW_Volunteers__Start_Date_Time__c,
                                        open: js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
                                        job: j.id,
                                    };
                                })));
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(shiftPromises)];
            case 3:
                _a.sent();
                res.send({ jobs: renamedJobs, shifts: shifts });
                return [2 /*return*/];
        }
    });
}); });
router.post('/job-listing', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, createHours_1.default({
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
var getJobs = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var query, jobQueryUri, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = "SELECT Id, Name, GW_Volunteers__Location_Information__c from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '" + id + "'";
                jobQueryUri = urls_1.default.SFQueryPrefix + encodeURIComponent(query);
                return [4 /*yield*/, fetcher_1.default.instance.get(jobQueryUri)];
            case 1:
                res = _a.sent();
                if (!res.data.records) {
                    throw Error('failed querying volunteer Jobs');
                }
                return [2 /*return*/, res.data.records];
        }
    });
}); };
var getShifts = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var ThirtyDaysFromNow, query, shiftQueryUri, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ThirtyDaysFromNow = moment_1.default().add(30, 'day').format();
                query = "SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '" + id + "' AND GW_Volunteers__Start_Date_time__c >= TODAY AND  GW_Volunteers__Start_Date_time__c <= " + ThirtyDaysFromNow;
                shiftQueryUri = urls_1.default.SFQueryPrefix + encodeURIComponent(query);
                return [4 /*yield*/, fetcher_1.default.instance.get(shiftQueryUri)];
            case 1:
                res = _a.sent();
                if (!res.data.records) {
                    throw Error('Failed querying volunteer shifts');
                }
                return [2 /*return*/, res.data.records];
        }
    });
}); };
exports.default = router;
