import express from 'express';

import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';

const router = express.Router();

interface MealProgramIntakeForm {
  name: string;
  address: string;
  contactName: string;
  contactPosition: string;
  contactEmail: string;
  contactNumber: string;
  date: string;
  bipoc: boolean;
  female: boolean;
  neighborhood: string;
  hardship: boolean;
  ebt: boolean;
  deliver: boolean;
  source: string;
  food: string;
}

interface NewIntakeFormObject {
  Restaurant_Name__c: string;
  Restaurant_Address__c: string;
  Contact_Name__c: string;
  Contact_Email__c: string;
  Contact_Number__c: string;
  Contact_Position__c: string;
  Date__c: string;
  BIPOC_Owned__c: boolean;
  Female_Owned__c: boolean;
  Neighborhood__c: string;
  Financial_Hardship__c: boolean;
  EBT_Calfresh_Interest__c: boolean;
  Able_to_Deliver__c: boolean;
  How_Did_You_Hear_About_CK__c: string;
  Type_of_Food__c: string;
}

router.post('/meal-program-intake', async (req, res) => {
  const {
    name,
    address,
    contactName,
    contactEmail,
    contactNumber,
    contactPosition,
    date,
    bipoc,
    female,
    neighborhood,
    hardship,
    ebt,
    deliver,
    source,
    food,
  }: MealProgramIntakeForm = req.body;

  const insertUri = urls.SFOperationPrefix + '/Meal_Program_Intake_Form__c';

  const newIntakeForm: NewIntakeFormObject = {
    Restaurant_Name__c: name,
    Restaurant_Address__c: address,
    Contact_Name__c: contactName,
    Contact_Email__c: contactEmail,
    Contact_Number__c: contactNumber,
    Contact_Position__c: contactPosition,
    Date__c: date,
    BIPOC_Owned__c: bipoc,
    Female_Owned__c: female,
    Neighborhood__c: neighborhood,
    Financial_Hardship__c: hardship,
    EBT_Calfresh_Interest__c: ebt,
    Able_to_Deliver__c: deliver,
    How_Did_You_Hear_About_CK__c: source,
    Type_of_Food__c: food,
  };

  const { data }: { data: { success: boolean } } = await fetcher.post(
    insertUri,
    newIntakeForm
  );

  if (!data.success) {
    throw Error('Failed to save form data');
  }

  res.sendStatus(201);
});
