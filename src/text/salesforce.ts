import mongoose from "mongoose";

import {
  addTextSubscriber,
  editTextSubscriber,
} from "../utils/salesforce/text";
import { PhoneNumber, Region } from "./types";

const Phone = mongoose.model("Phone");

export const addPhoneNumber = async (
  user: PhoneNumber,
  number: string,
  region: Region,
) => {
  if (user) {
    user.region.push(region);
    await user.save();
    await editTextSubscriber(user.number, user.region);
  } else {
    const newPhone = new Phone({ number, region: [region] });
    await newPhone.save();
    await addTextSubscriber(newPhone.number, newPhone.region);
  }
};

export const removePhoneNumber = async (user: PhoneNumber, region: Region) => {
  if (!user) {
    return;
  }
  user.region = user.region.filter((r) => r !== region);
  await editTextSubscriber(user.number, user.region);
  await user.save();
};
