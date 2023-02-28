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
var storeFile_1 = require("../../files/storeFile");
var Recipe = mongoose_1.default.model('Recipe');
var router = express_1.default.Router();
router.get('/recipes', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var recipes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Recipe.find()];
            case 1:
                recipes = _a.sent();
                res.send(recipes);
                return [2 /*return*/];
        }
    });
}); });
router.get('/recipe/:recipeId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var recipeId, recipe;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                recipeId = req.params.recipeId;
                return [4 /*yield*/, Recipe.findById(recipeId)];
            case 1:
                recipe = _a.sent();
                if (!recipe) {
                    res.status(404);
                    throw new Error('Recipe not found');
                }
                res.send(recipe);
                return [2 /*return*/];
        }
    });
}); });
var formatSections = function (field) {
    return JSON.parse(field).map(function (item) {
        return { header: item.header, text: item.text.split('\n') };
    });
};
router.post('/recipe', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, ingredients, instructions, description, category, author, image, fileName, newRecipe;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, name = _a.name, ingredients = _a.ingredients, instructions = _a.instructions, description = _a.description, category = _a.category, author = _a.author;
                image = '';
                if (!(((_b = req.files) === null || _b === void 0 ? void 0 : _b.photo) && !Array.isArray(req.files.photo))) return [3 /*break*/, 2];
                fileName = 'recipes-' + name;
                return [4 /*yield*/, storeFile_1.storeFile({
                        file: req.files.photo,
                        name: fileName,
                    })];
            case 1:
                image = _c.sent();
                _c.label = 2;
            case 2:
                newRecipe = new Recipe({
                    name: name,
                    ingredients: formatSections(ingredients),
                    instructions: formatSections(instructions),
                    description: description === null || description === void 0 ? void 0 : description.split('\n'),
                    category: category,
                    image: image,
                    author: author,
                });
                return [4 /*yield*/, newRecipe.save()];
            case 3:
                _c.sent();
                res.status(201).send(newRecipe);
                return [2 /*return*/];
        }
    });
}); });
router.patch('/recipe/:id', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var recipeId, _a, name, ingredients, instructions, description, category, author, recipe, fileName, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                recipeId = req.params.id;
                _a = req.body, name = _a.name, ingredients = _a.ingredients, instructions = _a.instructions, description = _a.description, category = _a.category, author = _a.author;
                return [4 /*yield*/, Recipe.findById(recipeId)];
            case 1:
                recipe = _d.sent();
                if (!recipe) {
                    res.status(404);
                    throw new Error('Recipe not found');
                }
                if (name) {
                    recipe.name = name;
                }
                if (ingredients) {
                    recipe.ingredients = formatSections(ingredients);
                }
                if (instructions) {
                    recipe.instructions = formatSections(ingredients);
                }
                recipe.author = author;
                recipe.category = category;
                recipe.description = description === null || description === void 0 ? void 0 : description.split('\n');
                if (!(((_c = req.files) === null || _c === void 0 ? void 0 : _c.photo) && !Array.isArray(req.files.photo))) return [3 /*break*/, 5];
                if (!recipe.image) return [3 /*break*/, 3];
                return [4 /*yield*/, storeFile_1.deleteFile(recipe.image)];
            case 2:
                _d.sent();
                _d.label = 3;
            case 3:
                fileName = 'recipes-' + name;
                _b = recipe;
                return [4 /*yield*/, storeFile_1.storeFile({
                        file: req.files.photo,
                        name: fileName,
                    })];
            case 4:
                _b.image = _d.sent();
                _d.label = 5;
            case 5: return [4 /*yield*/, recipe.save()];
            case 6:
                _d.sent();
                res.send(recipe);
                return [2 /*return*/];
        }
    });
}); });
router.delete('/recipe/:id', current_user_1.currentUser, require_auth_1.requireAuth, require_admin_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, Recipe.deleteOne({ _id: id })];
            case 1:
                _a.sent();
                res.sendStatus(204);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
