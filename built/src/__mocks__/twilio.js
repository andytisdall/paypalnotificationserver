"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.twiml = void 0;
exports.default = {
    Twilio: jest.fn(function () {
        return {
            messages: {
                create: jest.fn(function () { return Promise.resolve(); }),
            },
        };
    }),
    webhook: jest.fn(function () { return function (req, res, next) { return next(); }; }),
};
exports.twiml = {
    MessagingResponse: jest.fn(function () {
        return {
            message: jest.fn(function (msg) {
                _this.message = msg;
            }),
            toString: jest.fn(function () { return _this.message; }),
        };
    }),
};
