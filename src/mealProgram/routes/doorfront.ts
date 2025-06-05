import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";

const Client = mongoose.model("Client");
const ClientMeal = mongoose.model("ClientMeal");

const router = express.Router();

router.get(
  "/doorfront/:clientId",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { clientId } = req.params;
    let client = await Client.findOne({ clientId });

    if (!client) {
      // create new client
      client = new Client({ clientId });
      await client.save();
    }

    const clientMeals = await ClientMeal.find({ client: client.id });

    res.send(clientMeals);
  }
);

router.post(
  "/doorfront",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { meals, clientId }: { meals: string[]; clientId: string } = req.body;
    let client = await Client.findOne({ clientId });

    const promises = meals.map(async (meal) => {
      const newItem = new ClientMeal({ client: client.id });
      await newItem.save();
    });
    await Promise.all(promises);
    res.send(null);
  }
);

export default router;
