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
          <p>Your Home Chef supplies are ready to be picked up at the CK Kitchen.
          Please come any time during our open hours to pick up your order.<br />
            <p<strong>CK Kitchen - 2270 Telegraph Ave, Oakland CA<br />
            Sunday - Thursday, 10am - 4pm</strong></p>
            <p>See you soon!<br />
            Community Kitchens</p>`,
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
