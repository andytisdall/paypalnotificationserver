import express from "express";
import jwt from "jsonwebtoken";
import { addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import mongoose from "mongoose";

import { currentD4JUser } from "../../middlewares/current-d4j-user";
import { createD4jCheckIn } from "../../utils/salesforce/d4j";
import getSecrets from "../../utils/getSecrets";
import { D4JCheckInResponse } from "@community-kitchens/apiinterfaces";

const CheckIn = mongoose.model("CheckIn");

const router = express.Router();

router.post("/rewards/check-in", currentD4JUser, async (req, res) => {
  const { D4J_CHECK_IN_KEY } = await getSecrets(["D4J_CHECK_IN_KEY"]);
  if (!D4J_CHECK_IN_KEY) {
    throw Error();
  }

  const { value }: { value: string } = req.body;

  const { restaurantId, date } = jwt.verify(value, D4J_CHECK_IN_KEY, {
    algorithms: ["HS256"],
  }) as unknown as {
    restaurantId: string;
    date: string;
  };

  if (!req.currentD4JUser) {
    const result: D4JCheckInResponse = {
      result: "UNAUTHORIZED",
    };
    return res.send(result);
  }

  if (!restaurantId || !date) {
    const result: D4JCheckInResponse = {
      result: "MALFORMED",
    };
    return res.send(result);
  }

  const midnightToday = toZonedTime(new Date(date), "America/Los_Angeles");

  midnightToday.setHours(0);
  midnightToday.setMinutes(0);
  const lowerBound = fromZonedTime(midnightToday, "America/Los_Angeles");
  const upperBound = addDays(lowerBound, 1);

  const existingCheckIn = await CheckIn.findOne({
    date: { $gte: lowerBound, $lt: upperBound },
    restaurant: restaurantId,
    user: req.currentD4JUser.id,
  });

  if (existingCheckIn) {
    const result: D4JCheckInResponse = {
      result: "DUPLICATE",
    };
    return res.send(result);
  }

  const newCheckIn = new CheckIn({
    restaurant: restaurantId,
    user: req.currentD4JUser.id,
    date: new Date(),
  });

  await newCheckIn.save();

  const result: D4JCheckInResponse = {
    result: "SUCCESS",
  };
  res.send(result);

  if (req.currentD4JUser.salesforceId) {
    const checkInId = await createD4jCheckIn({
      contactId: req.currentD4JUser.salesforceId,
      restaurantId,
    });
    newCheckIn.salesforceId = checkInId;
    await newCheckIn.save();
  }
});

router.get("/rewards/check-in", currentD4JUser, async (req, res) => {
  const user = req.currentD4JUser;

  if (!user) {
    throw Error("User is not signed in");
  }

  const checkIns = await CheckIn.find({ user: user.id }).sort([["date", -1]]);
  res.send(checkIns);
});

export default router;
