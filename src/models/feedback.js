const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    message: String,
    date: { type: Date, default: Date.now() },
    sender: String,
    region: String,
    read: { type: Boolean, default: false },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = { Feedback };
