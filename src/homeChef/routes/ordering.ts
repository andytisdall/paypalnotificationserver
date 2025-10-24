import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { getContactById } from "../../utils/salesforce/SFQuery/contact/contact";
import { requireAdmin } from "../../middlewares/require-admin";
import {
  sendOrderReadyEmail,
  sendManagerSupplyOrder,
  sendOrderConfirmation,
} from "../../utils/email/emailTemplates/homeChefSupplyOrder";

const router = express.Router();

const SupplyOrder = mongoose.model("SupplyOrder");

export interface SupplyOrder {
  containers: number;
  labels: number;
  soup: number;
  sandwich: number;
}

interface ManualSupplyOrder extends SupplyOrder {
  firstName?: string;
  lastName?: string;
}

router.post("/ordering", currentUser, requireAuth, async (req, res) => {
  const order: SupplyOrder = req.body;
  const { containers, labels, soup, sandwich } = order;

  const contact = await getContactById(req.currentUser!.salesforceId);

  if (process.env.NODE_ENV === "production") {
    // email to ck staff
    await sendManagerSupplyOrder({
      contact,
      order,
    });
  }

  // email to volunteer
  await sendOrderConfirmation({
    contact,
    order,
  });

  const newOrder = new SupplyOrder({
    items: { containers, labels, soup, sandwich },
    contact: {
      firstName: contact.FirstName,
      lastName: contact.LastName,
      email: contact.Email,
    },
  });

  await newOrder.save();

  res.send(null);
});

router.get(
  "/ordering",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const orders = await SupplyOrder.find();

    res.send(orders);
  }
);

router.post(
  "/ordering/manual",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const {
      firstName,
      lastName,
      items: { containers, labels, soup, sandwich },
    }: {
      firstName: string;
      lastName: string;
      items: ManualSupplyOrder;
    } = req.body;

    const newOrder = new SupplyOrder({
      items: { containers, labels, soup, sandwich },
      contact: {
        firstName,
        lastName,
      },
      fulfilled: true,
    });

    await newOrder.save();

    res.send(null);
  }
);

router.patch(
  "/ordering",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { orders }: { orders: string[] } = req.body;

    const ordersToUpdate = await SupplyOrder.find({ _id: { $in: orders } });
    const promises = ordersToUpdate.map(async (o) => {
      if (o.contact.email) {
        await sendOrderReadyEmail(o.contact);
      }
      o.fulfilled = true;
      await o.save();
    });

    await Promise.all(promises);

    res.send(null);
  }
);

export default router;
