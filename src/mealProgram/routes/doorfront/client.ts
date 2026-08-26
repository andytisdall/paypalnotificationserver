import express from "express";
import mongoose from "mongoose";
import {
  GetClientMealsResponse,
  Client as ClientType,
  ClientMeal as ClientMealType,
} from "@community-kitchens/apiinterfaces";

import { requireAdmin } from "../../../middlewares/require-admin";

const Client = mongoose.model("Client");
const ClientMeal = mongoose.model("ClientMeal");

const router = express.Router();

router.get(
  "/doorfront/client/lookup-by-client-number/:cCode",
  requireAdmin,
  async (req, res) => {
    const { cCode } = req.params;

    if (!cCode) {
      throw Error("No client number provided");
    }

    let client = await Client.findOne({ cCode });

    if (!client) {
      // create new client
      client = new Client({ cCode });
      await client?.save();
    }

    const clientMeals: ClientMealType[] = await ClientMeal.find({
      client: client.id,
    });

    res.send({ clientMeals, client });
  },
);

router.get("/doorfront/scan/:scanValue", requireAdmin, async (req, res) => {
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
});

router.patch("/doorfront/client/:clientId", requireAdmin, async (req, res) => {
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
});

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

router.get("/doorfront/clients", requireAdmin, async (req, res) => {
  const clients: ClientType[] = await Client.find();
  res.send(clients);
});

router.get("/doorfront/client/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const client: ClientType | null = await Client.findById(id);
  if (!client) {
    return res.send(null);
  }
  const clientMeals: ClientMealType[] = await ClientMeal.find({
    client: client.id,
  });

  const response: GetClientMealsResponse = { client, clientMeals };

  res.send(response);
});

router.delete("/doorfront/client/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await Client.deleteOne({ _id: id });
  await ClientMeal.deleteMany({ client: id });

  res.send(null);
});

export default router;
