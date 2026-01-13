import fetcher from "../../../../fetcher";
import urls from "../../../../urls";
import { InsertSuccessResponse } from "../../reusableTypes";
import { getContactByEmail } from "../../contact/contact";
import { CampaignMemberObject } from "./types";
import createQuery, { FilterGroup } from "../../queryCreator";

export const insertCampaignMember = async (
  campaignMember: Pick<CampaignMemberObject, "ContactId" | "CampaignId">
) => {
  const fields = ["Id"] as const;
  const obj = "CampaignMember";
  const filters: FilterGroup<CampaignMemberObject> = {
    AND: [
      { field: "ContactId", value: campaignMember.ContactId },
      { field: "CampaignId", value: campaignMember.CampaignId },
    ],
  };

  const existingCampaignMembers = await createQuery<
    CampaignMemberObject,
    (typeof fields)[number]
  >({
    fields,
    filters,
    obj,
  });
  if (existingCampaignMembers[0]) {
    return;
  }
  const url = urls.SFOperationPrefix + "/CampaignMember";
  const res: { data: InsertSuccessResponse | undefined } = await fetcher.post(
    url,
    campaignMember
  );
  if (!res.data?.success) {
    throw Error("Could not insert campaign member object");
  }
};

export const updateCampaignMember = async ({
  email,
  campaignId,
  response,
}: {
  email: string;
  campaignId: string;
  response: { attending: boolean; guest: boolean };
}) => {
  await fetcher.setService("salesforce");

  const contact = await getContactByEmail(email);

  if (!contact) {
    throw Error("Could not find a contact with that email");
  }

  const fields = ["Id"] as const;
  const obj = "CampaignMember";
  const filters: FilterGroup<CampaignMemberObject> = {
    AND: [
      { field: "ContactId", value: contact.id },
      { field: "CampaignId", value: campaignId },
    ],
  };
  const campaignMembers = await createQuery<
    CampaignMemberObject,
    (typeof fields)[number]
  >({ fields, obj, filters });

  const campaignMember = campaignMembers[0];

  if (!campaignMember) {
    throw Error("Contact is not on guest list");
  }

  const status = response.attending
    ? response.guest
      ? "Attending with Guest"
      : "Attending"
    : "Not Attending";

  const url = urls.SFOperationPrefix + "/CampaignMember/" + campaignMember.Id;
  const res: { data: InsertSuccessResponse | undefined } = await fetcher.patch(
    url,
    { Status: status }
  );

  if (!res.data?.success) {
    throw Error("Could not update guest status. Please try again.");
  }
};
