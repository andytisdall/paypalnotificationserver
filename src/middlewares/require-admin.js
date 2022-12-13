const { User } = require('../models/user.js');

module.exports = {
  requireAdmin: async (req, res, next) => {
    const thisUser = await User.findById(req.currentUser.id);
    if (!thisUser.admin) {
      res.status(403);
      throw new Error('User must be admin');
    }

    next();
  },
};
