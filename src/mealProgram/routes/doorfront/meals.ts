import express from "express";
import mongoose from "mongoose";
import { formatISO, addDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import { requireAdmin } from "../../../middlewares/require-admin";

const ClientMeal = mongoose.model("ClientMeal");
const Client = mongoose.model("Client");

const router = express.Router();

const GENERIC_CLIENT_ID = "69a0a4e498b60de3537d43d9";

router.get(
  "/doorfront/monthly/:dateRange{/:sunMon}",
  requireAdmin,
  async (req, res) => {
    const [start, end] = req.params.dateRange.split("&");
    const { sunMon } = req.params;

    if (!start || !end) {
      return res.send(null);
    }

    const startDate = fromZonedTime(start, "America/Los_Angeles");

    const endDate = addDays(fromZonedTime(end, "America/Los_Angeles"), 1);

    let periodMeals = await ClientMeal.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    if (sunMon) {
      periodMeals = periodMeals.filter((meal) =>
        [0, 1].includes(meal.date.getDay()),
      );
    }

    const clients: Record<string, { meals: number; visits: number }> = {};
    // let lowestDate = addMonths(startDate, 1);
    // let highestDate = subMonths(endDate, 1);

    for (let meal of periodMeals) {
      // if (meal.date < lowestDate) lowestDate = meal.date;
      // if (meal.date > highestDate) highestDate = meal.date;

      const clientId =
        meal.client && meal.client.toString() !== GENERIC_CLIENT_ID
          ? meal.client
          : "unknown";

      if (clients[clientId]) {
        clients[clientId].meals += meal.amount;
        clients[clientId].visits += 1;
      } else {
        clients[clientId] = { meals: meal.amount, visits: 1 };
      }
    }

    // console.log(lowestDate, highestDate);

    res.send(clients);
  },
);

// router.get("/doorfront/salesforce", requireSalesforceAuth, async (req, res) => {
//   const todaysMeals = await ClientMeal.find({ date: new Date() });

//   const totalMeals = todaysMeals.reduce((prev, cur) => prev + cur.amount, 0);

//   res.send({ totalMeals });
// });

router.post("/doorfront/meals", requireAdmin, async (req, res) => {
  const {
    meals,
    clientId,
    findByCCode,
    date,
  }: { meals: number; clientId: string; findByCCode?: boolean; date?: string } =
    req.body;

  if (meals > 0) {
    if (findByCCode && date) {
      let client = await Client.findOne({ cCode: clientId });
      if (!client) {
        client = new Client({ cCode: clientId });
        await client.save();
      }
      let formattedDate = new Date(date);
      formattedDate.setHours(6);
      formattedDate = fromZonedTime(formattedDate, "America/Los_Angeles");
      const newClientMeals = new ClientMeal({
        client: client.id,
        amount: meals,
        date: formattedDate,
      });
      await newClientMeals.save();
    } else {
      const newClientMeals = new ClientMeal({
        client: clientId,
        amount: meals,
        date: formatISO(new Date()),
      });
      await newClientMeals.save();
    }
  }

  res.send(null);
});

router.get("/doorfront/meals/:date", requireAdmin, async (req, res) => {
  const date = req.params.date as string;

  const [startDate, endDate] = date.split("&");

  const startTime = fromZonedTime(startDate, "America/Los_Angeles");
  const endTime = addDays(fromZonedTime(endDate, "America/Los_Angeles"), 1);

  const clientMeals = await ClientMeal.find({
    date: {
      $gte: startTime,
      $lte: endTime,
    },
  }).populate("client");

  res.send(clientMeals);
});

router.patch("/doorfront/meals", requireAdmin, async (req, res) => {
  const { mealIds }: { mealIds: string[] } = req.body;

  const meals = await ClientMeal.find({ _id: { $in: mealIds } });
  const promises = meals.map(async (meal) => {
    meal.logged = true;
    await meal.save();
  });
  await Promise.all(promises);

  res.send(null);
});

router.delete("/doorfront/meal/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await ClientMeal.deleteOne({ _id: id });
  res.send(null);
});

export default router;
