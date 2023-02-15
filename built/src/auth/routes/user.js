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
var mongoose_1 = __importDefault(require("mongoose"));
var current_user_1 = require("../../middlewares/current-user");
var require_auth_1 = require("../../middlewares/require-auth");
var require_admin_1 = require("../../middlewares/require-admin");
var SFQuery_1 = require("../../services/salesforce/SFQuery");
var User = mongoose_1.default.model('User');
var router = express_1.default.Router();
router.get('/', current_user_1.currentUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!req.currentUser) {
            return [2 /*return*/, res.send(null)];
        }
        res.send(req.currentUser);
        return [2 /*return*/];
    });
}); });
router.get('/userInfo', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var contact;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.currentUser.salesforceId) {
                    return [2 /*return*/, res.send(null)];
                }
                return [4 /*yield*/, SFQuery_1.getContactById(req.currentUser.salesforceId)];
            case 1:
                contact = _a.sent();
                res.send({
                    firstName: contact.FirstName,
                    lastName: contact.LastName,
                    volunteerAgreement: contact.Home_Chef_Volunteeer_Agreement__c,
                    foodHandler: contact.Home_Chef_Food_Handler_Certification__c,
                    homeChefStatus: contact.Home_Chef_Status__c,
                });
                return [2 /*return*/];
        }
    });
}); });
router.get('/all', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var allUsers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User.find()];
            case 1:
                allUsers = _a.sent();
                res.send(allUsers);
                return [2 /*return*/];
        }
    });
}); });
router.post('/', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, salesforceId, existingUsername, newUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password, salesforceId = _a.salesforceId;
                return [4 /*yield*/, User.findOne({ username: username })];
            case 1:
                existingUsername = _b.sent();
                if (existingUsername) {
                    return [2 /*return*/, res.status(400).send('Username is in use')];
                }
                newUser = new User({ username: username, password: password, salesforceId: salesforceId });
                return [4 /*yield*/, newUser.save()];
            case 2:
                _b.sent();
                res.status(201).send(newUser);
                return [2 /*return*/];
        }
    });
}); });
router.patch('/', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, username, password, salesforceId, householdId, u;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, userId = _a.userId, username = _a.username, password = _a.password, salesforceId = _a.salesforceId, householdId = _a.householdId;
                if (!username && !password) {
                    res.status(400);
                    throw new Error('No username or password provided');
                }
                return [4 /*yield*/, User.findById(userId)];
            case 1:
                u = _b.sent();
                if (!u) {
                    throw Error('User not found');
                }
                if (u.id !== req.currentUser.id && !req.currentUser.admin) {
                    res.status(403);
                    throw new Error('User not authorized to modify this user');
                }
                if (u.id !== req.currentUser.id && u.admin) {
                    res.status(403);
                    throw new Error('Admin users can only be modified by themselves');
                }
                if (username && username !== u.username) {
                    u.username = username;
                }
                if (password) {
                    u.password = password;
                }
                if (salesforceId) {
                    u.salesforceId = salesforceId;
                }
                if (u.id === req.currentUser.id && !u.active) {
                    u.active = true;
                }
                return [4 /*yield*/, u.save()];
            case 2:
                _b.sent();
                res.send(u);
                return [2 /*return*/];
        }
    });
}); });
router.delete('/:userId', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User.deleteOne({ _id: req.params.userId })];
            case 1:
                _a.sent();
                res.sendStatus(204);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
