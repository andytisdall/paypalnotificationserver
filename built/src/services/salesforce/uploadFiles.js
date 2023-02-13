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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRestaurant = exports.uploadFiles = void 0;
var form_data_1 = __importDefault(require("form-data"));
var path_1 = __importDefault(require("path"));
var urls_1 = __importDefault(require("../urls"));
var fetcher_1 = __importDefault(require("../fetcher"));
var fileInfo = {
    BL: {
        title: 'Business License',
        description: '',
        folder: 'business-license',
    },
    HD: {
        title: 'Health Department Permit',
        description: '',
        folder: 'health-department-permit',
    },
    RC: { title: 'Restaurant Contract', description: '', folder: 'contract' },
    W9: { title: 'W9', description: '', folder: 'w9' },
    DD: {
        title: 'Direct Deposit Form',
        description: '',
        folder: 'direct-deposit',
    },
    HC: { title: 'Home Chef Contract', description: '', folder: 'home-chef' },
    FH: {
        title: 'Food Handler Certification',
        description: '',
        folder: 'home-chef',
    },
};
var uploadFiles = function (account, files) { return __awaiter(void 0, void 0, void 0, function () {
    var insertPromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
            case 1:
                _a.sent();
                insertPromises = files.map(function (f) { return insertFile(account, f); });
                return [4 /*yield*/, Promise.all(insertPromises)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.uploadFiles = uploadFiles;
var insertFile = function (account, file) { return __awaiter(void 0, void 0, void 0, function () {
    var typeOfFile, fileMetaData, postBody, contentVersionId, res, ContentDocumentId, accountId, CDLinkData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                typeOfFile = fileInfo[file.docType];
                fileMetaData = {
                    Title: typeOfFile.title,
                    Description: typeOfFile.description,
                    PathOnClient: account.name + '/' + typeOfFile.folder + path_1.default.extname(file.file.name),
                };
                postBody = new form_data_1.default();
                postBody.append('entity_document', JSON.stringify(fileMetaData), {
                    contentType: 'application/json',
                });
                postBody.append('VersionData', file.file.data, { filename: file.file.name });
                return [4 /*yield*/, fetcher_1.default.instance.post(urls_1.default.SFOperationPrefix + '/ContentVersion/', postBody, {
                        headers: postBody.getHeaders(),
                    })];
            case 1:
                res = _a.sent();
                console.log('Content Version created: ' + res.data.id);
                contentVersionId = res.data.id;
                return [4 /*yield*/, getDocumentId(contentVersionId)];
            case 2:
                ContentDocumentId = _a.sent();
                accountId = account.salesforceId;
                CDLinkData = {
                    ShareType: 'I',
                    LinkedEntityId: accountId,
                    ContentDocumentId: ContentDocumentId,
                };
                return [4 /*yield*/, fetcher_1.default.instance.post(urls_1.default.SFOperationPrefix + '/ContentDocumentLink/', CDLinkData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })];
            case 3:
                res = _a.sent();
                console.log('File Linked to Account: ' + res.data.id);
                return [2 /*return*/];
        }
    });
}); };
var getDocumentId = function (CVId) { return __awaiter(void 0, void 0, void 0, function () {
    var documentQuery, documentQueryUri, documentQueryResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                documentQuery = [
                    'SELECT',
                    'ContentDocumentId',
                    'from',
                    'ContentVersion',
                    'WHERE',
                    'Id',
                    '=',
                    "'" + CVId + "'",
                ];
                documentQueryUri = urls_1.default.SFQueryPrefix + documentQuery.join('+');
                return [4 /*yield*/, fetcher_1.default.instance.get(documentQueryUri)];
            case 1:
                documentQueryResponse = _a.sent();
                return [2 /*return*/, documentQueryResponse.data.records[0].ContentDocumentId];
        }
    });
}); };
var updateRestaurant = function (restaurantId, files, date) { return __awaiter(void 0, void 0, void 0, function () {
    var data, fileTitles, accountGetUri, res, existingDocuments, docs, accountUpdateUri, CDLinkQuery, CDLinkQueryUri, CDLinkQueryResponse, getPromises, ContentDocs, DocsToDelete, deletePromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetcher_1.default.setService('docusign');
                data = {};
                if (date) {
                    data.Health_Department_Expiration_Date__c = date;
                }
                fileTitles = files.map(function (f) { return fileInfo[f.docType].title; });
                accountGetUri = urls_1.default.SFOperationPrefix + '/Account/' + restaurantId;
                return [4 /*yield*/, fetcher_1.default.instance.get(accountGetUri)];
            case 1:
                res = _a.sent();
                existingDocuments = res.data.Meal_Program_Onboarding__c;
                if (existingDocuments) {
                    docs = __spread(new Set(__spread(existingDocuments.split(';'), fileTitles)));
                    data.Meal_Program_Onboarding__c = docs.join(';') + ';';
                }
                else {
                    data.Meal_Program_Onboarding__c = fileTitles.join(';') + ';';
                }
                accountUpdateUri = urls_1.default.SFOperationPrefix + '/Account/' + restaurantId;
                return [4 /*yield*/, fetcher_1.default.instance.patch(accountUpdateUri, data)];
            case 2:
                _a.sent();
                if (!existingDocuments) {
                    return [2 /*return*/];
                }
                CDLinkQuery = "SELECT Id, ContentDocumentId from ContentDocumentLink WHERE LinkedEntityId = '" + restaurantId + "'";
                CDLinkQueryUri = urls_1.default.SFQueryPrefix + encodeURIComponent(CDLinkQuery);
                return [4 /*yield*/, fetcher_1.default.instance.get(CDLinkQueryUri)];
            case 3:
                CDLinkQueryResponse = _a.sent();
                // then get all content documents from the CDIds in the cdlinks
                if (!CDLinkQueryResponse.data.records) {
                    throw Error('Failed querying for ContentDocumentLink');
                }
                getPromises = CDLinkQueryResponse.data.records.map(function (_a) {
                    var ContentDocumentId = _a.ContentDocumentId;
                    return __awaiter(void 0, void 0, void 0, function () {
                        var ContentDocUri, data;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    ContentDocUri = urls_1.default.SFOperationPrefix + '/ContentDocument/' + ContentDocumentId;
                                    return [4 /*yield*/, fetcher_1.default.instance.get(ContentDocUri)];
                                case 1:
                                    data = (_b.sent()).data;
                                    // then search those for the titles that we're replacing
                                    return [2 /*return*/, data];
                            }
                        });
                    });
                });
                return [4 /*yield*/, Promise.all(getPromises)];
            case 4:
                ContentDocs = _a.sent();
                DocsToDelete = ContentDocs.filter(function (cd) {
                    return fileTitles.includes(cd.Title);
                });
                deletePromises = DocsToDelete.map(function (cd) { return __awaiter(void 0, void 0, void 0, function () {
                    var ContentDocUri;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ContentDocUri = urls_1.default.SFOperationPrefix + '/ContentDocument/' + cd.Id;
                                return [4 /*yield*/, fetcher_1.default.instance.delete(ContentDocUri)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(deletePromises)];
            case 5:
                _a.sent();
                // and the links as well? or will it cascade
                return [2 /*return*/];
        }
    });
}); };
exports.updateRestaurant = updateRestaurant;
