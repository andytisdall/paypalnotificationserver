export interface FileMetadata {
  title: string;
  description: string;
  folder: string;
}

export type Doc = "HC" | "FH" | "CKK" | "DL";

export const fileInfo: Record<Doc, FileMetadata> = {
  HC: { title: "Home Chef Agreement", description: "", folder: "home-chef" },
  FH: {
    title: "Food Handler",
    description: "",
    folder: "home-chef",
  },
  CKK: { title: "CK Kitchen Agreement", description: "", folder: "ck-kitchen" },
  DL: { title: "Driver's License", description: "", folder: "ck-kitchen" },
};

export interface FileWithMetadata {
  docType: keyof typeof fileInfo;
  file: {
    data: Buffer;
    name: string;
  };
}
