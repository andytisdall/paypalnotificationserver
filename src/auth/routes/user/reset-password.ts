import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { addHours } from "date-fns";

import { sendForgotPasswordEmail } from "../../../utils/email/emailTemplates/forgotPassword";
import getSecrets from "../../../utils/getSecrets";
import { getContactByEmail } from "../../../utils/salesforce/SFQuery/contact/contact";
import urls from "../../../utils/urls";

const User = mongoose.model("User");
const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  const { email }: { email: string } = req.body;

  const contact = await getContactByEmail(email);

  if (!contact?.portalUsername) {
    return res.send(null);
  }

  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error();
  }

  const user = await User.findOne({ username: contact.portalUsername });

  if (!user) {
    return res.send(null);
  }

  const expirationDate = new Date();
  const oneHourInTheFuture = addHours(expirationDate, 1);
  const payload = {
    id: user.id,
    expiresAt: oneHourInTheFuture,
  };
  const token = jwt.sign(payload, JWT_KEY);
  const url = urls.client + "/reset-password/" + token;

  await sendForgotPasswordEmail(email, url, contact.portalUsername);

  res.send(null);
});

router.post("/reset-password", async (req, res) => {
  const { token, password }: { token: string; password: string } = req.body;

  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error("No JWT key found");
  }

  const { id, expiresAt } = jwt.verify(token, JWT_KEY) as unknown as {
    id: string;
    expiresAt: string;
  };

  console.log(new Date(expiresAt));
  console.log(new Date());

  const user = await User.findById(id);
  if (!user) {
    throw Error("Invalid reset token");
  }
  if (new Date(expiresAt) < new Date()) {
    throw Error("Reset token has expired");
  }
  if (user) {
    user.password = password;
    await user.save();
  }
  return res.sendStatus(204);
});

export default router;
