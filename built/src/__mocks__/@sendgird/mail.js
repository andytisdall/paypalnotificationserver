"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    setApiKey: jest.fn(function (key) { }),
    send: jest.fn(function (msg) {
        return Promise.resolve();
    }),
};
