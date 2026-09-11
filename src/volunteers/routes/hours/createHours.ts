import express from "express";
import { CreateVolunteerHoursArgs } from "@community-kitchens/apiinterfaces";

import { createHours } from "../../../utils/salesforce/volunteer/hours/createHours";
import {
  getShift,
  addSlotToShift,
} from "../../../utils/salesforce/volunteer/shifts";

const router = express.Router();

router.post("/hours", async (req, res) => {
  const { shiftId, reserved }: CreateVolunteerHoursArgs = req.body;

  if (reserved) {
    const shift = await getShift(shiftId);
    if (!shift) {
      throw Error("Could not get shift");
    }
    await addSlotToShift(shift, { reservedSlot: true });
  }

  const hours = await createHours(req.body);

  res.status(201);
  res.send(hours);
});

export default router;
