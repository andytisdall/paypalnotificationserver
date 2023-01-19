const express = require('express');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth');
const { requireAdmin } = require('../middlewares/require-admin');
const { Feedback } = require('../models/feedback');

const router = express.Router();

router.get(
  '/feedback',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const allFeedback = await Feedback.find();
    res.send(allFeedback);
  }
);

router.patch(
  '/feedback/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    feedback.read = true;
    await feedback.save();
    res.send(feedback);
  }
);
router.delete(
  '/feedback/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    await Feedback.deleteOne({ _id: id });
    res.send(id);
  }
);

module.exports = router;
