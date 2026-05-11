import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { InsertSuccessResponse } from "../../reusableTypes";
import { getContactByEmail } from "../../contact/getContact";
import { CampaignMemberObject } from "./types";
import createQuery, { FilterGroup } from "../../queryCreator";

export const insertCampaignMember = async (
  campaignMember: Pick<CampaignMemberObject, "ContactId" | "CampaignId">,
) => {
  // const fields = ["Id"] as const;
  // const obj = "CampaignMember";
  // const filters: FilterGroup<CampaignMemberObject> = {
  //   AND: [
  //     { field: "ContactId", value: campaignMember.ContactId },
  //     { field: "CampaignId", value: campaignMember.CampaignId },
  //   ],
  // };

  // const existingCampaignMembers = await createQuery<
  //   CampaignMemberObject,
  //   (typeof fields)[number]
  // >({
  //   fields,
  //   filters,
  //   obj,
  // });
  // if (existingCampaignMembers[0]) {
  //   return;
  // }
  const url = urls.SFOperationPrefix + "/CampaignMember";
  const res: { data: InsertSuccessResponse | undefined } = await fetcher.post(
    url,
    campaignMember,
  );
  if (!res.data?.success) {
    throw Error("Could not insert campaign member object");
  }
};
