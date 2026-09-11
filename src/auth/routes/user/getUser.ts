import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../../middlewares/current-user";
import { requireAdmin } from "../../../middlewares/require-admin";

const User = mongoose.model("User");
const router = express.Router();

router.get("/", currentUser, async (req, res) => {
  if (!req.currentUser) {
    return res.sendStatus(204);
  }

  res.send(req.currentUser);
});

router.get("/all", requireAdmin, async (_req, res) => {
  const allUsers = await User.find();
  // await fetcher.setService("salesforce");
  // console.log(allUsers.length);
  // let noUsers = 0;
  // for (let i = 0; i < allUsers.length; i++) {
  //   const user = allUsers[i];
  //   try {
  //     await fetcher.get(
  //       urls.SFOperationPrefix + "/Contact/" + user.salesforceId,
  //     );
  //   } catch (err) {
  //     noUsers++;
  //     await User.deleteOne({ _id: user.id });
  //   }
  // }

  // console.log(noUsers + " users deleted");

  res.send(allUsers);
});

export default router;
