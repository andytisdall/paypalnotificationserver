import { format } from "date-fns";

import { DocInformation } from "../../sign/routes/docConfig";
import fetcher from "../fetcher";

interface CreateDocArgs {
  templates: {
    field_data: {
      field_text_data: Record<string, string>;
      field_boolean_data: Record<string, string>;
      field_date_data: Record<string, string>;
    };
    actions: {
      recipient_name: string;
      recipient_email: string;
      action_id: string;
      action_type: "SIGN";
      is_embedded: boolean;
    }[];
  };
}

export const createRequest = async ({
  contact,
  doc,
  hoursId,
}: {
  contact: {
    name: string;
    id: string;
    email: string;
  };
  doc: DocInformation;
  hoursId?: string;
}) => {
  await fetcher.setService("zoho");

  const response = await fetcher.get("/templates/" + doc.template);
  const { actions } = response.data.templates;
  const createDocFromTemplateBody: CreateDocArgs = {
    templates: {
      field_data: {
        field_text_data: { "Full name": contact.name },
        field_boolean_data: {},
        field_date_data: { "Sign date": format(new Date(), "MMM dd yyyy") },
      },
      actions: [
        {
          recipient_email: contact.email,
          recipient_name: contact.name,
          action_id: actions[0].action_id,
          action_type: "SIGN",
          is_embedded: true,
        },
      ],
    },
  };
  const { data } = await fetcher.post(
    "/templates/" + doc.template + "/createdocument",
    createDocFromTemplateBody,
    { params: { is_quicksend: false } }
  );

  const { request_id } = data.requests;
  const { fields } = data.requests;
  const { action_id } = data.requests.actions[0];

  let redirectUrl = "https://portal.ckoakland.org" + doc.url;

  if (hoursId) {
    redirectUrl = redirectUrl + `/${contact.id}/${hoursId}`;
  }

  await fetcher.post("/requests/" + request_id + "/submit", {
    requests: {
      actions: [{ action_id, action_type: "SIGN", fields }],
      redirect_pages: {
        sign_success: redirectUrl,
        sign_completed: redirectUrl,
        sign_declined: redirectUrl,
        sign_later: redirectUrl,
      },
    },
  });

  const signResponse = await fetcher.post(
    "/requests/" + request_id + "/actions/" + action_id + "/embedtoken",
    {},
    { params: { host: "https://portal.ckoakland.org/" } }
  );

  return signResponse.data.sign_url;
};
