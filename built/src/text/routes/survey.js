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
var urls_1 = __importDefault(require("../../utils/urls"));
var fetcher_1 = __importDefault(require("../../utils/fetcher"));
var router = express_1.default.Router();
router.post('/meal-survey', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mealName, location, taste, size, type, ingredients, days, phone, surveyData, insertUri, data;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, mealName = _a.mealName, location = _a.location, taste = _a.taste, size = _a.size, type = _a.type, ingredients = _a.ingredients, days = _a.days, phone = _a.phone;
                return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
            case 1:
                _b.sent();
                surveyData = {
                    Meal_Name__c: mealName,
                    Location__c: location,
                    Meal_Taste__c: taste,
                    Meal_Size__c: size,
                    Desired_Meal_Type__c: type,
                    Desired_Ingredients__c: ingredients,
                    Days_of_Use_Per_Week__c: days,
                    Phone_Number__c: phone,
                };
                insertUri = urls_1.default.SFOperationPrefix + '/Meal_Survey_Data__c';
                return [4 /*yield*/, fetcher_1.default.post(insertUri, surveyData)];
            case 2:
                data = (_b.sent()).data;
                if (!data.success) {
                    throw new Error('Could not save the survey results');
                }
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
router.post('/signup-survey', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, age, ethnicity, zip, type, ingredients, days, phone, calfresh, clientData, surveyData, CDInsertUri, CDRes, MSInsertUri, MSRes;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, age = _a.age, ethnicity = _a.ethnicity, zip = _a.zip, type = _a.type, ingredients = _a.ingredients, days = _a.days, phone = _a.phone, calfresh = _a.calfresh;
                return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
            case 1:
                _b.sent();
                clientData = {
                    Age__c: age,
                    Ethnicity__c: ethnicity,
                    Zip_Code__c: zip,
                    Phone_Number__c: phone,
                };
                surveyData = {
                    Desired_Meal_Type__c: type,
                    Desired_Ingredients__c: ingredients,
                    Days_of_Use_Per_Week__c: days,
                    Phone_Number__c: phone,
                    Interest_in_Calfresh__c: calfresh,
                };
                CDInsertUri = urls_1.default.SFOperationPrefix + '/Client_Data__c';
                return [4 /*yield*/, fetcher_1.default.post(CDInsertUri, clientData)];
            case 2:
                CDRes = _b.sent();
                if (!CDRes.data.success) {
                    throw new Error('Could not save the survey results');
                }
                MSInsertUri = urls_1.default.SFOperationPrefix + '/Meal_Survey_Data__c';
                return [4 /*yield*/, fetcher_1.default.post(MSInsertUri, surveyData)];
            case 3:
                MSRes = _b.sent();
                if (!MSRes.data.success) {
                    throw new Error('Could not save the survey results');
                }
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
