const mongoose = require('mongoose');

const paypalTxnSchema = new mongoose.Schema(
  {
    txnId: String,
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

const PaypalTxn = mongoose.model('PaypalTxn', paypalTxnSchema);

module.exports = { PaypalTxn };
