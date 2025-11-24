import mongoose, { Document, Schema } from "mongoose";

export interface IApiKey extends Document {
  user: mongoose.Types.ObjectId;
  keyHash: string;
  name: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

const ApiKeySchema = new Schema<IApiKey>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  keyHash: {
    type: String,
    required: true,
    select: false, // Never return the hash by default
  },
  name: {
    type: String,
    required: true,
    default: "Default API Key",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
  },
});

// Index for fast lookups (though we usually look up by key, we can't index the raw key if we only store hash.
// Typically we store a prefix or ID + Secret. For simplicity, we'll just store the hash and iterate or use ID+Secret format.
// Better approach: API Key = "pk_live_" + randomString. Store hash(randomString).
// Even better: API Key = base64(id + ":" + secret). We can look up by ID, then verify secret.
// Let's stick to simple: API Key = randomString. We store hash.
// Wait, if we store hash, we can't look up by hash efficiently if we use bcrypt.
// If we use SHA256, we can look up.
// Let's use a simple SHA256 hash for the API key so we can query it directly.
// Security trade-off: fast lookup vs brute force resistance. For API keys, high entropy random strings are hard to brute force anyway.

export default mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
