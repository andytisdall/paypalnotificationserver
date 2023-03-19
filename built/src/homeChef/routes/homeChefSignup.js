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
var generate_password_1 = __importDefault(require("generate-password"));
var SFQuery_1 = require("../../utils/salesforce/SFQuery");
var mongoose_1 = __importDefault(require("mongoose"));
var urls_1 = __importDefault(require("../../utils/urls"));
var User = mongoose_1.default.model('User');
var router = express_1.default.Router();
router.post('/signup', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, firstName, lastName, phoneNumber, instagramHandle, commit, foodHandler, daysAvailable, experience, attend, pickup, source, extraInfo, temporaryPassword, username, uniqueUsername, existingUser, i, formattedDays, contactInfo, existingContact, campaignMember, newUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, phoneNumber = _a.phoneNumber, instagramHandle = _a.instagramHandle, commit = _a.commit, foodHandler = _a.foodHandler, daysAvailable = _a.daysAvailable, experience = _a.experience, attend = _a.attend, pickup = _a.pickup, source = _a.source, extraInfo = _a.extraInfo;
                temporaryPassword = generate_password_1.default.generate({
                    length: 10,
                    numbers: true,
                });
                username = (firstName.charAt(0).toLowerCase() + lastName.toLowerCase()).replace(' ', '');
                uniqueUsername = username;
                return [4 /*yield*/, User.findOne({ username: username })];
            case 1:
                existingUser = _b.sent();
                i = 1;
                _b.label = 2;
            case 2:
                if (!existingUser) return [3 /*break*/, 4];
                uniqueUsername = username + i;
                return [4 /*yield*/, User.findOne({ username: uniqueUsername })];
            case 3:
                existingUser = _b.sent();
                i++;
                return [3 /*break*/, 2];
            case 4:
                formattedDays = Object.keys(daysAvailable)
                    .filter(function (d) { return daysAvailable[d]; })
                    .join(';') + ';';
                contactInfo = {
                    FirstName: firstName,
                    LastName: lastName,
                    Email: email,
                    HomePhone: phoneNumber,
                    GW_Volunteers__Volunteer_Availability__c: formattedDays,
                    GW_Volunteers__Volunteer_Skills__c: 'Cooking',
                    GW_Volunteers__Volunteer_Status__c: 'Prospective',
                    GW_Volunteers__Volunteer_Notes__c: extraInfo,
                    Instagram_Handle__c: instagramHandle,
                    Able_to_Commit__c: commit,
                    Able_to_get_food_handler_cert__c: foodHandler,
                    Cooking_Experience__c: experience === 'None' ? null : experience,
                    Able_to_attend_orientation__c: attend,
                    Meal_Transportation__c: pickup,
                    How_did_they_hear_about_CK__c: source,
                    Portal_Username__c: uniqueUsername,
                    Portal_Temporary_Password__c: temporaryPassword,
                    Home_Chef_Status__c: 'Prospective',
                };
                return [4 /*yield*/, SFQuery_1.getContact(lastName, firstName)];
            case 5:
                existingContact = _b.sent();
                if (!existingContact) return [3 /*break*/, 7];
                return [4 /*yield*/, SFQuery_1.updateContact(existingContact.id, contactInfo)];
            case 6:
                _b.sent();
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, SFQuery_1.addContact(contactInfo)];
            case 8:
                // contact needs to be added first so that opp can have a contactid
                existingContact = _b.sent();
                _b.label = 9;
            case 9:
                campaignMember = {
                    CampaignId: urls_1.default.townFridgeCampaignId,
                    ContactId: existingContact.id,
                    Status: 'Confirmed',
                };
                return [4 /*yield*/, SFQuery_1.insertCampaignMember(campaignMember)];
            case 10:
                _b.sent();
                newUser = new User({
                    username: uniqueUsername,
                    password: temporaryPassword,
                    salesforceId: existingContact.id,
                });
                return [4 /*yield*/, newUser.save()];
            case 11:
                _b.sent();
                res.sendStatus(201);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
