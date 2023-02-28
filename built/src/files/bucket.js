"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
var storage_1 = require("@google-cloud/storage");
var urls_1 = __importDefault(require("../services/urls"));
var storage = new storage_1.Storage();
exports.bucket = storage.bucket(urls_1.default.fileBucket);
