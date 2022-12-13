const express = require('express');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const { Phone } = require('../models/phone');

const router = express.Router();

router.post('/addphone', currentUser, requireAuth, async (req, res) => {
  if (!req.body.phone) {
    res.status(422);
    throw new Error('No Phone Number in Request Body');
  }

  const phoneNumber = String(req.body.phone).replace(/[^\d]/g, '');

  if (phoneNumber.length !== 10) {
    res.status(422);
    throw new Error('Phone number must have 10 digits');
  }

  const existingNumber = Phone.findOne({ number: '+1' + phoneNumber });
  if (existingNumber) {
    res.status(422);
    throw new Error('Phone number is already in database');
  }

  try {
    const newPhone = new Phone({ number: '+1' + phoneNumber });
    await newPhone.save();
    res.send(newPhone);
  } catch (err) {
    res.status(422).send('Could not add phone number:' + err.message);
  }
});

module.exports = router;
