import express from "express";

import createRouter from "./createAgreement";
import updateRouter from "./updateContact";

const signRouter = express.Router({ mergeParams: true });

signRouter.use(createRouter);
signRouter.use(updateRouter);

export default signRouter;
