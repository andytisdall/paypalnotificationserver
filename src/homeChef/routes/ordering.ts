import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { getContactById } from "../../utils/salesforce/SFQuery/contact/contact";
import { sendEmail } from "../../utils/email/email";
import { requireAdmin } from "../../middlewares/require-admin";

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
  const { containers, labels, soup, sandwich }: SupplyOrder = req.body;

  const contact = await getContactById(req.currentUser!.salesforceId);

  const newOrder = new SupplyOrder({
    items: { containers, labels, soup, sandwich },
    contact: {
      firstName: contact.FirstName,
      lastName: contact.LastName,
      email: contact.Email,
    },
  });

  await newOrder.save();

  // email to ck staff
  await sendEmail({
    to: "volunteers@ckoakland.org",
    from: "volunteers@ckoakland.org",
    html: `<p>${contact.FirstName} ${contact.LastName} has made a home chef supply order:</p>
    <p>Containers: ${containers}<br />
    Labels: ${labels}<br />
    Soup Containers: ${soup}<br />
    Sandwich Boxes: ${labels}</p>`,
    subject: "New Home Chef supply order",
  });

  if (contact.Email) {
    // email to volunteer
    await sendEmail({
      to: contact.Email,
      from: "volunteers@ckoakland.org",
      html: `<p>Hi ${contact.FirstName},</p>
      <p>You have made a home chef supply order:</p>
      <p><strong>Containers:</strong> ${containers}<br />
      <strong>Labels:</strong> ${labels}<br />
      <strong>Soup Containers:</strong> ${soup}<br />
      <strong>Sandwich Boxes:</strong> ${labels}</p>
      <p>We will contact you by email when this order is ready to pick up from the CK Kitchen.</p>
      <p>Thanks!</p>
      <p>Community Kitchens</p>`,
      subject: "You made a Home Chef supply order",
    });
  }

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
        await sendEmail({
          to: o.contact.email,
          from: "volunteers@ckoakland.org",
          html: `<p>Hi ${o.contact.firstName},</p>
          <p>Your Home Chef supplies are ready to be picked up at the CK Kitchen.
          Please come any time during our open hours to pick up your order.</p>
            <p<strong>Pick up from the CK Kitchen</strong - 2270 Telegraph Ave, Oakland CA</p>
            <p><strong>Open Hours<strong> - Sunday - Thursday, 10am - 4pm</p>
            <p>See you soon!</p>
            <p>Community Kitchens</p>`,
          subject: "Your Home Chef supplies are ready!",
        });
      }
      o.fulfilled = true;
      await o.save();
    });

    await Promise.all(promises);

    res.send(null);
  }
);

export default router;
