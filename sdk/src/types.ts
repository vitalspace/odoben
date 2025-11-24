export interface User {
  address: string;
  username?: string;
  email?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  createdAt?: string;
}

export interface Upload {
  _id: string;
  blobId: string;
  owner: string;
  filename: string;
  mimeType: string;
  size: number;
  visibility: "public" | "private" | "paid";
  price: number;
  currency: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserParams {
  username?: string;
  email?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
}

export interface UploadParams {
  blobId: string;
  owner?: string;
  filename: string;
  mimeType: string;
  size: number;
  visibility?: "public" | "private" | "paid";
  price?: number;
  currency?: string;
}

export interface UpdateUploadParams {
  filename?: string;
  visibility?: "public" | "private" | "paid";
  price?: number;
  currency?: string;
}

export interface UnlockParams {
  uploadId: string;
  paymentProof?: string;
}

export interface UnlockResponse {
  blobId: string;
}

export interface WalrusUploadOptions {
  file: Blob; // Use Blob for compatibility with both Browser and Bun
  filename: string;
  owner?: string;
  visibility?: "public" | "private" | "paid";
  price?: number;
  currency?: string;
  publisherUrl?: string;
  aggregatorUrl?: string;
}

export interface ApiError {
  message: string;
  error?: any;
}
