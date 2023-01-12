const mongoose = require('mongoose');

const REGIONS = {
  WEST_OAKLAND: '+15105297288',
  EAST_OAKLAND: '+15109301159',
};

const phoneSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    region: [
      {
        type: String,
      },
    ],
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

const Phone = mongoose.model('Phone', phoneSchema);

module.exports = { Phone, REGIONS };
