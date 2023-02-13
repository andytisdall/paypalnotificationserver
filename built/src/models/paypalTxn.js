"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaypalTxn = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var paypalTxnSchema = new mongoose_1.default.Schema({
    txnId: String,
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
exports.PaypalTxn = mongoose_1.default.model('PaypalTxn', paypalTxnSchema);
