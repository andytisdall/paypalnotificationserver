import express from "express";
import mongoose from "mongoose";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";

const Client = mongoose.model("Client");
const ClientMeal = mongoose.model("ClientMeal");

const router = express.Router();

const addZerosToCcode = (code: string) => {
  let id = code.split("C")[1];
  while (id.length < 8) {
    id = "0" + id;
  }
  return "C" + id;
};

router.get(
  "/doorfront/:scanValue",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { scanValue } = req.params;

    if (!scanValue) {
      throw Error("No client ID provided");
    }

    let client;

    if (!scanValue.includes("C")) {
      client = await Client.findOne({ barcode: scanValue });

      if (!client) {
        // create new client
        client = new Client({ barcode: scanValue });
        await client.save();
      }
    } else {
      const id = addZerosToCcode(scanValue);

      client = await Client.findOne({ cCode: id });

      if (!client) {
        // create new client
        client = new Client({ cCode: id });
        await client.save();
      }
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

    if (meals > 0) {
      const newClientMeals = new ClientMeal({
        client: clientId,
        amount: meals,
        date: new Date().toLocaleDateString(),
      });
      await newClientMeals.save();
    }

    if (cCode || barcode) {
      const client = await Client.findById(clientId);
      if (cCode) {
        const id = addZerosToCcode(cCode);
        client.cCode = id;
      }
      if (barcode) {
        client.barcode = barcode;
      }
      await client.save();
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

    const clientMeals = await ClientMeal.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate).setHours(24),
      },
    }).populate("client");

    res.send(clientMeals);
  }
);

export default router;
