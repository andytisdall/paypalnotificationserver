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

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";
import { requireAdmin } from "../../middlewares/require-admin";

const Client = mongoose.model("Client");
const ClientMeal = mongoose.model("ClientMeal");

const router = express.Router();

router.get("/doorfront/monthly", async (req, res) => {
  let startDate: Date;
  let endDate: Date;

  const today = new Date();
  const todaysDate = getDate(today);
  if (todaysDate < 15) {
    const lastMonth = subMonths(today, 1);
    lastMonth.setDate(15);
    lastMonth.setHours(0);
    startDate = lastMonth;
    today.setDate(14);
    today.setHours(23);
    endDate = today;
  } else {
    const nextMonth = addMonths(today, 1);
    nextMonth.setDate(14);
    nextMonth.setHours(23);
    endDate = nextMonth;
    today.setDate(15);
    today.setHours(0);
    startDate = today;
  }

  const thisMonthsMeals = await ClientMeal.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  const count: Record<string, number> = {};

  thisMonthsMeals.forEach((meal) => {
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

router.get(
  "/doorfront/client/lookup-by-client-number/:cCode",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { cCode } = req.params;

    if (!cCode) {
      throw Error("No client number provided");
    }

    let client = await Client.findOne({ cCode });

    if (!client) {
      // create new client
      client = new Client({ cCode: cCode });
      await client.save();
    }

    const clientMeals = await ClientMeal.find({ client: client.id });

    // console.log(clientMeals);

    res.send({ clientMeals, client });
  }
);

router.get(
  "/doorfront/scan/:scanValue",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { scanValue } = req.params;

    if (!scanValue) {
      throw Error("No barcode provided");
    }

    let client = await Client.findOne({ barcode: scanValue });

    if (!client) {
      // create new client
      client = new Client({ barcode: scanValue });
      await client.save();
    }

    const clientMeals = await ClientMeal.find({ client: client.id });

    res.send({ clientMeals, client });
  }
);

router.post(
  "/doorfront/meals",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const {
      meals,
      clientId,
      cCode,
      barcode,
    }: { meals: number; clientId: string; cCode?: string; barcode?: string } =
      req.body;

    const now = formatISO(new Date());

    if (meals > 0) {
      const newClientMeals = new ClientMeal({
        client: clientId,
        amount: meals,
        date: now,
      });
      await newClientMeals.save();
    }

    const client = await Client.findById(clientId);
    if (cCode) {
      client.cCode = cCode;
    }
    if (barcode) {
      client.barcode = barcode;
    }
    await client.save();

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
  "/doorfront/client/:clientId",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { clientId } = req.params;
    const { cCode, barcode, cCodeIncorrect } = req.body;

    const client = await Client.findById(clientId);
    client.cCode = cCode;
    client.barcode = barcode;
    client.cCodeIncorrect = cCodeIncorrect;
    await client.save();

    res.send(null);
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

router.get(
  "/doorfront/clients",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const clients = await Client.find();
    res.send(clients);
  }
);

router.get(
  "/doorfront/client/:id",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const client = await Client.findById(id);
    if (!client) {
      return res.send(null);
    }
    const clientMeals = await ClientMeal.find({ client: client.id });

    res.send({ client, clientMeals });
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

router.delete(
  "/doorfront/client/:id",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    await Client.deleteOne({ _id: id });
    await ClientMeal.deleteMany({ client: id });

    res.send(null);
  }
);

export default router;
