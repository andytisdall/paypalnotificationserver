import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { getUnixTime } from "date-fns";
import passwordGenerator from 'generate-password'

import getSecrets from "../../utils/getSecrets";
import { Password } from "../password";
import {
  getContact,
  getContactByEmail,
} from "../../utils/salesforce/SFQuery/contact";
import urls from "../../utils/urls";

const User = mongoose.model("User");

const router = express.Router();

const createUser = async ({firstName, lastName, salesforceId}: {firstName?: string, lastName: string, salesforceId: string}) => {
  const temporaryPassword = passwordGenerator.generate({
      length: 10,
      numbers: true,
    });
  
    const username = (
      firstName?.charAt(0).toLowerCase() + lastName.toLowerCase()
    ).replace(' ', '');
  
    let uniqueUsername = username;
    let existingUsername = await User.findOne({ username });
    let i = 1;
    while (existingUsername) {
      uniqueUsername = username + i;
      existingUsername = await User.findOne({ username: uniqueUsername });
      i++;
    }
  
    const newUser = new User({
      username: uniqueUsername,
      password: temporaryPassword,
      salesforceId,
    });
    await newUser.save();
    return newUser
}

router.post("/signin", async (req, res) => {
  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error("No JWT key found");
  }

  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    res.status(401);
    throw new Error("Credentials Invalid");
  }

  const passwordsMatch = await Password.compare(
    existingUser.password,
    password
  );

  if (!passwordsMatch) {
    res.status(401);
    throw new Error("Credentials Invalid");
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
    },
    JWT_KEY
  );

  res.send({ user: existingUser, token });
});

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

router.post("/google-signin/mobile", async (req, res) => {
  const googleId: string = req.body.googleId;
  const familyName: string = req.body.familyName;
  const givenName: string = req.body.givenName;
  const email: string = req.body.email;

  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);

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

  if (!JWT_KEY) {
    throw Error("No JWT key found");
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
          existingUser = await createUser({firstName: contact.firstName, lastName: contact.lastName, salesforceId: contact.id})
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
