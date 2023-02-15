"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = void 0;
var mongoose_1 = require("mongoose");
var feedbackSchema = new mongoose_1.Schema({
    message: String,
    date: { type: Date, default: Date.now() },
    sender: String,
    region: String,
    read: { type: Boolean, default: false },
    images: [String],
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
exports.Feedback = mongoose_1.model('Feedback', feedbackSchema);
