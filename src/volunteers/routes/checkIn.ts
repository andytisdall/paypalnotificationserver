import express from "express";
import { formatISO } from "date-fns";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
import {
  checkInVolunteer,
  getVolunteersForCheckIn,
  getTodaysVolunteerShifts,
} from "../../utils/salesforce/SFQuery/volunteer/checkin";
import { createHours } from "../../utils/salesforce/SFQuery/volunteer/hours";

import {
  addSlotToShift,
  getShift,
} from "../../utils/salesforce/SFQuery/volunteer/shifts";

const router = express.Router();

router.get(
  "/check-in/shifts",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const shifts = await getTodaysVolunteerShifts();
    res.send(shifts);
  },
);

router.get(
  "/check-in/:shiftId",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const shiftId = req.params.shiftId as string;
    const contacts = await getVolunteersForCheckIn(shiftId);
    res.send(contacts);
  },
);

router.post(
  "/check-in",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { hoursId, duration }: { hoursId: string; duration: number } =
      req.body;

    await checkInVolunteer({ hoursId, duration });

    res.sendStatus(204);
  },
);

router.post(
  "/check-in/hours",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { contactId, shiftId }: { contactId: string; shiftId: string } =
      req.body;

    // must change desired # of volunteers if the shift is full, otherwise it can't create the hours

    const shift = await getShift(shiftId);
    if (!shift) {
      throw Error("Shift not found");
    }
    if (!shift.open) {
      await addSlotToShift(shift);
    }

    const hours = await createHours({
      shiftId,
      contactId,
      jobId: shift.job,
      date: formatISO(new Date()),
    });

    res.send(hours);
  },
);

export default router;
