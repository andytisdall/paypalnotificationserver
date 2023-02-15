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
var axios_1 = __importDefault(require("axios"));
var urls_1 = __importDefault(require("./urls"));
var getDSJWT_1 = __importDefault(require("../docusign/getDSJWT"));
var getSFToken_1 = __importDefault(require("./salesforce/getSFToken"));
var fetcher = /** @class */ (function () {
    function fetcher() {
        this.instance = axios_1.default.create();
        this.token = { salesforce: undefined, docusign: undefined };
    }
    fetcher.prototype.setService = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var baseURL, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.service !== service)) return [3 /*break*/, 3];
                        this.service = service;
                        baseURL = urls_1.default[service];
                        this.instance.defaults.baseURL = baseURL;
                        token = this.token[this.service];
                        if (!token) return [3 /*break*/, 1];
                        this.instance.defaults.headers.common['Authorization'] = "Bearer " + token;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getToken()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    fetcher.prototype.getService = function () {
        return this.service;
    };
    fetcher.prototype.getToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.service === 'salesforce')) return [3 /*break*/, 2];
                        return [4 /*yield*/, getSFToken_1.default()];
                    case 1:
                        token = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(this.service === 'docusign')) return [3 /*break*/, 4];
                        return [4 /*yield*/, getDSJWT_1.default()];
                    case 3:
                        token = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!token) {
                            throw Error('Could not get token');
                        }
                        this.instance.defaults.headers.common['Authorization'] = "Bearer " + token;
                        this.instance.defaults.headers.common['Content-Type'] = 'application/json';
                        this.token[this.service] = token;
                        return [2 /*return*/];
                }
            });
        });
    };
    fetcher.prototype.get = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var res, err_1, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service) {
                            throw Error('Base url has not been set');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, this.instance.get(url, options)];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 3:
                        err_1 = _a.sent();
                        this.token[this.service] = undefined;
                        return [4 /*yield*/, this.getToken()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.instance.get(url, options)];
                    case 5:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    fetcher.prototype.post = function (url, body, options) {
        return __awaiter(this, void 0, void 0, function () {
            var res, err_2, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service) {
                            throw Error('Base url has not been set');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, this.instance.post(url, body, options)];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 3:
                        err_2 = _a.sent();
                        this.token[this.service] = undefined;
                        return [4 /*yield*/, this.getToken()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.instance.post(url, body, options)];
                    case 5:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    fetcher.prototype.patch = function (url, body, options) {
        return __awaiter(this, void 0, void 0, function () {
            var res, err_3, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service) {
                            throw Error('Base url has not been set');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, this.instance.patch(url, body, options)];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 3:
                        err_3 = _a.sent();
                        this.token[this.service] = undefined;
                        return [4 /*yield*/, this.getToken()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.instance.patch(url, body, options)];
                    case 5:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    fetcher.prototype.delete = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var res, err_4, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service) {
                            throw Error('Base url has not been set');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, this.instance.delete(url, options)];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 3:
                        err_4 = _a.sent();
                        this.token[this.service] = undefined;
                        return [4 /*yield*/, this.getToken()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.instance.delete(url, options)];
                    case 5:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return fetcher;
}());
exports.default = new fetcher();
