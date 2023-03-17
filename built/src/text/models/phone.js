"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = exports.DROPOFF_NUMBER = exports.REGIONS = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
exports.REGIONS = {
    WEST_OAKLAND: '+15105297288',
    EAST_OAKLAND: '+15109301159',
};
exports.DROPOFF_NUMBER = '+15106944697';
var phoneSchema = new mongoose_1.default.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
    },
    region: [
        {
            type: String,
        },
    ],
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
exports.Phone = mongoose_1.default.model('Phone', phoneSchema);
