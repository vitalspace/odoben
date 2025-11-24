import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  uploadId: mongoose.Types.ObjectId;
  buyerAddress: string;
  paymentProof: string; // Transaction digest
  price: number;
  currency: string;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    uploadId: { type: Schema.Types.ObjectId, ref: "Upload", required: true },
    buyerAddress: { type: String, required: true },
    paymentProof: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index to quickly check if a user bought a file
PurchaseSchema.index({ uploadId: 1, buyerAddress: 1 }, { unique: true });

export const Purchase = mongoose.model<IPurchase>("Purchase", PurchaseSchema);
