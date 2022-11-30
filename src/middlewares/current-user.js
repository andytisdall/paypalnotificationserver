const jwt = require('jsonwebtoken');

const { User } = require('../models/user.js');
const getSecrets = require('../services/getSecrets.js');

module.exports = {
  currentUser: async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      console.log('no jwt');
      return next();
    }

    const { JWT_KEY } = await getSecrets(['JWT_KEY']);

    const payload = jwt.verify(authorization, JWT_KEY);
    req.currentUser = await User.findById(payload.id);
    next();
  },
};
