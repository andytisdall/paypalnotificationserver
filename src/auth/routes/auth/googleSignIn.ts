import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import getSecrets from "../../../utils/getSecrets";
import {
  getContact,
  getContactByEmail,
} from "../../../utils/salesforce/SFQuery/contact/contact";

const User = mongoose.model("User");

const router = express.Router();

router.post("/google-signin/mobile", async (req, res) => {
  const googleId: string = req.body.googleId;
  const familyName: string = req.body.familyName;
  const givenName: string = req.body.givenName;
  const email: string = req.body.email;

  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);

  if (!JWT_KEY) {
    throw Error();
  }

  if (!googleId) {
    throw Error("No Google ID Provided");
  }

  let existingUser = await User.findOne({ googleId });
  if (!existingUser) {
    //   // query sf for name
    let contact = await getContact(familyName, givenName);
    if (!contact) {
      contact = await getContactByEmail(email);
    }
    if (contact?.portalUsername) {
      //   // if contact not in sf
      //   // their google name and salesforce name don't match
      //   // have them give us the name they used to sign up for home chef
      //   // and email us i guess
      //   // so we can manually add the google id to the portal user

      // check if they have username already?
      // assign existing user a google id
      existingUser = await User.findOne({ username: contact.portalUsername });
      if (!existingUser) {
        throw Error(
          "Your information could not be found. Please contact the administrator at andy@ckoakland.org"
        );
      }
      existingUser.googleId = googleId;
      await existingUser.save();
    } else {
      // create user?
      throw Error(
        "You must begin the Home Chef onboarding process to access this information. Go to portal.ckoakland.org/forms/hc-interest-form to sign up!"
      );
    }
  }

  const JWT = jwt.sign(
    {
      id: existingUser.id,
    },
    JWT_KEY
  );

  res.send({ user: existingUser, token: JWT });
});

router.post("/google-signin", async (req, res) => {
  const { JWT_KEY, GOOGLE_CLIENT_ID } = await getSecrets([
    "JWT_KEY",
    "GOOGLE_CLIENT_ID",
  ]);
  if (!JWT_KEY) {
    throw Error("No JWT key found");
  }
  if (!GOOGLE_CLIENT_ID) {
    throw Error("No Google Client Id found");
  }

  const { credential }: { credential: string } = req.body;

  const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const googleProfile = ticket.getPayload();
  if (
    !googleProfile ||
    !googleProfile.email ||
    !googleProfile.given_name ||
    !googleProfile.family_name ||
    !googleProfile.sub
  ) {
    throw Error("Could not get google profile");
  }
  let existingUser = await User.findOne({ googleId: googleProfile.sub });
  if (!existingUser) {
    //   // query sf for name
    let contact = await getContact(
      googleProfile.family_name,
      googleProfile.given_name
    );
    if (!contact) {
      contact = await getContactByEmail(googleProfile.email);
    }
    if (contact) {
      if (contact.portalUsername) {
        // check if they have username already?
        // assign existing user a google id
        existingUser = await User.findOne({ username: contact.portalUsername });
        if (!existingUser) {
          // create user
        }
        existingUser.googleId = googleProfile.sub;
        await existingUser.save();
      } else {
        // create user?
        throw Error("Contact does not have portal username");
      }
    } else {
      //   // if contact not in sf
      //   // their google name and salesforce name don't match
      //   // have them give us the name they used to sign up for home chef
      //   // and email us i guess
      //   // so we can manually add the google id to the portal user
      throw Error(
        "We could not find a person in our database based on your google profile"
      );
    }
  }

  const JWT = jwt.sign(
    {
      id: existingUser.id,
    },
    JWT_KEY
  );

  res.send({ user: existingUser, token: JWT });
});

export default router;
