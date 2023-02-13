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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var secret_manager_1 = require("@google-cloud/secret-manager");
var keys_1 = __importDefault(require("../../keys"));
exports.default = (function (nameList) { return __awaiter(void 0, void 0, void 0, function () {
    var secrets, secretClient, projectId, getSecret, nameList_1, nameList_1_1, secretName, _a, _b, e_1_1, _c, nameList_2, nameList_2_1, secretName;
    var e_1, _d, e_2, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                secrets = {};
                secretClient = new secret_manager_1.SecretManagerServiceClient();
                _f.label = 1;
            case 1:
                _f.trys.push([1, 13, , 14]);
                return [4 /*yield*/, secretClient.getProjectId()];
            case 2:
                projectId = _f.sent();
                if (!projectId) return [3 /*break*/, 11];
                getSecret = function (name) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, version;
                    var _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0: return [4 /*yield*/, secretClient.accessSecretVersion({
                                    name: "projects/385802469502/secrets/" + name + "/versions/latest",
                                })];
                            case 1:
                                _a = __read.apply(void 0, [_d.sent(), 1]), version = _a[0];
                                return [2 /*return*/, (_c = (_b = version.payload) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.toString()];
                        }
                    });
                }); };
                _f.label = 3;
            case 3:
                _f.trys.push([3, 8, 9, 10]);
                nameList_1 = __values(nameList), nameList_1_1 = nameList_1.next();
                _f.label = 4;
            case 4:
                if (!!nameList_1_1.done) return [3 /*break*/, 7];
                secretName = nameList_1_1.value;
                _a = secrets;
                _b = secretName;
                return [4 /*yield*/, getSecret(secretName)];
            case 5:
                _a[_b] = _f.sent();
                _f.label = 6;
            case 6:
                nameList_1_1 = nameList_1.next();
                return [3 /*break*/, 4];
            case 7: return [3 /*break*/, 10];
            case 8:
                e_1_1 = _f.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 10];
            case 9:
                try {
                    if (nameList_1_1 && !nameList_1_1.done && (_d = nameList_1.return)) _d.call(nameList_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 10: return [3 /*break*/, 12];
            case 11: throw Error();
            case 12: return [3 /*break*/, 14];
            case 13:
                _c = _f.sent();
                try {
                    for (nameList_2 = __values(nameList), nameList_2_1 = nameList_2.next(); !nameList_2_1.done; nameList_2_1 = nameList_2.next()) {
                        secretName = nameList_2_1.value;
                        secrets[secretName] = keys_1.default[secretName];
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (nameList_2_1 && !nameList_2_1.done && (_e = nameList_2.return)) _e.call(nameList_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/, secrets];
        }
    });
}); });
