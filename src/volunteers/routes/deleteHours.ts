import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { getContactById } from '../../utils/salesforce/SFQuery/contact';
import {
  getHours,
  deleteVolunteerHours,
} from '../../utils/salesforce/SFQuery/volunteer/hours';
import { getCampaignFromHours } from '../../utils/salesforce/SFQuery/volunteer/campaign/campaign';
import urls from '../../utils/urls';
import {
  sendKitchenShiftCancelEmail,
  sendEventShiftCancelEmail,
} from '../../utils/email';

const router = express.Router();

router.delete('/hours/:id/:salesforceId?', currentUser, async (req, res) => {
  const id = req.params.id;
  const salesforceId = req.params.salesforceId;

  let contactId = '';
  if (req.currentUser) {
    contactId = req.currentUser.salesforceId;
  } else {
    contactId = salesforceId;
  }

  if (!contactId) {
    throw Error('Could not find contact');
  }

  const campaign = await getCampaignFromHours(id);

  if (!campaign) {
    throw Error('Could not get campaign info');
  }

  const hours = await getHours(campaign.id, contactId);
  const hour = hours.find((h) => h.id === id);

  if (hour) {
    await deleteVolunteerHours(id);
    const { Email, FirstName } = await getContactById(contactId);
    if (Email) {
      if (campaign.id === urls.ckKitchenCampaignId) {
        await sendKitchenShiftCancelEmail(Email, {
          date: hour.time,
          name: FirstName,
        });
      } else {
        await sendEventShiftCancelEmail(Email, {
          date: hour.time,
          name: FirstName,
          event: campaign.name,
        });
      }
    }
    res.sendStatus(204);
  } else {
    throw Error('Volunteer hours do not belong to this contact');
  }
});

export default router;