import express from "express";
import mongoose from "mongoose";
import { formatISO } from "date-fns";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";

const Client = mongoose.model("Client");
const ClientMeal = mongoose.model("ClientMeal");

const router = express.Router();

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
      client = await Client.findOne({ cCode: scanValue });

      if (!client) {
        // create new client
        client = new Client({ cCode: scanValue });
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
    }: { meals: number; clientId: string; cCode?: string } = req.body;

    const newClientMeals = new ClientMeal({ client: clientId, amount: meals });
    await newClientMeals.save();

    if (cCode) {
      const client = await Client.findById(clientId);
      client.cCode = cCode;
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

    const clientMeals = await ClientMeal.find({
      date,
    });

    res.send(clientMeals);
  }
);

export default router;
