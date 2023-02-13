"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var axios_1 = require("axios");
var errorHandler = function (err, req, res, next) {
    var _a;
    console.error(err);
    if (err instanceof axios_1.AxiosError) {
        console.log((_a = err.response) === null || _a === void 0 ? void 0 : _a.data);
    }
    if (res.statusCode === 200) {
        res.status(400);
    }
    res.send({ error: err.message });
};
exports.errorHandler = errorHandler;
