import { SupplyOrder } from "../../../homeChef/routes/ordering";
import { UnformattedContact } from "../../salesforce/SFQuery/contact/types";
import { sendEmail } from "../email";

export const sendOrderReadyEmail = async ({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}) => {
  await sendEmail({
    to: email,
    from: "volunteers@ckoakland.org",
    html: `<p>Hi ${firstName},</p>
          <p>Your Home Chef supplies are ready for pick up at CK's central kitchen. The address is 2270 Telegraph Avenue in Oakland.
          You are welcome to stop by Sunday through Thursday from 9 AM to 5 PM or Friday from 9 AM to 2 PM.</p>
          <p>When you walk in the front door,
          there are two brown bookshelves ahead of you to the left (behind the insulated meal containers) - there, you will find one <strong>or more</strong>
          cubbies with your name on it and on these shelves are your supplies!</p>
<p>If the door is locked, knock and someone should answer.
If you have any questions, please contact Kenai - <a href="mailto:kenai@ckoakland.org">kenai@ckoakland.org</a>.</p>
<p>
Kenai Rodrigue<br />
Program & Volunteer Manager<br />
Community Kitchens<br />
(510) 707-0075<br />
<a href="https://portal.ckoakland.org/volunteers">www.ckoakland.org/volunteer</a><br />
</p>`,
    subject: "Your Home Chef supplies are ready!",
  });
};

export const sendOrderConfirmation = async ({
  contact,
  order,
}: {
  contact: UnformattedContact;
  order: SupplyOrder;
}) => {
  if (contact.Email) {
    await sendEmail({
      to: contact.Email,
      from: "volunteers@ckoakland.org",
      html: `<p>Hi ${contact.FirstName},</p>
          <p>You have made a home chef supply order:</p>
          <p><strong>Containers:</strong> ${order.containers}<br />
          <strong>Labels:</strong> ${order.labels}<br />
          <strong>Soup Containers:</strong> ${order.soup}<br />
          <strong>Sandwich Boxes:</strong> ${order.sandwich}</p>
          <p>We will contact you by email when this order is ready to pick up from the CK Kitchen.</p>
          <p>Thanks for your request. We'll take care of your order as soon as possible. Please note that the CK Kitchen will be closed December 24-27 and January 1-3. Thank you, and we wish you a happy holiday season1</p>
          <p>Thanks!<br />
          Community Kitchens</p>`,
      subject: "You made a Home Chef supply order",
    });
  }
};

export const sendManagerSupplyOrder = async ({
  contact,
  order,
}: {
  contact: UnformattedContact;
  order: SupplyOrder;
}) => {
  await sendEmail({
    to: "kenai@ckoakland.org",
    from: "volunteers@ckoakland.org",
    html: `<p>${contact.FirstName} ${contact.LastName} has made a home chef supply order:</p>
    <p>Containers: ${order.containers}<br />
    Labels: ${order.labels}<br />
    Soup Containers: ${order.soup}<br />
    Sandwich Boxes: ${order.sandwich}</p>`,
    subject: "New Home Chef supply order",
  });
};
