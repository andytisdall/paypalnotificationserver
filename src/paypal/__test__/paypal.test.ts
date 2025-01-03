import app from '../../../index';
import request from 'supertest';
import { generate } from 'generate-password';

it.skip('processes a donation w/o an exisiting contact', async () => {
  const randomFirstname = generate({
    length: 5,
  });
  const randomLastname = generate({
    length: 5,
  });

  await request(app)
    .post('/api/paypal')
    .send({
      payment_gross: '100.23',
      payment_fee: '2.50',
      payment_date: 'August 3rd, 2022, 00:00:00 PST',
      first_name: randomFirstname,
      last_name: randomLastname,
      payer_email: randomFirstname + '@fake.com',
      ipn_track_id: '1',
    })
    .expect(200);
});

it.skip('processes a donation with an existing contact', async () => {
  await request(app)
    .post('/api/paypal')
    .send({
      payment_gross: '54.21',
      payment_fee: '0.90',
      payment_date: 'February 20th, 2022, 00:00:00 PST',
      first_name: 'Joe',
      last_name: 'Duplicate',
      payer_email: 'joe@duplicate.fake',
      ipn_track_id: '2',
    })
    .expect(200);
});

it.skip('processes a new recurring donation', async () => {
  await request(app)
    .post('/api/paypal')
    .send({
      txn_type: 'recurring_payment_profile_created',
      amount: '50.00',
      time_created: 'June 20th, 2022, 00:00:00 PST',
      first_name: 'Robert',
      last_name: 'De Niro',
      payer_email: 'rob@deniro.com',
      payment_cycle: 'Monthly',
      ipn_track_id: '3',
    })
    .expect(200);
});

it.skip('processes an installment of a recurring donation', async () => {
  await request(app)
    .post('/api/paypal')
    .send({
      amount_per_cycle: '50.00',
      payment_gross: '50.00',
      payment_fee: '5.90',
      payment_date: 'September 20th, 2022, 00:00:00 PST',
      first_name: 'Robert',
      last_name: 'De Niro',
      payer_email: 'rob@deniro.com',
      ipn_track_id: '4',
    })
    .expect(200);
});

it.skip('processes a skipped payment', async () => {
  await request(app)
    .post('/api/paypal')
    .send({
      txn_type: 'recurring_payment_skipped',
      payment_gross: '54.21',
      payment_fee: '0.90',
      payment_date: 'February 20th, 2022, 00:00:00 PST',
      first_name: 'Robert',
      last_name: 'De Niro',
      payer_email: 'rob@deniro.com',
      ipn_track_id: '5',
    })
    .expect(200);
});

it.skip('processes a canceled recurring donation', async () => {
  await request(app)
    .post('/api/paypal')
    .send({
      txn_type: 'recurring_payment_suspended_due_to_max_failed_payment',
      amount_per_cycle: '54.21',
      payment_fee: '0.90',
      payment_date: 'February 20th, 2022, 00:00:00 PST',
      first_name: 'Robert',
      last_name: 'De Niro',
      payer_email: 'rob@deniro.com',
      ipn_track_id: '6',
    })
    .expect(200);
});
