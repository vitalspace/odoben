import mongoose, { Document, Schema } from "mongoose";

export interface IUpload extends Document {
  blobId: string;
  owner: string;
  filename: string;
  mimeType: string;
  size: number;
  visibility: "public" | "private" | "paid";
  price?: number;
  currency?: string;
  slug: string;
  createdAt: Date;
}

const uploadSchema = new Schema<IUpload>(
  {
    blobId: { type: String, required: true, unique: true },
    owner: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    visibility: {
      type: String,
      enum: ["public", "private", "paid"],
      default: "private",
    },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "SUI" },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const Upload = mongoose.model<IUpload>("Upload", uploadSchema);
