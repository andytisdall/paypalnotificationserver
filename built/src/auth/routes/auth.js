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
var getSecrets_1 = __importDefault(require("../../utils/getSecrets"));
var password_1 = require("../password");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var google_auth_library_1 = require("google-auth-library");
var SFQuery_1 = require("../../utils/salesforce/SFQuery");
var User = mongoose_1.default.model('User');
var router = express_1.default.Router();
router.post('/signin', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var JWT_KEY, _a, username, password, existingUser, passwordsMatch, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getSecrets_1.default(['JWT_KEY'])];
            case 1:
                JWT_KEY = (_b.sent()).JWT_KEY;
                if (!JWT_KEY) {
                    throw Error('No JWT key found');
                }
                _a = req.body, username = _a.username, password = _a.password;
                return [4 /*yield*/, User.findOne({ username: username })];
            case 2:
                existingUser = _b.sent();
                if (!existingUser) {
                    res.status(401);
                    throw new Error('Credentials Invalid');
                }
                return [4 /*yield*/, password_1.Password.compare(existingUser.password, password)];
            case 3:
                passwordsMatch = _b.sent();
                if (!passwordsMatch) {
                    res.status(401);
                    throw new Error('Credentials Invalid');
                }
                token = jsonwebtoken_1.default.sign({
                    id: existingUser.id,
                }, JWT_KEY);
                res.send({ user: existingUser, token: token });
                return [2 /*return*/];
        }
    });
}); });
router.post('/google-signin', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, JWT_KEY, GOOGLE_CLIENT_ID, credential, googleClient, ticket, googleProfile, existingUser, contact, JWT;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getSecrets_1.default([
                    'JWT_KEY',
                    'GOOGLE_CLIENT_ID',
                ])];
            case 1:
                _a = _b.sent(), JWT_KEY = _a.JWT_KEY, GOOGLE_CLIENT_ID = _a.GOOGLE_CLIENT_ID;
                if (!JWT_KEY) {
                    throw Error('No JWT key found');
                }
                if (!GOOGLE_CLIENT_ID) {
                    throw Error('No Google Client Id found');
                }
                credential = req.body.credential;
                googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
                return [4 /*yield*/, googleClient.verifyIdToken({
                        idToken: credential,
                        audience: GOOGLE_CLIENT_ID,
                    })];
            case 2:
                ticket = _b.sent();
                googleProfile = ticket.getPayload();
                if (!googleProfile ||
                    !googleProfile.email ||
                    !googleProfile.given_name ||
                    !googleProfile.family_name) {
                    throw Error('Could not get google profile');
                }
                return [4 /*yield*/, User.findOne({ googleId: googleProfile.sub })];
            case 3:
                existingUser = _b.sent();
                if (!!existingUser) return [3 /*break*/, 12];
                return [4 /*yield*/, SFQuery_1.getContact(googleProfile.family_name, googleProfile.given_name)];
            case 4:
                contact = _b.sent();
                if (!!contact) return [3 /*break*/, 6];
                return [4 /*yield*/, SFQuery_1.getContactByEmail(googleProfile.email)];
            case 5:
                contact = _b.sent();
                _b.label = 6;
            case 6:
                if (!contact) return [3 /*break*/, 11];
                if (!contact.portalUsername) return [3 /*break*/, 9];
                // check if they have username already?
                // assign existing user a google id
                console.log(contact);
                return [4 /*yield*/, User.findOne({ username: contact.portalUsername })];
            case 7:
                existingUser = _b.sent();
                if (!existingUser) {
                    // create user
                }
                existingUser.googleId = googleProfile.sub;
                return [4 /*yield*/, existingUser.save()];
            case 8:
                _b.sent();
                return [3 /*break*/, 10];
            case 9: 
            // create user?
            throw Error('Contact does not have portal username');
            case 10: return [3 /*break*/, 12];
            case 11: 
            //   // if contact not in sf
            //   // their google name and salesforce name don't match
            //   // have them give us the name they used to sign up for home chef
            //   // and email us i guess
            //   // so we can manually add the google id to the portal user
            throw Error('We could not find a person in our database based on your google profile');
            case 12:
                JWT = jsonwebtoken_1.default.sign({
                    id: existingUser.id,
                }, JWT_KEY);
                res.send({ user: existingUser, token: JWT });
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
