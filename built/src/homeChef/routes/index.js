"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var homeChefJobListing_1 = __importDefault(require("./homeChefJobListing"));
var homeChefSignup_1 = __importDefault(require("../../homeChef/routes/homeChefSignup"));
var recipes_1 = __importDefault(require("./recipes"));
var hours_1 = __importDefault(require("./hours"));
var homeChefRouter = express_1.default.Router({ mergeParams: true });
homeChefRouter.use(homeChefJobListing_1.default);
homeChefRouter.use(homeChefSignup_1.default);
homeChefRouter.use(recipes_1.default);
homeChefRouter.use(hours_1.default);
exports.default = homeChefRouter;
