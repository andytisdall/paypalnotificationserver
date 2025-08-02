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

export const docInfo: Record<string, DocInformation> = {
  HC: {
    type: "HC",
    url: "/home-chef/onboarding/sign/success",
    template: "489948000000063117",
    name: "CK Home Chef Volunteer Agreement",
  },
  CI: {
    type: "CKK",
    url: "/volunteer-check-in/confirm",
    template: "489948000000063075",
    name: "CK Kitchen Volunteer Agreement",
    failUrl: "/volunteer-check-in/list",
  },
  CKK: {
    type: "CKK",
    url: "/volunteers/sign/success",
    template: "489948000000063075",
    name: "CK Kitchen Volunteer Agreement",
  },
  DRV: {
    type: "CKK",
    url: "/volunteers/driver-onboarding/sign/success",
    template: "489948000000063075",
    name: "CK Kitchen Volunteer Agreement",
  },
};
