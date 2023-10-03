export type RestaurantDocType = 'BL' | 'HD' | 'RC' | 'W9' | 'DD' | 'IN';
export type ContactDocType = 'HC' | 'FH';
export type D4JDocType = 'D4J';
export type CKKitchenDocType = 'CKK';
export type DocType =
  | RestaurantDocType
  | ContactDocType
  | D4JDocType
  | CKKitchenDocType;

export interface FileMetaData {
  title: string;
  description: string;
  folder: string;
}

type FileInfo = Record<DocType, FileMetaData>;

export const restaurantFileInfo: Record<RestaurantDocType, FileMetaData> = {
  BL: {
    title: 'Business License',
    description: '',
    folder: 'meal-program',
  },
  HD: {
    title: 'Health Department Permit',
    description: '',
    folder: 'meal-program',
  },
  RC: { title: 'Restaurant Contract', description: '', folder: 'meal-program' },
  W9: { title: 'W9', description: '', folder: 'meal-program' },
  DD: {
    title: 'Direct Deposit Form',
    description: '',
    folder: 'meal-program',
  },
  IN: {
    title: 'Insurance',
    description: '',
    folder: 'meal-program',
  },
};

export const chefFileInfo: Record<ContactDocType, FileMetaData> = {
  HC: { title: 'Vol Agreement', description: '', folder: 'home-chef' },
  FH: {
    title: 'Food Handler',
    description: '',
    folder: 'home-chef',
  },
};

export const d4jFileInfo: Record<D4JDocType, FileMetaData> = {
  D4J: { title: 'D4J Receipt', description: '', folder: 'd4j' },
};

export const CKKitchenFileInfo: Record<CKKitchenDocType, FileMetaData> = {
  CKK: { title: 'CK Kitchen Agreement', description: '', folder: 'ck-kitchen' },
};

export const fileInfo: FileInfo = {
  ...restaurantFileInfo,
  ...chefFileInfo,
  ...d4jFileInfo,
  ...CKKitchenFileInfo,
};

export interface FileWithType {
  docType: DocType;
  file: {
    data: Buffer;
    name: string;
  };
}
