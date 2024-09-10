import express from 'express';

import homeChefUpdate from '../../files/salesforce/homeChefUpdate';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { getContactById } from '../../utils/salesforce/SFQuery/contact';

interface HomeChefQuizQuestion {
  question: string;
  answers: string[];
}

interface HomeChefQuizAnswer {
  index: number;
  answer: number;
}

interface HomeChefQuizResponse {
  passed: boolean;
  score: number;
  wrongAnswers: number[];
}

const MIN_SCORE = 7;

const router = express.Router();

const questions: HomeChefQuizQuestion[] = [
  {
    question: 'What is required to become a Home Chef?',
    answers: [
      'Complete orientation, obtain Food Handlers card, sign Volunteer waiver and agreement',
      'Be a professional Chef',
    ],
  },
  {
    question: 'What do Home Chefs do?',
    answers: [
      'Cook every day for Town Fridges',
      'Cook and deliver 15-30 home cooked meals, 1-2 times per month to Town Fridges',
    ],
  },
  {
    question: 'What does Community Kitchens provide for Home Chefs?',
    answers: [
      'Reimbursement for ingredients',
      'Labels, meal containers, additional produce, annual tax deductible in kind donation receipt',
    ],
  },
  {
    question: 'Meals should be delivered to Town Fridges hot.',
    answers: ['True', 'False'],
  },
  {
    question:
      'What is the last step to take once you deliver meals to a fridge?',
    answers: [
      'Use the CK app to send a delivery text to the community',
      'Email CK Staff',
    ],
  },
  {
    question:
      'What are the three most important Food Safety Basics for being a Home Chef?',
    answers: [
      'Cooking in a commercial kitchen',
      'Using a dishwasher',
      'Handwashing, avoid cross contamination, temperature controls',
    ],
  },
  {
    question: 'A Food Handlers Food is required to be a CK Home Chef',
    answers: ['True', 'False'],
  },
  {
    question:
      'Where do you sign up for shifts, find recipes and label templates?',
    answers: [
      'www.ckoakland.org',
      'CK Volunteer Portal: https://portal.ckoakland.org/volunteers',
      'At the CK Central Kitchen',
    ],
  },
  {
    question: 'What’s the recommended timeline for safe meal preparation?',
    answers: [
      'Cook and deliver meals hot to the Town Fridge',
      'One day before the delivery date, prepare ingredients, cook, cool and store properly. On the delivery day assemble, label and deliver meals COLD to the Town Fridge',
      'One week before the delivery',
    ],
  },
  {
    question:
      'As long as one person has gone through Home Chef training, anyone can cook with them!',
    answers: ['True', 'False'],
  },
];

const correctAnswers: Record<number, number> = {
  0: 0,
  1: 1,
  2: 1,
  3: 1,
  4: 0,
  5: 2,
  6: 0,
  7: 1,
  8: 1,
  9: 0,
};

router.get('/quiz', async (req, res) => {
  res.send(questions);
});

router.post('/quiz', currentUser, requireAuth, async (req, res) => {
  const answers: HomeChefQuizAnswer[] = req.body;
  if (answers.length !== questions.length) {
    throw Error('Received incomplete set of answers');
  }

  const wrongAnswers = answers
    .filter((answer) => correctAnswers[answer.index] !== answer.answer)
    .map((answer) => answer.index);

  const score = questions.length - wrongAnswers.length;
  const passed = score >= MIN_SCORE;

  const response: HomeChefQuizResponse = {
    passed,
    wrongAnswers,
    score,
  };

  // update salesforce if passed
  // check if files have been uploaded and update home chef status to active if yes

  if (passed) {
    const contact = await getContactById(req.currentUser!.salesforceId);
    await homeChefUpdate([], contact, true);
  }

  res.send(response);
});

export default router;
