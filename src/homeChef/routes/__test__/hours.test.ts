import app from '../../../../index';
import request from 'supertest';

import { FormattedShift } from '../homeChefJobListing';
import { FormattedHours } from '../hours';

it('gets the list of shifts and signs up for a shift', async () => {
  const token = await global.getToken({ admin: false });
  const res = await request(app)
    .get('/api/home-chef/job-listing')
    .set('Authorization', token)
    .expect(200);

  const shifts: FormattedShift[] = res.body.shifts;

  const shift = shifts.find((sh) => sh.open);
  if (!shift) {
    throw Error();
  }
  const date = shift.startTime;

  await request(app)
    .post('/api/home-chef/hours')
    .set('Authorization', token)
    .send({
      mealCount: '25',
      shiftId: shift.id,
      jobId: shift.job,
      date,
    })
    .expect(201);
});

it('gets the hours for a contact and then edits one', async () => {
  const token = await global.getToken({ admin: false });
  const hoursRes = await request(app)
    .get('/api/home-chef/hours')
    .set('Authorization', token)
    .expect(200);

  const hours: FormattedHours[] = hoursRes.body;
  const hour = hours[0];
  if (!hour) {
    throw Error('No hours to edit');
  }

  await request(app)
    .patch(`/api/home-chef/hours/${hour.id}`)
    .set('Authorization', token)
    .send({ mealCount: '50' })
    .expect(200);
});
