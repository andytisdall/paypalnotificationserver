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
var mongodb_1 = __importDefault(require("mongodb"));
var mongoose_1 = __importDefault(require("mongoose"));
var current_user_1 = require("../../middlewares/current-user");
var require_auth_1 = require("../../middlewares/require-auth");
var require_admin_1 = require("../../middlewares/require-admin");
var uploadFilesToSalesforce_1 = require("../../files/uploadFilesToSalesforce");
var SFQuery_1 = require("../../utils/salesforce/SFQuery");
var User = mongoose_1.default.model('User');
var Restaurant = mongoose_1.default.model('Restaurant');
var router = express_1.default.Router();
router.post('/', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, userId, salesforceId, user, newRestaurant;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, userId = _a.userId, salesforceId = _a.salesforceId;
                return [4 /*yield*/, User.findById(userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    throw new Error('User not found!');
                }
                newRestaurant = new Restaurant({ name: name, user: user, salesforceId: salesforceId });
                return [4 /*yield*/, newRestaurant.save()];
            case 2:
                _b.sent();
                res.status(201).send(newRestaurant);
                return [2 /*return*/];
        }
    });
}); });
router.get('/', current_user_1.currentUser, require_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurant, account, onboardingDocs, completedDocs, extraInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Restaurant.findOne({ user: req.currentUser.id })];
            case 1:
                restaurant = _a.sent();
                if (!restaurant) {
                    return [2 /*return*/, res.sendStatus(200)];
                }
                return [4 /*yield*/, SFQuery_1.getAccountById(restaurant.salesforceId)];
            case 2:
                account = _a.sent();
                onboardingDocs = account.Meal_Program_Onboarding__c;
                completedDocs = onboardingDocs ? onboardingDocs.split(';') : [];
                extraInfo = {
                    completedDocs: completedDocs,
                    remainingDocs: Object.values(uploadFilesToSalesforce_1.restaurantFileInfo)
                        .map(function (f) { return f.title; })
                        .filter(function (d) { return !completedDocs.includes(d); }),
                };
                return [2 /*return*/, res.send({ restaurant: restaurant, extraInfo: extraInfo })];
        }
    });
}); });
router.get('/all', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurants;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Restaurant.find()];
            case 1:
                restaurants = _a.sent();
                res.send(restaurants);
                return [2 /*return*/];
        }
    });
}); });
router.get('/:restaurantId', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, restaurant;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                restaurantId = req.params.restaurantId;
                return [4 /*yield*/, Restaurant.findById(restaurantId)];
            case 1:
                restaurant = _a.sent();
                if (!restaurant) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                if (restaurant.user !== new mongodb_1.default.ObjectId(req.currentUser.id) &&
                    !req.currentUser.admin) {
                    return [2 /*return*/, res.sendStatus(403)];
                }
                return [2 /*return*/, res.send(restaurant)];
        }
    });
}); });
router.patch('/', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, restaurantId, name, salesforceId, userId, rest;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, restaurantId = _a.restaurantId, name = _a.name, salesforceId = _a.salesforceId, userId = _a.userId;
                return [4 /*yield*/, Restaurant.findById(restaurantId)];
            case 1:
                rest = _b.sent();
                if (!rest) {
                    throw Error('Restaurant not found');
                }
                if (name) {
                    rest.name = name;
                }
                if (salesforceId) {
                    rest.salesforceId = salesforceId;
                }
                if (userId) {
                    rest.user = userId;
                }
                return [4 /*yield*/, rest.save()];
            case 2:
                _b.sent();
                res.send(rest);
                return [2 /*return*/];
        }
    });
}); });
router.delete('/:id', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, Restaurant.deleteOne({ _id: id })];
            case 1:
                _a.sent();
                res.send(id);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
