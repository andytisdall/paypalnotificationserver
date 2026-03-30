export interface UserInfo {
  name: string;
  email: string;
  id: string;
}

export type DocType = "HC" | "CKK";

export interface DocInformation {
  url: string;
  template: string;
  type: DocType;
  name: string;
  failUrl?: string;
}

const volunterWaiverInfo: Pick<DocInformation, "template" | "type" | "name"> = {
  template: "489948000000063075",
  name: "CK Kitchen Volunteer Agreement",
  type: "CKK",
};

export const docInfo: Record<string, DocInformation> = {
  HC: {
    type: "HC",
    url: "/home-chef/onboarding/sign/success",
    template: "489948000000063117",
    name: "CK Home Chef Volunteer Agreement",
  },
  CI: {
    url: "/volunteer-check-in/confirm",
    failUrl: "/volunteer-check-in/list",
    ...volunterWaiverInfo,
  },
  CKK: {
    url: "/volunteers/sign/success",
    ...volunterWaiverInfo,
  },
  DRV: {
    url: "/volunteers/driver-onboarding/sign/success",
    ...volunterWaiverInfo,
  },
  MMT: {
    url: "/volunteers/mobile-meal-team/sign/success",
    ...volunterWaiverInfo,
  },
};
