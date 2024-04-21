import express from 'express';

interface Prize {
  title: string;
  description: string;
  photo: string;
}

const CONTEST_RULES = `Eligibility - To be eligible to enter the contest, you must live in California

Requirements - To receive 1 D4J point, you must use the D4J app's check-in feature while physically present at any of the businesses featured in the app, and with your mobile device's location services enabled. CK will verify that your device's location matches the check-in location, and award 1 point to your user account once verified. 1 D4J point represents one entry in the contest.

Duration - This contest will be active from June 1st, 2024 - June 30th, 2024, using Pacific Standard Time.  Entries submitted before June 1st 2024 will not be valid. Entries submitted after the contest has ended will not be eligible for this contest, but can be used as entries in subsequent contests.

Selection - The winning entries will be randomly chosen from all entries (check-ins) submitted during the duration of the contest. One entry will be selected for each prize. Limit 1 prize per contest participant. If a selected entry belongs to an ineligible contest participant, the selection will be discarded and the selection process will repeat until an eligible entry is found.

Claim process - Contest participants with winning entries will be contacted by email within 24 hours of the winner selection. The owner of a winning entry will have 7 days to respond and claim their prize. After this period, the selected entry will be invalidated and the entry's owner will be ineligible to win a prize in this contest.

Data use - The location data of your mobile device will only be used to verify that you are present at a location for the purposes of earning a D4J point. Location data associated with your contact information will be stored by CK but will never be shared with a 3rd party. Anonymized location data, not tied to any identifying information, may be used by CK for promotional purposes.

Disqualification - Contest participants will be disqualified if they attempt to manipulate the location verification process or alter the app software. CK may disqualify contest entries & participants if it is determined that automated processes (bots) were used in the course of participation.

CK is not responsible for injury or damage resulting from prizes earned in this contest. CK may cancel this contest in the event of a crisis or emergency.

This contest is not sponsored by Apple.
`;

const PRIZES: Prize[] = [
  {
    title: 'Grand Prize',
    description: '2 tickets to a Golden State Warriors home game',
    photo:
      'https://images.squarespace-cdn.com/content/v1/61760bdeb9da1d30a3f0c301/9fcc6e36-fa0a-458b-a142-36fa4606bd4c/steph.jpeg?format=2500w',
  },
  {
    title: '1st Prize',
    description: '2 tickets to an Oakland Roots home game',
    photo:
      'https://images.squarespace-cdn.com/content/v1/61760bdeb9da1d30a3f0c301/c3cf3086-1976-4ba9-a642-a8b55d547537/Copy+of+Roots+Single+Color+%28Black%29.png?format=750w',
  },
  {
    title: '2nd Prize',
    description: '$50 Gift Certificate to any Dining for Justice restaurant',
    photo:
      'https://images.squarespace-cdn.com/content/v1/61760bdeb9da1d30a3f0c301/1d65ab25-6175-4dcf-8a8e-186c445ff86a/leftfood.jpeg?format=2500w',
  },
  {
    title: '3rd Prize',
    description: 'Oakland Spice Shop spice kit',
    photo:
      'https://goodeggs4.imgix.net/4c86488e-8095-426c-9aea-4e53bcfda14d.jpg?w=840&h=525&fm=jpg&q=80&fit=crop',
  },
];

const router = express.Router();

router.get('/contest-rules', async (req, res) => {
  res.send({ rules: CONTEST_RULES });
});

router.get('/prizes', async (req, res) => {
  res.send(PRIZES);
});

export default router;
