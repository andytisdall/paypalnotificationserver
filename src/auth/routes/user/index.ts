import express from 'express';

import salesforceUserRouter from './salesforceUser';
import resetPasswordRouter from './reset-password';
import googleRouter from './google';
import getUserRouter from './getUser';
import createUserRouter from './createUser';
import editUserRouter from './editUser';
import saveHomeChefTokenRouter from './saveHomeChefToken';
import deleteUserRouter from './deleteUser';

const router = express.Router({ mergeParams: true });

router.use(salesforceUserRouter);
router.use(resetPasswordRouter);
router.use(googleRouter);
router.use(getUserRouter);
router.use(createUserRouter);
router.use(editUserRouter);
router.use(deleteUserRouter);
router.use(saveHomeChefTokenRouter);

export default router;
