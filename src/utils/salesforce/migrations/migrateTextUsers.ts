import mongoose from 'mongoose';
import { PhoneNumber } from '../../../text/routes/incomingText';
import { addTextSubscriber } from '../SFQuery';

const Phone = mongoose.model('Phone');

export const migrateTextSubscribers = async () => {
  const allTextNumbers: PhoneNumber[] = await Phone.find({});
  const promises = allTextNumbers
    .filter((p) => p && p.number && p.region)
    .map((phone) => {
      return addTextSubscriber(phone!.number, phone!.region);
    });
  await Promise.all(promises);
};
