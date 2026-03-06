import express from "express";

import { submitMealsPlusData } from "../../utils/salesforce/SFQuery/mealProgram";
import {
  addContact,
  getContactByLastNameAndEmail,
} from "../../utils/salesforce/SFQuery/contact/contact";

const router = express.Router();

type Service = {
  name: string;
  location: string;
  time: string;
  description?: string;
  instructions?: string;
};

router.post("/meals-plus", async (req, res) => {
  const {
    services,
    cbo,
    email,
    firstName,
    lastName,
  }: {
    services: Service[];
    cbo: string;
    email: string;
    firstName: string;
    lastName: string;
  } = req.body;

  let contact = await getContactByLastNameAndEmail(lastName, email);
  if (!contact) {
    contact = await addContact({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
    });
  }

  const promises = services.map(
    async ({ name, location, time, description, instructions }) => {
      await submitMealsPlusData({
        name,
        location,
        time,
        cbo,
        description,
        instructions,
        contactId: contact.id,
      });
    },
  );

  await Promise.all(promises);

  res.send(201);
});

export default router;
