import express from "express";
import mongoose from "mongoose";
import { GetVoicemailResponse } from "@community-kitchens/apiinterfaces";

import { requireAdmin } from "../../middlewares/require-admin";
import { twilioClient } from "../../text/twilioClient";

const Voicemail = mongoose.model("Voicemail");
const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  // const user = req.currentUser!;
  const voicemail = await twilioClient.client?.recordings.list();

  // if (user.username !== "Andy") {
  //   const userVoicemails = (await Voicemail.find({ user: user.id })).map(
  //     (vm: { recordingId: string }) => vm.recordingId,
  //   );
  //   const userRecordings = recordings?.filter((rec) => {
  //     return userVoicemails.includes(rec.sid);
  //   });
  //   res.send({ recordings: userRecordings });
  // } else {

  if (!voicemail) {
    throw Error("Error retrieving voicemail");
  }

  const recordings = voicemail.map((vm) => ({
    mediaUrl: vm.mediaUrl,
    sid: vm.sid,
    dateCreated: vm.dateCreated.toString(),
  }));
  const allVms = await Voicemail.find();
  const response: GetVoicemailResponse = { recordings, userVms: allVms };
  res.send(response);
  // }
});

router.post("/:userId", async (req, res) => {
  const { RecordingSid }: { RecordingSid: string } = req.body;
  const { userId } = req.params;
  const newVoicemail = new Voicemail({
    user: userId,
    recordingId: RecordingSid,
  });
  await newVoicemail.save();
  res.send(null);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await twilioClient.client?.recordings(id).remove();
  await Voicemail.deleteOne({ recordingId: id });
  res.send(null);
});

export default router;
