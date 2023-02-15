"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFile = void 0;
var stream_1 = __importDefault(require("stream"));
var bucket_1 = require("./bucket");
var storeFile = function (_a) {
    var data = _a.data, name = _a.name;
    var file = bucket_1.bucket.file(name);
    var passthroughStream = new stream_1.default.PassThrough();
    passthroughStream.write(data);
    passthroughStream.end();
    passthroughStream.pipe(file.createWriteStream());
    return new Promise(function (resolve, reject) {
        passthroughStream.on('error', function (err) {
            reject(err);
        });
        passthroughStream.on('finish', function () { return resolve(name); });
    });
};
exports.storeFile = storeFile;
