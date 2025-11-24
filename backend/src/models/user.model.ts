import mongoose, { type Document, Schema } from "mongoose";

interface IUser extends Document {
  address: string;
  avatar: string;
  banner: string;
  username: string;
  email: string;
  bio: string;
  password?: string;
}

const UserSchema = new Schema<IUser>(
  {
    address: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    banner: { type: String, default: "" },
    username: { type: String, default: "" },
    email: { type: String, default: "" },
    bio: { type: String, default: "" },
    password: { type: String, select: false }, // select: false to exclude from queries by default
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
