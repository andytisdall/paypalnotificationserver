import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
import { utcToZonedTime } from "date-fns-tz";

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

    if (meals > 0) {
      const newClientMeals = new ClientMeal({
        client: clientId,
        amount: meals,
        date: new Date().toLocaleDateString(),
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

    const clientMeals = await ClientMeal.find({
      date: {
        $gte: utcToZonedTime(startDate, "America/Los_Angeles").setHours(0),
        $lte: utcToZonedTime(endDate, "America/Los_Angeles").setHours(24),
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
    const { cCode, barcode } = req.body;

    const client = await Client.findById(clientId);
    client.cCode = cCode;
    client.barcode = barcode;
    await client.save();

    res.send(null);
  }
);

router.patch(
  "/doorfront/meal/:id",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    const meal = await ClientMeal.findById(id);
    meal.amount = amount;
    await meal.save();

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
