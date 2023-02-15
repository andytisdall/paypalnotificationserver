"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var addPhone_1 = __importDefault(require("./addPhone"));
var incomingText_1 = __importDefault(require("./incomingText"));
var outgoingText_1 = __importDefault(require("./outgoingText"));
var feedback_1 = __importDefault(require("./feedback"));
var survey_1 = __importDefault(require("./survey"));
var textRouter = express_1.default.Router({ mergeParams: true });
textRouter.use(addPhone_1.default);
textRouter.use(incomingText_1.default);
textRouter.use(outgoingText_1.default);
textRouter.use(feedback_1.default);
textRouter.use(survey_1.default);
exports.default = textRouter;
