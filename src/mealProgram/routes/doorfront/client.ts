import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../../middlewares/current-user";
import { requireAuth } from "../../../middlewares/require-auth";
import { requireAdmin } from "../../../middlewares/require-admin";

const Client = mongoose.model("Client");
const ClientMeal = mongoose.model("ClientMeal");

const router = express.Router();

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
      client = new Client({ barcode: [scanValue] });
      await client.save();
    }

    const clientMeals = await ClientMeal.find({ client: client.id });

    res.send({ clientMeals, client });
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

    if (cCode) {
      const duplicateClient = await Client.findOne({
        cCode,
        _id: { $ne: clientId },
      });
      if (duplicateClient) {
        client.barcode = [
          ...barcode.filter((bc: string) => bc),
          ...duplicateClient.barcode,
        ];
        await mergeClientMeals(client.id, duplicateClient.id);
      } else {
        client.barcode = barcode.filter((bc: string) => bc);
      }
    } else {
      client.barcode = barcode.filter((bc: string) => bc);
    }
    client.cCode = cCode;
    client.cCodeIncorrect = cCodeIncorrect || false;
    await client.save();

    res.send(null);
  }
);

// for clients with the same C code
const mergeClientMeals = async (client1ID: string, client2ID: string) => {
  const meals = await ClientMeal.find({ client: client2ID });
  const promises = meals.map(async (m) => {
    m.client = client1ID;
    await m.save();
  });
  await Promise.all(promises);
  await Client.deleteOne({ _id: client2ID });
};

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
