import app from '../../../index';
import request from 'supertest';

it('submits a meal survey', async () => {
  await request(app)
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

it('submits a text signup survey', async () => {
  await request(app)
    .post('/api/text/signup-survey')
    .send({
      age: '10',
      ethnicity: 'African American/Black',
      zip: '94606',
      type: 'Vegetarian',
      ingredients: 'Zucchini',
      days: '3',
      phone: '5108670484',
    })
    .expect(200);
});
