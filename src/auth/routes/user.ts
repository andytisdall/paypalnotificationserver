import express from 'express';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { addHours } from 'date-fns';
import { sendForgotPasswordEmail } from '../../utils/email';
import jwt from 'jsonwebtoken';

import getSecrets from '../../utils/getSecrets';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import {
  getContactById,
  getContactByEmail,
  updateContact,
  FormattedContact,
} from '../../utils/salesforce/SFQuery/contact';
import { sendEmail } from '../../utils/email';
import urls from '../../utils/urls';
import salesforceRouter from './salesforceUser';

const User = mongoose.model('User');
const router = express.Router();

router.get('/', currentUser, async (req, res) => {
  if (!req.currentUser) {
    return res.sendStatus(204);
  }

  res.send(req.currentUser);
});

router.get('/userInfo', currentUser, async (req, res) => {
  // fail silently so users don't get an error on volunteer page
  if (!req.currentUser) {
    return res.sendStatus(204);
  }
  if (!req.currentUser!.salesforceId) {
    throw Error('User does not have a salesforce ID');
  }
  const contact = await getContactById(req.currentUser!.salesforceId);
  const contactInfo: FormattedContact = {
    firstName: contact.FirstName,
    lastName: contact.LastName,
    volunteerAgreement: contact.Home_Chef_Volunteeer_Agreement__c,
    foodHandler: contact.Home_Chef_Food_Handler_Certification__c,
    homeChefStatus: contact.Home_Chef_Status__c,
    ckKitchenStatus: contact.CK_Kitchen_Volunteer_Status__c,
  };
  res.send(contactInfo);
});

router.get('/all', currentUser, requireAuth, requireAdmin, async (req, res) => {
  const allUsers = await User.find();
  res.send(allUsers);
});

router.post('/', currentUser, requireAuth, requireAdmin, async (req, res) => {
  const { username, password, salesforceId } = req.body;

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw Error('Username is in use');
  }

  const newUser = new User({ username, password, salesforceId });
  await newUser.save();
  res.status(201).send(newUser);
});

router.patch('/', currentUser, requireAuth, async (req, res) => {
  const { userId, username, password, salesforceId } = req.body;

  if (!username && !password) {
    res.status(400);
    throw new Error('No username or password provided');
  }

  const u = await User.findById(userId);
  if (!u) {
    throw Error('User not found');
  }

  if (u.id !== req.currentUser!.id && !req.currentUser!.admin) {
    res.status(403);
    throw new Error('User not authorized to modify this user');
  }

  if (u.id !== req.currentUser!.id && u.admin) {
    res.status(403);
    throw new Error('Admin users can only be modified by themselves');
  }

  if (username && username !== u.username) {
    u.username = username;
    await updateContact(u.salesforceId, { Portal_Username__c: username });
  }
  if (password) {
    u.password = password;
  }
  if (salesforceId) {
    u.salesforceId = salesforceId;
  }
  if (u.id === req.currentUser!.id && !u.active) {
    u.active = true;
  }

  await u.save();
  res.send(u);
});

router.delete(
  '/:userId',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (user.admin) {
      throw Error('You cannot delete an admin user');
    }
    await User.deleteOne({ _id: req.params.userId });
    res.sendStatus(204);
  }
);

router.post('/save-token', currentUser, requireAuth, async (req, res) => {
  const { token }: { token: string } = req.body;

  const user = await User.findById(req.currentUser!.id);

  user.homeChefNotificationToken = token;

  await user.save();
  res.sendStatus(204);
});

router.post('/connect-google', currentUser, requireAuth, async (req, res) => {
  const { JWT_KEY, GOOGLE_CLIENT_ID } = await getSecrets([
    'JWT_KEY',
    'GOOGLE_CLIENT_ID',
  ]);
  if (!JWT_KEY) {
    throw Error('No JWT key found');
  }
  if (!GOOGLE_CLIENT_ID) {
    throw Error('No Google Client Id found');
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
    throw Error('Could not get google profile');
  }

  const user = req.currentUser!;
  user.googleId = googleProfile.sub;

  //@ts-ignore
  await user.save();

  res.sendStatus(204);
});

router.post('/forgot-password', async (req, res) => {
  const { email }: { email: string } = req.body;

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('No JWT key found');
  }

  const contact = await getContactByEmail(email);
  if (contact?.portalUsername) {
    const user = await User.findOne({ username: contact.portalUsername });

    if (user) {
      const resetToken = jwt.sign(
        {
          id: user.id,
          expiresAt: addHours(new Date(), 1).toString(),
        },
        JWT_KEY
      );
      const resetLink = urls.client + '/reset-password/' + resetToken;
      await sendForgotPasswordEmail(email, resetLink, user.username);
    }
  } else if (contact) {
    sendEmail({
      subject: 'Community Kitchens Volunteer Portal',
      to: email,
      from: urls.adminEmail,
      html: '<p>Hello, you have requested a password update for the CK volunteer portal. Unfortunately you do not have a user account yet, but you can start one here:</p><p>https://portal.ckoakland.org/forms/volunteer</p><p>Note that you do not need an account to sign up for CK Kitchen volunteer shifts-- you can sign up for shifts with just your email (no password) here:</p><p>https://portal.ckoakland.org/volunteers/ck-kitchen</p><p>If you have any issues, please email Andy at andy@ckoakland.org.</p><p>Thanks!<br>Community Kitchens</p>',
    });
  }
  res.sendStatus(204);
});

router.post('/reset-password', async (req, res) => {
  const { token, password }: { token: string; password: string } = req.body;

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('No JWT key found');
  }
  try {
    const { id, expiresAt } = jwt.verify(token, JWT_KEY) as unknown as {
      id: string;
      expiresAt: string;
    };

    const user = await User.findById(id);
    if (!user) {
      throw Error('Invalid reset token');
    }
    if (new Date(expiresAt) < new Date()) {
      throw Error('Reset token has expired');
    }
    if (user) {
      user.password = password;
      await user.save();
    }
    return res.sendStatus(204);
  } catch (err) {
    throw Error('Unable to reset password');
  }
});

router.use(salesforceRouter);

export default router;
