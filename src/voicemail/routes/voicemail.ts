import express from "express";
import { requireAdmin } from "../../middlewares/require-admin";
import { twilioClient } from "../../text/twilioClient";

const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  const recordings = await twilioClient.client?.recordings.list();

  res.send(recordings);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await twilioClient.client?.recordings(id).remove();
  res.send(null);
});

export default router;
