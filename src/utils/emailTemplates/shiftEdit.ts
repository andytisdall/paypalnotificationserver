import moment from 'moment';

export default (shift: {
  date: string;
  fridge: string;
  cancel: boolean;
  mealCount: number;
}) => {
  const editIntro =
    "We're sending you this email to confirm that you edited your home chef shift. Here is your updated shift information:";
  const cancelIntro =
    "We're sending you this email to confirm that you canceled your home chef shift. This shift has been canceled:";
  const intro = shift.cancel ? cancelIntro : editIntro;

  return `
    <p>Hi Home Chef!</p>
    <p>This is Community Kitchens. ${intro}</p>
      <ul>
        <li>Date: ${moment(shift.date).format('dddd M/D/YY')}</li>
        <li>Fridge: ${shift.fridge}</li>
        <li>Number of Meals: ${shift.mealCount}</li>
      </ul>
    <p>Thanks!</p>
    <p>Community Kitchens</p>
  `;
};
