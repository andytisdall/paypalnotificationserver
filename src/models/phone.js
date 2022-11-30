const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
});

const Phone = mongoose.model('Phone', phoneSchema);

module.exports = { Phone };
