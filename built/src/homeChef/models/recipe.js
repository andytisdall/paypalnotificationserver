"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recipe = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var recipeSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    description: String,
    image: String,
    author: String,
    category: { type: String, required: true },
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
exports.Recipe = mongoose_1.default.model('Recipe', recipeSchema);
