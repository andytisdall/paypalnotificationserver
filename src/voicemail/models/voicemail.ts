import mongoose from "mongoose";

const voicemailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recordingId: String,
  },

  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export const Voicemail = mongoose.model("Voicemail", voicemailSchema);
