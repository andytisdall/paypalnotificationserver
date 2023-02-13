"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var restaurantSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    salesforceId: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
exports.Restaurant = mongoose_1.default.model('Restaurant', restaurantSchema);
