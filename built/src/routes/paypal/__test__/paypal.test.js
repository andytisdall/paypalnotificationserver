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
var generate_password_1 = require("generate-password");
it('processes a donation w/o an exisiting contact', function () { return __awaiter(void 0, void 0, void 0, function () {
    var randomFirstname, randomLastname;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                randomFirstname = generate_password_1.generate({
                    length: 5,
                });
                randomLastname = generate_password_1.generate({
                    length: 5,
                });
                return [4 /*yield*/, supertest_1.default(index_1.default)
                        .post('/api/paypal')
                        .send({
                        payment_gross: '100.23',
                        payment_fee: '2.50',
                        payment_date: 'August 3rd, 2022, 00:00:00 PST',
                        first_name: randomFirstname,
                        last_name: randomLastname,
                        payer_email: randomFirstname + '@fake.com',
                        ipn_track_id: '1',
                    })
                        .expect(200)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// it('processes a donation with an existing contact', async () => {
//   await request(app)
//     .post('/api/paypal')
//     .send({
//       payment_gross: '54.21',
//       payment_fee: '0.90',
//       payment_date: 'February 20th, 2022, 00:00:00 PST',
//       first_name: 'Joe',
//       last_name: 'Duplicate',
//       payer_email: 'joe@duplicate.fake',
//       ipn_track_id: '2',
//     })
//     .expect(200);
// });
// it('processes a new recurring donation', async () => {
//   await request(app)
//     .post('/api/paypal')
//     .send({
//       txn_type: 'recurring_payment_profile_created',
//       amount: '50.00',
//       time_created: 'June 20th, 2022, 00:00:00 PST',
//       first_name: 'Robert',
//       last_name: 'De Niro',
//       payer_email: 'rob@deniro.com',
//       payment_cycle: 'Monthly',
//       ipn_track_id: '3',
//     })
//     .expect(200);
// });
// it('processes an installment of a recurring donation', async () => {
//   await request(app)
//     .post('/api/paypal')
//     .send({
//       amount_per_cycle: '50.00',
//       payment_gross: '50.00',
//       payment_fee: '5.90',
//       payment_date: 'September 20th, 2022, 00:00:00 PST',
//       first_name: 'Robert',
//       last_name: 'De Niro',
//       payer_email: 'rob@deniro.com',
//       ipn_track_id: '4',
//     })
//     .expect(200);
// });
// it('processes a skipped payment', async () => {
//   await request(app)
//     .post('/api/paypal')
//     .send({
//       txn_type: 'recurring_payment_skipped',
//       payment_gross: '54.21',
//       payment_fee: '0.90',
//       payment_date: 'February 20th, 2022, 00:00:00 PST',
//       first_name: 'Robert',
//       last_name: 'De Niro',
//       payer_email: 'rob@deniro.com',
//       ipn_track_id: '5',
//     })
//     .expect(200);
// });
// it('processes a canceled recurring donation', async () => {
//   await request(app)
//     .post('/api/paypal')
//     .send({
//       txn_type: 'recurring_payment_suspended_due_to_max_failed_payment',
//       amount_per_cycle: '54.21',
//       payment_fee: '0.90',
//       payment_date: 'February 20th, 2022, 00:00:00 PST',
//       first_name: 'Robert',
//       last_name: 'De Niro',
//       payer_email: 'rob@deniro.com',
//       ipn_track_id: '6',
//     })
//     .expect(200);
// });
