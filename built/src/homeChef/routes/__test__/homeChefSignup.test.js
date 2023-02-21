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
var mail_1 = __importDefault(require("@sendgrid/mail"));
var user_1 = require("../../../auth/models/user");
jest.mock('@sendgrid/mail');
afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.User.deleteOne({ username: 'rsanchez' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
it('correctly makes the portal user and salesforce contact when the interest form is submitted', function () { return __awaiter(void 0, void 0, void 0, function () {
    var formValues, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                formValues = {
                    email: 'test@fake.com',
                    firstName: 'Rocky',
                    lastName: 'Sanchez',
                    phoneNumber: '510-677-6867',
                    instagramHandle: '@rockysanchez',
                    commit: true,
                    foodHandler: false,
                    daysAvailable: {
                        Monday: true,
                        Tuesday: false,
                        Wednesday: true,
                        Thursday: false,
                    },
                    experience: 'None',
                    attend: true,
                    pickup: false,
                    source: 'Heard about it on the news',
                    extraInfo: "I'm super psyched to help!",
                };
                return [4 /*yield*/, supertest_1.default(index_1.default).post('/api/home-chef/signup').send(formValues).expect(201)];
            case 1:
                _a.sent();
                return [4 /*yield*/, user_1.User.findOne({ username: 'rsanchez' })];
            case 2:
                user = _a.sent();
                expect(user).toBeDefined();
                expect(user === null || user === void 0 ? void 0 : user.salesforceId).toBeDefined();
                expect(mail_1.default.send).toHaveBeenCalled();
                return [2 /*return*/];
        }
    });
}); });
it('correctly updates an existing contact and makes a user when the interest form is submitted', function () { return __awaiter(void 0, void 0, void 0, function () {
    var formValues, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                formValues = {
                    email: 'joe@duplicate.fake',
                    firstName: 'Joe',
                    lastName: 'Duplicate',
                    phoneNumber: '510-677-6867',
                    instagramHandle: '@joejoe',
                    commit: true,
                    foodHandler: false,
                    daysAvailable: {
                        Monday: true,
                        Tuesday: false,
                        Wednesday: true,
                        Thursday: false,
                    },
                    experience: 'None',
                    attend: true,
                    pickup: false,
                    source: 'Heard about it on the news',
                    extraInfo: "I'm super psyched to help!",
                };
                return [4 /*yield*/, supertest_1.default(index_1.default).post('/api/home-chef/signup').send(formValues).expect(201)];
            case 1:
                _a.sent();
                return [4 /*yield*/, user_1.User.findOne({ username: 'jduplicate' })];
            case 2:
                user = _a.sent();
                expect(user).toBeDefined();
                expect(user === null || user === void 0 ? void 0 : user.salesforceId).toBeDefined();
                expect(mail_1.default.send).toHaveBeenCalled();
                return [2 /*return*/];
        }
    });
}); });
// it('migrates existing users into the portal', async () => {
//   await migrate();
//   const user = await User.findOne({ username: 'rsanchez' });
//   expect(user?.username).toEqual('rsanchez');
// });
