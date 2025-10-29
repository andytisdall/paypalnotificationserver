import express from "express";
import mongoose from "mongoose";
import {
  formatISO,
  addDays,
  getDate,
  subMonths,
  addMonths,
  format,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

import { currentUser } from "../../../middlewares/current-user";
import { requireAuth } from "../../../middlewares/require-auth";
import { requireSalesforceAuth } from "../../../middlewares/require-salesforce-auth";
import { requireAdmin } from "../../../middlewares/require-admin";

const ClientMeal = mongoose.model("ClientMeal");

const router = express.Router();

router.get("/doorfront/monthly/:month", async (req, res) => {
  const [month, year] = req.params.month.split("&");

  const startDate = new Date(
    month === "1" ? parseInt(year) - 1 : parseInt(year),
    month === "1" ? 11 : parseInt(month) - 2,
    15
  );

  const endDate = new Date(parseInt(year), parseInt(month) - 1, 14);

  const thisMonthsMeals = await ClientMeal.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  const count: Record<string, number> = {};
  let lowestDate = addMonths(startDate, 1);
  let highestDate = subMonths(endDate, 1);

  thisMonthsMeals.forEach((meal) => {
    if (meal.date < lowestDate) lowestDate = meal.date;
    if (meal.date > highestDate) highestDate = meal.date;
    if (count[meal.client]) {
      count[meal.client] += meal.amount;
    } else {
      count[meal.client] = meal.amount;
    }
  });

  res.send(count);
});

router.get("/doorfront/salesforce", requireSalesforceAuth, async (req, res) => {
  const todaysMeals = await ClientMeal.find({ date: new Date() });

  const totalMeals = todaysMeals.reduce((prev, cur) => prev + cur.amount, 0);

  res.send({ totalMeals });
});

router.post(
  "/doorfront/meals",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { meals, clientId }: { meals: number; clientId: string } = req.body;

    const now = formatISO(new Date());

    if (meals > 0) {
      const newClientMeals = new ClientMeal({
        client: clientId,
        amount: meals,
        date: now,
      });
      await newClientMeals.save();
    }

    res.send(null);
  }
);

router.get(
  "/doorfront/meals/:date",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { date } = req.params;

    const [startDate, endDate] = date.split("&");

    const startTime = zonedTimeToUtc(startDate, "America/Los_Angeles");
    const endTime = addDays(zonedTimeToUtc(endDate, "America/Los_Angeles"), 1);

    const clientMeals = await ClientMeal.find({
      date: {
        $gte: startTime,
        $lte: endTime,
      },
    }).populate("client");

    res.send(clientMeals);
  }
);

router.patch(
  "/doorfront/meals",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { mealIds }: { mealIds: string[] } = req.body;

    const meals = await ClientMeal.find({ _id: { $in: mealIds } });
    const promises = meals.map(async (meal) => {
      meal.logged = true;
      await meal.save();
    });
    await Promise.all(promises);

    res.send(null);
  }
);

router.delete(
  "/doorfront/meal/:id",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    await ClientMeal.deleteOne({ _id: id });
    res.send(null);
  }
);

export default router;
