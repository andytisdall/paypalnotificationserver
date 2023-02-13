"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var express_fileupload_1 = __importDefault(require("express-fileupload"));
var path_1 = require("path");
require("express-async-errors");
var setupDb_1 = require("./setupDb");
// register models
require("./src/models/user");
require("./src/models/phone");
require("./src/models/restaurant");
require("./src/models/recipe");
require("./src/models/feedback");
require("./src/models/paypalTxn");
// routes
// paypal
var paypal_1 = __importDefault(require("./src/routes/paypal/paypal"));
// text
var textService_1 = __importDefault(require("./src/routes/textService"));
// restaurant onboarding
var restaurant_1 = __importDefault(require("./src/routes/restaurantOnboarding/restaurant"));
var files_1 = __importDefault(require("./src/routes/restaurantOnboarding/files"));
// home chef
var homeChef_1 = __importDefault(require("./src/routes/homeChef"));
// shared
var signDocuments_1 = __importDefault(require("./src/routes/signDocuments"));
// auth
var signin_1 = __importDefault(require("./src/routes/auth/signin"));
var user_1 = __importDefault(require("./src/routes/auth/user"));
var db_1 = __importDefault(require("./src/routes/db"));
var error_handler_1 = require("./src/middlewares/error-handler");
var PORT = process.env.PORT || 3001;
// initialize app and add middleware
var app = express_1.default();
app.use('/static', express_1.default.static(path_1.join('public', 'static')));
app.use('/images', express_1.default.static(path_1.join('public', 'images')));
app.get('/manifest.json', function (req, res) {
    return res.sendFile(path_1.join('public', 'manifest.json'), { root: __dirname });
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(cors_1.default());
app.use(express_fileupload_1.default());
// add /api to all routers so we don't get our urls mixed up with frontend
var apiRouter = express_1.default.Router({ mergeParams: true });
apiRouter.use(paypal_1.default);
apiRouter.use(signin_1.default);
apiRouter.use(user_1.default);
apiRouter.use('/text', textService_1.default);
apiRouter.use(restaurant_1.default);
apiRouter.use(files_1.default);
apiRouter.use(signDocuments_1.default);
apiRouter.use('/home-chef', homeChef_1.default);
apiRouter.use(db_1.default);
apiRouter.use(error_handler_1.errorHandler);
apiRouter.get('/*', function (req, res) {
    res.sendStatus(404);
});
app.use('/api', apiRouter);
app.get('/*', function (req, res) {
    res.sendFile(path_1.join('public', 'index.html'), { root: __dirname });
});
if (process.env.NODE_ENV !== 'test') {
    setupDb_1.connectDb();
    app.listen(PORT, function () {
        console.log('server listening');
    });
}
exports.default = app;
