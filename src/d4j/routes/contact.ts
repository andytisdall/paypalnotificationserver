import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { generate } from "generate-password";

import { currentD4JUser } from "../../middlewares/current-d4j-user";
import {
  addContact,
  getContactByEmail,
  deleteContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import getSecrets from "../../utils/getSecrets";
import { sendEmail } from "../../utils/email/email";
import { CheckIn } from "../models/checkIn";
import { deleteAllUserCheckIns } from "../../utils/salesforce/SFQuery/d4j";
// import { sendConfirmD4JUserEmail } from "../../utils/email/email";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";

const D4JUser = mongoose.model("D4JUser");

const router = express.Router();

router.post("/contact/signin", async (req, res) => {
  const { email, token }: { email: string; token?: string } = req.body;

  let user = await D4JUser.findOne({ email });

  if (!user) {
    // get salesforce contact
    const contact = await getContactByEmail(email);
    if (!contact) {
      return res.sendStatus(204);
    }
    user = new D4JUser({ email, salesforceId: contact.id, token });
    await user.save();
  }

  if (token && token !== user.token) {
    user.token = token;
    await user.save();
  }

  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error("Could not find JWT secret key");
  }

  const jwtToken = jwt.sign(
    {
      id: user.id,
    },
    JWT_KEY
  );

  res.send({ contact: user, token: jwtToken });
});

router.post("/contact", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    token,
  }: { email: string; firstName: string; lastName: string; token?: string } =
    req.body;

  if (!email || !firstName || !lastName) {
    throw Error("You must provide an email, first name and last name.");
  }

  const existingUser = await D4JUser.findOne({ email });
  if (existingUser) {
    throw Error("There is already a user with this email address");
  }

  const user = new D4JUser({ email, token });

  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error("Could not find JWT secret key");
  }
  const jwtToken = jwt.sign(
    {
      id: user.id,
    },
    JWT_KEY
  );

  const contact = await addContact({
    Email: email,
    FirstName: firstName,
    LastName: lastName,
  });
  user.salesforceId = contact!.id;

  // CONFIRM EMAIL:
  // generate code
  // store code on user
  // send email to contact with code in url
  // front end queries db for code and confirms that user

  // const code = generate({
  //   length: 5,
  //   numbers: true,
  //   lowercase: false,
  //   uppercase: false,
  // });

  // user.secretCode = code;
  // await user.save();

  // // @ts-ignore
  // await sendConfirmD4JUserEmail(contact, code);

  res.send({ contact: user, token: jwtToken });
});

router.post("/confirm-email", async (req, res) => {
  const { code } = req.body;
  if (!code) {
    throw Error("No code provided");
  }
  const user = await D4JUser.findOne({ secretCode: code });
  if (!user) {
    throw Error("Invalid Code");
  }
  user.unconfirmed = false;
  user.secretCode = undefined;

  await user.save();
  res.sendStatus(204);
});

router.get("/contact", currentD4JUser, async (req, res) => {
  if (!req.currentD4JUser) {
    return res.sendStatus(204);
  }
  res.send(req.currentD4JUser);
});

router.get("/delete-account/:email", async (req, res) => {
  const { email } = req.params;

  const user = await D4JUser.findOne({ email });

  if (!user) {
    throw Error("User not found");
  }

  const code = generate({
    length: 5,
    numbers: true,
    lowercase: false,
    uppercase: false,
  });

  const emailText = `<p>Your code from Community Kitchens is</p><p><strong>${code}</strong></p>`;

  user.secretCode = code;
  await user.save();

  await sendEmail({
    to: email,
    from: "andy@ckoakland.org",
    subject: "Your code from CK",
    html: emailText,
  });

  res.sendStatus(204);
});

router.post("/delete-account", async (req, res) => {
  const { code, email }: { code: string; email: string } = req.body;

  const user = await D4JUser.findOne({ email });

  if (code !== user.secretCode) {
    throw Error("Incorrect Code");
  }

  // delete salesforce check ins
  const checkIns = await CheckIn.find({ user: user.id });
  const allCheckInIds = checkIns
    .map(({ salesforceId }: { salesforceId?: string }) => salesforceId)
    .filter((item) => item);
  //@ts-ignore
  await deleteAllUserCheckIns(allCheckInIds);

  try {
    // delete salesforce contact
    await deleteContact(user.salesforceId);
  } catch (err) {
    console.log(err);
  }

  // delete mongo check ins
  await CheckIn.deleteMany({ user: user.id });

  // delete user
  await D4JUser.deleteOne({ email });

  res.sendStatus(204);
});

router.get(
  "/delete-andy",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const email = "andrew.tisdall@gmail.com";

    const contact = await getContactByEmail(email);
    await deleteContact(contact!.id!);

    await D4JUser.deleteOne({ email });
    res.sendStatus(204);
  }
);

export default router;
