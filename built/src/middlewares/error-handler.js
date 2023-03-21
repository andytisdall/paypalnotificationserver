"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var errorHandler = function (err, req, res, next) {
    var _a, _b, _c, _d;
    var message = err.message;
    if ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) {
        message = JSON.stringify((_b = err.response) === null || _b === void 0 ? void 0 : _b.data);
    }
    else if ((_c = err.response) === null || _c === void 0 ? void 0 : _c.body) {
        message = JSON.stringify((_d = err.response) === null || _d === void 0 ? void 0 : _d.body);
    }
    console.error(err);
    if (res.statusCode === 200) {
        res.status(400);
    }
    res.send({ error: message });
};
exports.errorHandler = errorHandler;
