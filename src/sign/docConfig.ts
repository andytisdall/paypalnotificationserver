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
}

const volunterWaiverInfo: Pick<DocInformation, "template" | "type" | "name"> = {
  template: "Byb7MzMSPUyrTfrAH6FA3QwocGBWvsTLj",
  name: "CK Kitchen Volunteer Agreement",
  type: "CKK",
};

export const docInfo: Record<string, DocInformation> = {
  HC: {
    type: "HC",
    url: "/home-chef/onboarding/sign/success",
    template: "C4smCqWwfnKDXMCKVyee8SAQHtBDekzSn",
    name: "CK Home Chef Volunteer Agreement",
  },
  CI: {
    url: "/volunteer-check-in/confirm",
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
