import express from 'express';
import { OAuth2Client } from 'google-auth-library';

import { currentUser } from '../../../middlewares/current-user';
import { requireAuth } from '../../../middlewares/require-auth';
import getSecrets from '../../../utils/getSecrets';

const router = express.Router();

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

export default router;
