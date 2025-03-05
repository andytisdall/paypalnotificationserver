import { D4JContact } from '../salesforce/SFQuery/contact';

export default (
  contact: D4JContact,
  prize: string,
  restaurantName?: string
) => {
  return `<p>Hi Andy</p>,
  <p>A person has requested to redeem their D4J points for a prize.</p>
  <ul>
  <li>Contact: ${contact.email}</li>
  <li>Prize: ${prize}</li>
  ${restaurantName ? `Restaurant: ${restaurantName}` : ''}
  Best, Yourself.
  `;
};
