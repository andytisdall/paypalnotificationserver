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
var setupDb_1 = require("./src/setupDb");
// register models
require("./src/auth/models/user");
require("./src/text/models/phone");
require("./src/mealProgram/models/restaurant");
require("./src/homeChef/models/recipe");
require("./src/text/models/feedback");
require("./src/paypal/models/paypalTxn");
// routes
// paypal
var paypal_1 = __importDefault(require("./src/paypal/routes/paypal"));
// text
var routes_1 = __importDefault(require("./src/text/routes"));
// restaurant onboarding
var restaurant_1 = __importDefault(require("./src/mealProgram/routes/restaurant"));
//files
var files_1 = __importDefault(require("./src/files/routes/files"));
// home chef
var routes_2 = __importDefault(require("./src/homeChef/routes"));
// shared
var signDocuments_1 = __importDefault(require("./src/docusign/routes/signDocuments"));
// auth
var auth_1 = __importDefault(require("./src/auth/routes/auth"));
var user_1 = __importDefault(require("./src/auth/routes/user"));
var error_handler_1 = require("./src/middlewares/error-handler");
var PORT = process.env.PORT || 3001;
// initialize app and add middleware
var app = express_1.default();
// app.set('trust proxy', true);
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
apiRouter.use(auth_1.default);
apiRouter.use('/paypal', paypal_1.default);
apiRouter.use('/user', user_1.default);
apiRouter.use('/text', routes_1.default);
apiRouter.use('/restaurant', restaurant_1.default);
apiRouter.use('/files', files_1.default);
apiRouter.use('/docusign', signDocuments_1.default);
apiRouter.use('/home-chef', routes_2.default);
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
