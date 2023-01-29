const app = require('../../../../index.js');
const request = require('supertest');

it('sends an outgoing text', async () => {
  const res = await request(app)
    .post('/api/text/meal-survey')
    .send({
      Meal_Name__c: 'Chicken',
      Location__c: 'Homies',
      Meal_Taste__c: '4',
      Meal_Size__c: '3',
      Desired_Meal_Type__c: 'sandwich',
      Desired_Ingredients__c: 'pepperoni',
      Days_of_Use_Per_Week__c: '7',
      Phone_Number__c: '5108290484',
    })
    .expect(200);
});
