import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";
import { getUnixTime } from "date-fns";

import getSecrets from "../../../utils/getSecrets";
import {
  getContact,
  getContactByEmail,
} from "../../../utils/salesforce/SFQuery/contact/contact";
import urls from "../../../utils/urls";

const User = mongoose.model("User");

const router = express.Router();

router.post("/apple-signin", async (req, res) => {
  const {
    id,
    familyName,
    givenName,
    email,
    authorizationCode,
  }: {
    id: string;
    familyName?: string;
    givenName?: string;
    email?: string;
    authorizationCode?: string;
  } = req.body;

  const { JWT_KEY, APPLE_AUTH_KEY, APPLE_KID, APPLE_TEAM_ID } =
    await getSecrets([
      "JWT_KEY",
      "APPLE_AUTH_KEY",
      "APPLE_KID",
      "APPLE_TEAM_ID",
    ]);
  if (!JWT_KEY) {
    throw Error("No JWT key found");
  }
  if (!APPLE_AUTH_KEY || !APPLE_KID || !APPLE_TEAM_ID) {
    throw Error("No Apple key found");
  }

  // validate authorization code from frontend

  const issuedAt = getUnixTime(new Date());
  const expiresAt = issuedAt + 15776000;

  const appleTokenHeader = {
    alg: "ES256",
    kid: APPLE_KID,
  };
  const appleTokenPayload = {
    iss: APPLE_TEAM_ID,
    iat: issuedAt,
    exp: expiresAt,
    aud: "https://appleid.apple.com",
    sub: "org.ckoakland.ckhomechef",
  };

  const encodedAppleToken = jwt.sign(appleTokenPayload, APPLE_AUTH_KEY, {
    header: appleTokenHeader,
    algorithm: "ES256",
  });

  const appleValidationPostBody = {
    client_id: "org.ckoakland.ckhomechef",
    client_secret: encodedAppleToken,
    code: authorizationCode,
    grant_type: "authorization_code",
  };

  await axios.post(urls.apple, appleValidationPostBody, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  let user;

  if (givenName && familyName && email) {
    user = await User.findOne({ appleId: id });
    if (!user) {
      //   // query sf for name
      let contact = await getContactByEmail(email);
      if (!contact) {
        contact = await getContact(familyName, givenName);
      }

      if (contact?.portalUsername) {
        // check if they have username already?
        // assign existing user a google id
        user = await User.findOne({ username: contact.portalUsername });
        if (!user) {
          throw Error(
            "Your information could not be found. Please contact the administrator at andy@ckoakland.org"
          );
        }
        user.appleId = id;
        await user.save();
      } else {
        // create user?
        throw Error(
          "You must begin the Home Chef onboarding process to access this information. Go to portal.ckoakland.org/forms/hc-interest-form to sign up!"
        );
      }
    }
  } else if (id) {
    user = await User.findOne({ appleId: id });
  } else {
    return res.sendStatus(400);
  }

  // delete this after review process
  // user = await User.findById(urls.appleReviewerId);

  if (!user) {
    throw Error("User Not Found");
  }

  const JWT = jwt.sign(
    {
      id: user.id,
    },
    JWT_KEY
  );

  res.send({ user, token: JWT });
});

export default router;
