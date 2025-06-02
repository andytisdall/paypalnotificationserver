import mongoose from "mongoose";
import { Password } from "../password";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    salesforceId: String,
    busDriver: {
      type: Boolean,
      default: false,
    },
    googleId: String,
    appleId: String,
    homeChefNotificationToken: String,
    secretCode: String,
    textOnlyPermission: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        delete ret.secretCode;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

export const User = mongoose.model("User", userSchema);
