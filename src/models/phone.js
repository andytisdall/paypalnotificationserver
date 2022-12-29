const mongoose = require('mongoose');

const REGIONS = {
  WEST_OAKLAND: { name: 'WEST_OAKLAND', phoneNumber: '+14782495048' },
  EAST_OAKLAND: { name: 'EAST_OAKLAND', phoneNumber: '+14782495048' },
};

const phoneSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    region: {
      type: String,
      required: true,
      default: REGIONS.EAST_OAKLAND.name,
    },
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
