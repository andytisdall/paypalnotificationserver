import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import { join } from "path";
import mongoose from "mongoose";
import nocache from "nocache";

import { connectDb } from "./src/utils/db/setupDb";

// register models
import "./src/utils/db/registerModels";

// routes
import paypalRouter from "./src/paypal/routes/paypal";
import textRouter from "./src/text/routes";
import mealProgramRouter from "./src/mealProgram/routes";
import fileRouter from "./src/files/routes/files";
import homeChefRouter from "./src/homeChef/routes";
import authRouter from "./src/auth/routes";
import volunteersRouter from "./src/volunteers/routes";
import d4jRouter from "./src/d4j/routes";
import signRouter from "./src/sign/routes";
import emailRouter from "./src/email/email";
import eventsRouter from "./src/events/routes/rsvp";

import { errorHandler } from "./src/middlewares/error-handler";

const PORT = process.env.PORT || 3001;

mongoose.set("strictQuery", false);

// initialize app and add middleware
const app = express();
app.use(function (req, res, next) {
  if (req.method === "POST" && req.path === "/") {
    console.log("hit");
    return res.send(null);
  }
  next();
});
app.use("/static", express.static(join("public", "static")));
app.use("/images", express.static(join("public", "images")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(nocache());

// add /api to all routers so we don't get our urls mixed up with frontend

const apiRouter = express.Router({ mergeParams: true });

apiRouter.use(authRouter);
apiRouter.use("/paypal", paypalRouter);
apiRouter.use("/text", textRouter);
apiRouter.use("/meal-program", mealProgramRouter);
apiRouter.use("/files", fileRouter);
apiRouter.use("/home-chef", homeChefRouter);
apiRouter.use("/volunteers", volunteersRouter);
apiRouter.use("/d4j", d4jRouter);
apiRouter.use("/sign", signRouter);
apiRouter.use("/email", emailRouter);
apiRouter.use("/events", eventsRouter);

apiRouter.use(errorHandler);
apiRouter.get("/{*path}", (_req, res) => {
  res.sendStatus(404);
});

app.use("/api", apiRouter);

app.get("/_ah/warmup", (_req, res) => {
  res.sendStatus(204);
});

app.get("/manifest.json", (_req, res) =>
  res.sendFile(join("public", "manifest.json"), { root: __dirname }),
);

app.get("/{*path}", (_req, res) => {
  res.sendFile(join("public", "index.html"), {
    root: __dirname,
  });
});

app.set("etag", false);

if (process.env.NODE_ENV !== "test") {
  connectDb();
  app.listen(PORT, () => {
    console.log("server listening");
  });
}

export default app;
