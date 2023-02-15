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
var moment_1 = __importDefault(require("moment"));
var mongoose_1 = __importDefault(require("mongoose"));
var email_1 = require("../../services/email");
var SFQuery_1 = require("../../services/salesforce/SFQuery");
var urls_1 = __importDefault(require("../../services/urls"));
var fetcher_1 = __importDefault(require("../../services/fetcher"));
var PaypalTxn = mongoose_1.default.model('PaypalTxn');
var paypalRouter = express_1.default.Router();
// listener for paypal message
paypalRouter.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var paypalData, existingTxn, existingContact, contactToAdd, canceledSubscriptionStatuses, newTxn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                paypalData = req.body;
                return [4 /*yield*/, PaypalTxn.findOne({
                        txnId: paypalData.ipn_track_id,
                    })];
            case 1:
                existingTxn = _a.sent();
                if (existingTxn) {
                    console.log('Already processed this transaction, this is a duplicate');
                    return [2 /*return*/, res.sendStatus(200)];
                }
                if (paypalData.payment_gross && parseFloat(paypalData.payment_gross) < 0) {
                    console.log('not a credit');
                    return [2 /*return*/, res.sendStatus(200)];
                }
                // post a verification to paypal - not working
                // verifyPaypalMessage(paypalData);
                return [4 /*yield*/, fetcher_1.default.setService('salesforce')];
            case 2:
                // post a verification to paypal - not working
                // verifyPaypalMessage(paypalData);
                _a.sent();
                return [4 /*yield*/, getContactByEmail(paypalData.payer_email)];
            case 3:
                existingContact = _a.sent();
                if (!!existingContact) return [3 /*break*/, 5];
                contactToAdd = {
                    FirstName: paypalData.first_name,
                    LastName: paypalData.last_name,
                    Email: paypalData.payer_email,
                };
                return [4 /*yield*/, SFQuery_1.addContact(contactToAdd)];
            case 4:
                existingContact = _a.sent();
                _a.label = 5;
            case 5:
                canceledSubscriptionStatuses = [
                    'recurring_payment_suspended_due_to_max_failed_payment',
                    'recurring_payment_profile_cancel',
                    'recurring_payment_expired',
                    'recurring_payment_suspended',
                    'recurring_payment_failed',
                ];
                if (!(paypalData.txn_type === 'recurring_payment_profile_created')) return [3 /*break*/, 7];
                return [4 /*yield*/, addRecurring(paypalData, existingContact)];
            case 6:
                _a.sent();
                return [3 /*break*/, 16];
            case 7:
                if (!(paypalData.txn_type === 'recurring_payment_skipped')) return [3 /*break*/, 9];
                return [4 /*yield*/, updateRecurringOpp(paypalData, existingContact, 'Closed Lost')];
            case 8:
                _a.sent();
                return [3 /*break*/, 16];
            case 9:
                if (!canceledSubscriptionStatuses.includes(paypalData.txn_type)) return [3 /*break*/, 11];
                return [4 /*yield*/, cancelRecurring(paypalData, existingContact)];
            case 10:
                _a.sent();
                return [3 /*break*/, 16];
            case 11:
                if (!!paypalData.payment_date) return [3 /*break*/, 12];
                // catch all clause for unknown transaction type
                console.log('Unknown type of message: no payment date');
                return [3 /*break*/, 16];
            case 12:
                if (!paypalData.amount_per_cycle) return [3 /*break*/, 14];
                // if donation is recurring, pledged opp will already exist in sf
                // update payment amount and stage
                return [4 /*yield*/, updateRecurringOpp(paypalData, existingContact, 'Posted')];
            case 13:
                // if donation is recurring, pledged opp will already exist in sf
                // update payment amount and stage
                _a.sent();
                return [3 /*break*/, 16];
            case 14: 
            // insert opportunity
            return [4 /*yield*/, addDonation(paypalData, existingContact)];
            case 15:
                // insert opportunity
                _a.sent();
                _a.label = 16;
            case 16: 
            // thank you email
            return [4 /*yield*/, email_1.sendDonationAckEmail(paypalData)];
            case 17:
                // thank you email
                _a.sent();
                newTxn = new PaypalTxn({ txnId: paypalData.ipn_track_id });
                return [4 /*yield*/, newTxn.save()];
            case 18:
                _a.sent();
                // send paypal back a 200
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
var formatDate = function (date) {
    var splitDate = date.split(' ').filter(function (el, i, a) { return i !== a.length - 1; });
    return moment_1.default(splitDate, 'HH:mm:ss MMM D, YYYY').format();
};
// const verifyPaypalMessage = async (paypalData: PaypalData) => {
//   const paypalUrl = 'https://ipnpb.paypal.com/cgi-bin/webscr';
//   const verificationPost = new URLSearchParams();
//   verificationPost.append('cmd', '_notify_validate');
//   for (let field in paypalData) {
//     verificationPost.append(field, paypalData[field]);
//   }
//   try {
//     const paypalResponse = await axiosInstance.post(
//       paypalUrl,
//       verificationPost,
//       {
//         headers: {
//           'User-Agent': 'Node-IPN-VerificationScript',
//         },
//       }
//     );
//     // console.log(paypalResponse);
//     if (paypalResponse.data !== 'VERIFIED') {
//       console.log(paypalResponse);
//       return { success: true };
//     } else {
//       console.log('succccess');
//     }
//   } catch (err) {
//     paypalErrorReport(err);
//     return;
//   }
// };
var addRecurring = function (paypalData, contact) { return __awaiter(void 0, void 0, void 0, function () {
    var formattedDate, dayOfMonth, recurringToAdd, recurringInsertUri, response, summaryMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                formattedDate = formatDate(paypalData.time_created);
                dayOfMonth = moment_1.default(formattedDate).format('D');
                if (parseInt(dayOfMonth) === 31 ||
                    (moment_1.default(formattedDate).format('M') === '2' && parseInt(dayOfMonth) >= 28)) {
                    dayOfMonth = 'Last_Day';
                }
                recurringToAdd = {
                    npe03__Contact__c: contact.id,
                    npe03__Date_Established__c: formattedDate,
                    npe03__Amount__c: paypalData.amount,
                    npsp__RecurringType__c: 'Open',
                    npsp__Day_of_Month__c: dayOfMonth,
                    npe03__Installment_Period__c: paypalData.payment_cycle,
                    npsp__StartDate__c: moment_1.default().format(),
                };
                recurringInsertUri = urls_1.default.SFOperationPrefix + '/npe03__Recurring_Donation__c/';
                return [4 /*yield*/, fetcher_1.default.post(recurringInsertUri, recurringToAdd)];
            case 1:
                response = _a.sent();
                summaryMessage = {
                    success: response.data.success,
                    name: paypalData.first_name + " " + paypalData.last_name,
                };
                console.log('Recurring Donation Added: ' + JSON.stringify(summaryMessage));
                return [2 /*return*/];
        }
    });
}); };
var cancelRecurring = function (paypalData, contact) { return __awaiter(void 0, void 0, void 0, function () {
    var recurringQuery, recurringQueryUri, existingRecurring, recurringQueryResponse, recurringToUpdate, recurringUpdateUri, response, summaryMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                recurringQuery = [
                    'SELECT',
                    'Id',
                    'from',
                    'npe03__Recurring_Donation__c',
                    'WHERE',
                    'npe03__Contact__c',
                    '=',
                    "'" + contact.id + "'",
                ];
                recurringQueryUri = urls_1.default.SFQueryPrefix + recurringQuery.join('+');
                return [4 /*yield*/, fetcher_1.default.get(recurringQueryUri)];
            case 1:
                recurringQueryResponse = _a.sent();
                if (recurringQueryResponse.data.totalSize !== 0) {
                    existingRecurring = recurringQueryResponse.data.records[0];
                }
                if (!existingRecurring) return [3 /*break*/, 3];
                recurringToUpdate = {
                    npsp__Status__c: 'Closed',
                    npsp__ClosedReason__c: paypalData.txn_type.replace(/_/gi, ' '),
                    npsp__EndDate__c: moment_1.default().add(1, 'days'),
                };
                recurringUpdateUri = urls_1.default.SFOperationPrefix +
                    '/npe03__Recurring_Donation__c/' +
                    existingRecurring.Id;
                return [4 /*yield*/, fetcher_1.default.patch(recurringUpdateUri, recurringToUpdate)];
            case 2:
                response = _a.sent();
                summaryMessage = {
                    success: response.data.success,
                    name: paypalData.first_name + " " + paypalData.last_name,
                };
                console.log('Recurring Donation Canceled: ' + JSON.stringify(summaryMessage));
                return [3 /*break*/, 4];
            case 3:
                console.log('Recurring donation not found');
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
var updateRecurringOpp = function (paypalData, contact, status) { return __awaiter(void 0, void 0, void 0, function () {
    var oppQuery, oppQueryUri, existingOpp, oppQueryResponse, oppToUpdate, oppUpdateUri, response, summaryMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                oppQuery = [
                    'SELECT',
                    'Id',
                    'from',
                    'Opportunity',
                    'WHERE',
                    'npsp__Primary_Contact__c',
                    '=',
                    "'" + contact.id + "'",
                    'AND',
                    'StageName',
                    '=',
                    "'Pledged'",
                ];
                oppQueryUri = urls_1.default.SFQueryPrefix + oppQuery.join('+');
                return [4 /*yield*/, fetcher_1.default.get(oppQueryUri)];
            case 1:
                oppQueryResponse = _a.sent();
                if (oppQueryResponse.data.totalSize !== 0) {
                    existingOpp = oppQueryResponse.data.records[0];
                }
                if (!existingOpp) return [3 /*break*/, 3];
                oppToUpdate = {
                    StageName: status,
                    Amount: paypalData.payment_gross,
                };
                oppUpdateUri = urls_1.default.SFOperationPrefix + '/Opportunity/' + existingOpp.Id;
                return [4 /*yield*/, fetcher_1.default.patch(oppUpdateUri, oppToUpdate)];
            case 2:
                response = _a.sent();
                summaryMessage = {
                    success: response.status === 204,
                    name: paypalData.first_name + " " + paypalData.last_name,
                };
                console.log('Donation Updated: ' + JSON.stringify(summaryMessage));
                return [3 /*break*/, 4];
            case 3: return [2 /*return*/, console.log('Existing opportunity not found')];
            case 4: return [2 /*return*/];
        }
    });
}); };
var addDonation = function (paypalData, contact) { return __awaiter(void 0, void 0, void 0, function () {
    var formattedDate, oppToAdd, oppInsertUri, response, summaryMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // relevant data coming from paypal:
                // payment_gross - amount
                // payment_fee - fee
                // payment_date
                // payment_status
                // first_name
                // payer_email
                if (!paypalData.payment_date) {
                    throw Error('Could not add donation without a payment date');
                }
                formattedDate = formatDate(paypalData.payment_date);
                oppToAdd = {
                    Amount: paypalData.payment_gross,
                    AccountId: contact.householdId,
                    npsp__Primary_Contact__c: contact.id,
                    StageName: 'Posted',
                    CloseDate: formattedDate,
                    Name: paypalData.first_name + " " + paypalData.last_name + " Donation " + moment_1.default(formattedDate).format('M/D/YYYY'),
                    RecordTypeId: '0128Z000001BIZJQA4',
                    Processing_Fee__c: paypalData.payment_fee,
                };
                oppInsertUri = urls_1.default.SFOperationPrefix + '/Opportunity';
                return [4 /*yield*/, fetcher_1.default.post(oppInsertUri, oppToAdd)];
            case 1:
                response = _a.sent();
                summaryMessage = {
                    success: response.data.success,
                    amount: oppToAdd.Amount,
                    name: paypalData.first_name + " " + paypalData.last_name,
                    date: paypalData.payment_date,
                };
                console.log('Donation Added: ' + JSON.stringify(summaryMessage));
                return [2 /*return*/];
        }
    });
}); };
// this contact query just searches by email because people's names and
// email addresses don't always match up on paypal
var getContactByEmail = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var query, contactQueryUri, contactQueryResponse, contact;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                query = "SELECT Name, npsp__HHId__c, Id from Contact WHERE Email = '" + email + "'";
                contactQueryUri = urls_1.default.SFQueryPrefix + encodeURIComponent(query);
                return [4 /*yield*/, fetcher_1.default.get(contactQueryUri)];
            case 1:
                contactQueryResponse = _c.sent();
                if (((_b = (_a = contactQueryResponse.data) === null || _a === void 0 ? void 0 : _a.records) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                    return [2 /*return*/, null];
                }
                contact = contactQueryResponse.data.records[0];
                return [2 /*return*/, {
                        id: contact.Id,
                        householdId: contact.npsp__HHId__c,
                    }];
        }
    });
}); };
exports.default = paypalRouter;
