import express from 'express';
import moment from 'moment';
import mongoose from 'mongoose';

import { sendDonationAckEmail } from '../../utils/email';
import {
  addContact,
  Contact,
  getContactByEmail,
} from '../../utils/salesforce/SFQuery/contact';
import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';
import { activeCampaigns } from './activeCampaigns';

const PaypalTxn = mongoose.model('PaypalTxn');
const paypalRouter = express.Router();

interface PaypalData {
  payment_cycle?: string;
  last_name: string;
  txn_type: string;
  payer_email: string;
  first_name: string;
  amount_per_cycle?: string;
  amount?: string;
  payment_gross: string;
  payment_fee?: string;
  ipn_track_id: string;
  payment_date?: string;
  time_created: string;
  item_number?: string;
  test_ipn?: string;
}

interface SFInsertResponse {
  success: boolean;
  id: string;
}

interface OppObject {
  Amount: string;
  AccountId: string;
  npsp__Primary_Contact__c: string;
  StageName: string;
  CloseDate: string;
  Name: string;
  RecordTypeId: string;
  Processing_Fee__c?: string;
  CampaignId?: string;
}

interface RecurringDonationObject {
  npe03__Contact__c: string;
  npe03__Date_Established__c: string;
  npe03__Amount__c: string;
  npsp__RecurringType__c: string;
  npsp__Day_of_Month__c: string;
  npe03__Installment_Period__c: string;
  npsp__StartDate__c: string;
  npe03__Recurring_Donation_Campaign__c?: string;
}

// listener for paypal message
paypalRouter.post('/', async (req, res) => {
  // return early if it's not a donation

  const paypalData: PaypalData = req.body;
  // console.log(paypalData);

  // check for already processed transaction
  const existingTxn = await PaypalTxn.findOne({
    txnId: paypalData.ipn_track_id,
  });
  if (existingTxn) {
    console.log('Already processed this transaction, this is a duplicate');
    return res.sendStatus(200);
  }

  if (paypalData.payment_gross && parseFloat(paypalData.payment_gross) < 0) {
    console.log('not a credit');
    return res.sendStatus(200);
  }

  // post a verification to paypal - not working
  // verifyPaypalMessage(paypalData);

  await fetcher.setService('salesforce');

  // Check if contact exists
  let existingContact = await getContactByEmail(paypalData.payer_email);

  if (!existingContact) {
    // contact needs to be added first so that opp can have a contactid
    const contactToAdd = {
      FirstName: paypalData.first_name,
      LastName: paypalData.last_name,
      Email: paypalData.payer_email,
    };
    existingContact = await addContact(contactToAdd);
  }

  const canceledSubscriptionStatuses = [
    'recurring_payment_suspended_due_to_max_failed_payment',
    'recurring_payment_profile_cancel',
    'recurring_payment_expired',
    'recurring_payment_suspended',
    'recurring_payment_failed',
  ];

  if (paypalData.txn_type === 'recurring_payment_profile_created') {
    await addRecurring(paypalData, existingContact);
  } else if (paypalData.txn_type === 'recurring_payment_skipped') {
    await updateRecurringOpp(paypalData, existingContact, 'Closed Lost');
  } else if (canceledSubscriptionStatuses.includes(paypalData.txn_type)) {
    await cancelRecurring(paypalData, existingContact);
  } else if (!paypalData.payment_date) {
    // catch all clause for unknown transaction type
    console.log('Unknown type of message: no payment date');
  } else if (paypalData.amount_per_cycle) {
    // if donation is recurring, pledged opp will already exist in sf
    // update payment amount and stage
    await updateRecurringOpp(paypalData, existingContact, 'Posted');

    // thank you email

    await sendDonationAckEmail(paypalData);
  } else {
    // insert opportunity
    await addDonation(paypalData, existingContact);

    // thank you email

    await sendDonationAckEmail(paypalData);
  }

  const newTxn = new PaypalTxn({ txnId: paypalData.ipn_track_id });
  await newTxn.save();
  // send paypal back a 200
  res.sendStatus(200);
});

const formatDate = (date: string) => {
  const splitDate = date.split(' ').filter((el, i, a) => i !== a.length - 1);
  return moment(splitDate, 'HH:mm:ss MMM D, YYYY').format();
};

// const verifyPaypalMessage = async (paypalData: PaypalData) => {
//   await fetcher.setService('paypal');
//   const verificationPost = new URLSearchParams();
//   verificationPost.append('cmd', '_notify_validate');
//   for (let field in paypalData) {
//     // @ts-ignore
//     verificationPost.append(field, paypalData[field]);
//   }

//   const paypalResponse = await fetcher.post('/', verificationPost, {
//     headers: {
//       'User-Agent': 'Node-IPN-VerificationScript',
//       'Content-type': 'application/x-www-form-urlencoded',
//     },
//   });

//   console.log(paypalResponse);
//   if (paypalResponse?.data !== 'VERIFIED') {
//     return { success: true };
//   } else {
//     console.log('Invalid');
//   }
// };

const addRecurring = async (paypalData: PaypalData, contact: Contact) => {
  const formattedDate = formatDate(paypalData.time_created);

  let dayOfMonth = moment(formattedDate).format('D');
  if (
    parseInt(dayOfMonth) === 31 ||
    (moment(formattedDate).format('M') === '2' && parseInt(dayOfMonth) >= 28)
  ) {
    dayOfMonth = 'Last_Day';
  }

  const recurringToAdd: RecurringDonationObject = {
    npe03__Contact__c: contact.id,
    npe03__Date_Established__c: formattedDate,
    npe03__Amount__c: paypalData.amount!,
    npsp__RecurringType__c: 'Open',
    npsp__Day_of_Month__c: dayOfMonth,
    npe03__Installment_Period__c: paypalData.payment_cycle!,
    npsp__StartDate__c: moment().format(),
  };

  if (paypalData.item_number && activeCampaigns[paypalData.item_number]) {
    recurringToAdd.npe03__Recurring_Donation_Campaign__c =
      activeCampaigns[paypalData.item_number].id;
  }

  const recurringInsertUri =
    urls.SFOperationPrefix + '/npe03__Recurring_Donation__c/';

  const response = await fetcher.post(recurringInsertUri, recurringToAdd);
  const summaryMessage = {
    // @ts-ignore
    success: response.data.success,
    name: `${paypalData.first_name} ${paypalData.last_name}`,
  };
  console.log('Recurring Donation Added: ' + JSON.stringify(summaryMessage));
};

const cancelRecurring = async (paypalData: PaypalData, contact: Contact) => {
  const recurringQuery = [
    'SELECT',
    'Id',
    'from',
    'npe03__Recurring_Donation__c',
    'WHERE',
    'npe03__Contact__c',
    '=',
    `'${contact.id}'`,
  ];

  const recurringQueryUri = urls.SFQueryPrefix + recurringQuery.join('+');

  let existingRecurring;
  const recurringQueryResponse = await fetcher.get(recurringQueryUri);
  if (recurringQueryResponse.data.totalSize !== 0) {
    existingRecurring = recurringQueryResponse.data.records[0];
  }

  if (existingRecurring) {
    const recurringToUpdate = {
      npsp__Status__c: 'Closed',
      npsp__ClosedReason__c: paypalData.txn_type.replace(/_/gi, ' '),
      npsp__EndDate__c: moment().add(1, 'days'),
    };

    const recurringUpdateUri =
      urls.SFOperationPrefix +
      '/npe03__Recurring_Donation__c/' +
      existingRecurring.Id;

    const response = await fetcher.patch(recurringUpdateUri, recurringToUpdate);
    const summaryMessage = {
      success: response.status === 204,
      name: `${paypalData.first_name} ${paypalData.last_name}`,
    };
    console.log(
      'Recurring Donation Canceled: ' + JSON.stringify(summaryMessage)
    );
  } else {
    throw Error('Recurring donation not found');
  }
};

const updateRecurringOpp = async (
  paypalData: PaypalData,
  contact: Contact,
  status: 'Closed Lost' | 'Posted'
) => {
  // query donations to get ID
  const oppQuery = [
    'SELECT',
    'Id',
    'from',
    'Opportunity',
    'WHERE',
    'npsp__Primary_Contact__c',
    '=',
    `'${contact.id}'`,
    'AND',
    'StageName',
    '=',
    `'Pledged'`,
  ];

  const oppQueryUri = urls.SFQueryPrefix + oppQuery.join('+');

  let existingOpp;

  const oppQueryResponse = await fetcher.get(oppQueryUri);
  if (oppQueryResponse.data.totalSize !== 0) {
    existingOpp = oppQueryResponse.data.records[0];
  }

  if (existingOpp) {
    const oppToUpdate = {
      StageName: status,
      Amount: paypalData.payment_gross,
    };

    const oppUpdateUri =
      urls.SFOperationPrefix + '/Opportunity/' + existingOpp.Id;

    const response = await fetcher.patch(oppUpdateUri, oppToUpdate);
    const summaryMessage = {
      success: response.status === 204,
      name: `${paypalData.first_name} ${paypalData.last_name}`,
    };
    console.log('Donation Updated: ' + JSON.stringify(summaryMessage));
  } else {
    throw Error('Existing opportunity not found');
  }
};
const addDonation = async (paypalData: PaypalData, contact: Contact) => {
  if (!paypalData.payment_date) {
    throw Error('Could not add donation without a payment date');
  }

  const formattedDate = formatDate(paypalData.payment_date);

  const oppToAdd: OppObject = {
    Amount: paypalData.payment_gross,
    AccountId: contact.householdId,
    npsp__Primary_Contact__c: contact.id,
    StageName: 'Posted',
    CloseDate: formattedDate,
    Name: `${paypalData.first_name} ${paypalData.last_name} Donation ${moment(
      formattedDate
    ).format('M/D/YYYY')}`,
    RecordTypeId: '0128Z000001BIZJQA4',
    Processing_Fee__c: paypalData.payment_fee,
  };
  if (paypalData.item_number && activeCampaigns[paypalData.item_number]) {
    oppToAdd.CampaignId = activeCampaigns[paypalData.item_number].id;
  }

  const oppInsertUri = urls.SFOperationPrefix + '/Opportunity';
  // @ts-ignore
  const response: { data: SFInsertResponse | undefined } = await fetcher.post(
    oppInsertUri,
    oppToAdd
  );
  const summaryMessage = {
    success: response.data?.success,
    amount: oppToAdd.Amount,
    name: `${paypalData.first_name} ${paypalData.last_name}`,
    date: paypalData.payment_date,
  };
  console.log('Donation Added: ' + JSON.stringify(summaryMessage));
};

export default paypalRouter;
