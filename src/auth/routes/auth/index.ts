import express from 'express';

import signInRouter from './signIn';
import appleSignInRouter from './appleSignIn';
import googleSignInRouter from './googleSignIn';

const router = express.Router({ mergeParams: true });

router.use(signInRouter);
router.use(appleSignInRouter);
router.use(googleSignInRouter);

export default router;
