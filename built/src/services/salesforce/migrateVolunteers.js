"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var axios = require('axios');
var passwordGenerator = require('generate-password');
var urls = require('../urls');
var getSFToken = require('./getSFToken');
var User = require('../../models/user').User;
var axiosInstance = axios.create({
    baseURL: urls.salesforce,
});
var migrate = function () { return __awaiter(void 0, void 0, void 0, function () {
    var token, contacts, promises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getSFToken()];
            case 1:
                token = _a.sent();
                axiosInstance.defaults.headers.common['Authorization'] = "Bearer " + token;
                axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
                return [4 /*yield*/, getContacts()];
            case 2:
                contacts = _a.sent();
                promises = contacts.map(updateContact, axiosInstance);
                return [4 /*yield*/, Promise.all(promises)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var updateContact = function (contact) { return __awaiter(void 0, void 0, void 0, function () {
    var username, temporaryPassword, contactUpdateUri;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = contact.FirstName.charAt(0).toLowerCase() + contact.LastName.toLowerCase();
                temporaryPassword = passwordGenerator.generate({
                    length: 10,
                    numbers: true,
                });
                contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + contact.Id;
                return [4 /*yield*/, axiosInstance.patch(contactUpdateUri, {
                        Portal_Username__c: username,
                        Portal_Temporary_Password__c: temporaryPassword,
                    })];
            case 1:
                _a.sent();
                return [4 /*yield*/, createUser(__assign(__assign({}, contact), { username: username, temporaryPassword: temporaryPassword }))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var createUser = function (contact) { return __awaiter(void 0, void 0, void 0, function () {
    var newUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                newUser = new User({
                    username: contact.username,
                    password: contact.temporaryPassword,
                    salesforceId: contact.Id,
                });
                return [4 /*yield*/, newUser.save()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var getContacts = function () { return __awaiter(void 0, void 0, void 0, function () {
    var query, contactQueryUri, contactQueryResponse, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = "SELECT Id, FirstName, LastName, npsp__HHId__c from Contact WHERE Home_Chef_Status__c = 'Prospective'";
                contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axiosInstance.get(contactQueryUri)];
            case 2:
                contactQueryResponse = _a.sent();
                return [2 /*return*/, contactQueryResponse.data.records];
            case 3:
                err_1 = _a.sent();
                console.log(err_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// const updateContactsToInvited = async () => {
//   const contacts = [
//     '0038Z000035F5YvQAK',
//     '0038Z000035IGpwQAG',
//     '0038Z000035IBTxQAO',
//     '0038Z000035IBTyQAO',
//     '0038Z000035IBTzQAO',
//     '0038Z000035IBU0QAO',
//     '0038Z000035IBU1QAO',
//     '0038Z000035IBU2QAO',
//     '0038Z000035IBU3QAO',
//     '0038Z000035IBU4QAO',
//     '0038Z000035IBU5QAO',
//     '0038Z000035IBU6QAO',
//     '0038Z000035IBU7QAO',
//     '0038Z000035IBU8QAO',
//     '0038Z000035IBU9QAO',
//     '0038Z000035IBUAQA4',
//     '0038Z000035IBUBQA4',
//     '0038Z000035IBUCQA4',
//     '0038Z000035IBUDQA4',
//     '0038Z000035IBUEQA4',
//     '0038Z000035IBUFQA4',
//     '0038Z000035IBUGQA4',
//     '0038Z000035IBUHQA4',
//     '0038Z00002z1r9yQAA',
//     '0038Z00002z1r9zQAA',
//     '0038Z00002z2QJ3QAM',
//     '0038Z000035Gsz0QAC',
//     '0038Z000035GszjQAC',
//     '0038Z000035Gsy7QAC',
//     '0038Z000035GuaPQAS',
//     '0038Z000035GKPyQAO',
//     '0038Z000035GKUPQA4',
//     '0038Z000035GLDkQAO',
//     '0038Z000035GKu1QAG',
//     '0038Z000035GKu2QAG',
//     '0038Z000035GKu3QAG',
//     '0038Z000035GKv8QAG',
//     '0038Z000035GKuDQAW',
//     '0038Z000035GKu4QAG',
//     '0038Z000035GKu5QAG',
//     '0038Z000035GKu6QAG',
//     '0038Z000035GKu7QAG',
//     '0038Z000035GKu8QAG',
//     '0038Z000035GKu9QAG',
//     '0038Z000035GKuAQAW',
//     '0038Z000035GKuBQAW',
//     '0038Z000035GKuCQAW',
//     '0038Z00002z3DeJQAU',
//     '0038Z000035HOIMQA4',
//     '0038Z000030UTrhQAG',
//     '0038Z000030UYB1QAO',
//     '0038Z000030UY9sQAG',
//     '0038Z000030UYCZQA4',
//     '0038Z000030UYCYQA4',
//     '0038Z000035GKPjQAO',
//     '0038Z000032klx1QAA',
//     '0038Z000035GL1eQAG',
//     '0038Z000030Unt4QAC',
//     '0038Z000030Us0cQAC',
//     '0038Z000032k1DYQAY',
//     '0038Z000032lCRcQAM',
//     '0038Z000032moNQQAY',
//     '0038Z000032moNRQAY',
//     '0038Z000032moNSQAY',
//     '0038Z000032moNTQAY',
//     '0038Z000032moNUQAY',
//     '0038Z000032moNVQAY',
//     '0038Z000032moNWQAY',
//     '0038Z000032moNXQAY',
//     '0038Z000032moNYQAY',
//     '0038Z000032moNZQAY',
//     '0038Z000032moNaQAI',
//     '0038Z000032moNbQAI',
//     '0038Z000032moNcQAI',
//     '0038Z000032moNdQAI',
//     '0038Z000032moNeQAI',
//   ];
//   const token = await getSFToken();
//   axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
//   const promises = contacts.map(async (id) => {
//     const contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + id;
//     await axiosInstance.patch(contactUpdateUri, {
//       Home_Chef_Status__c: 'Invited to Orientation',
//     });
//     console.log();
//   });
//   await Promise.all(promises);
// };
module.exports = migrate;
