"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var errorHandler = function (err, req, res, next) {
    var _a, _b;
    console.error(err);
    if ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) {
        console.log(JSON.stringify((_b = err.response) === null || _b === void 0 ? void 0 : _b.data));
    }
    if (res.statusCode === 200) {
        res.status(400);
    }
    res.send({ error: err.message });
};
exports.errorHandler = errorHandler;
