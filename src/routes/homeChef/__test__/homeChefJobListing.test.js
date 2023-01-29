const app = require('../../../../index.js');
const request = require('supertest');

it('gets the job listings', async () => {
  const token = await global.getToken({ admin: false });
  const res = await request(app)
    .get('/api/home-chef/job-listing')
    .set('Authorization', token)
    .expect(200);

  expect(res.body.jobs.length).not.toEqual(0);
  expect(res.body.shifts).not.toEqual(0);
});
