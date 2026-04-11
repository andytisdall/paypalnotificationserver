import express from "express";

import { submitMealsPlusData } from "../../utils/salesforce/mealProgram/mealsPlus";
import { getContactByLastNameAndEmail } from "../../utils/salesforce/contact/getContact";
import sendMealsPlusFormSubmissionEmail from "../../utils/email/emailTemplates/mealsPlusFormSubmission";
import { addContact } from "../../utils/salesforce/contact/addContact";

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
  await sendMealsPlusFormSubmissionEmail({ name: firstName, email });

  res.send(201);
});

export default router;
