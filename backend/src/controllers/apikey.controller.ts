import { Context } from "elysia";
import ApiKey from "../models/ApiKey";
import User from "../models/user.model";
import { hashKey } from "../utils/hash";
import { randomBytes } from "crypto";
import { authenticateUser } from "../utils/auth";

export const generateApiKey = async (ctx: Context) => {
  try {
    const address = await authenticateUser(ctx);
    if (!address) {
      ctx.set.status = 401;
      return { message: "Unauthorized" };
    }

    const user = await User.findOne({ address });
    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    // Generate Key
    const rawKey = "sk_" + randomBytes(24).toString("hex");
    const hashedKey = hashKey(rawKey);

    const newApiKey = new ApiKey({
      user: user._id,
      keyHash: hashedKey,
      name: (ctx.body as any)?.name || "My API Key",
    });

    await newApiKey.save();

    return {
      apiKey: rawKey,
      message: "Save this key now! You won't be able to see it again.",
    };
  } catch (error) {
    console.error(error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const listApiKeys = async (ctx: Context) => {
  try {
    const address = await authenticateUser(ctx);
    if (!address) {
      ctx.set.status = 401;
      return { message: "Unauthorized" };
    }

    const user = await User.findOne({ address });
    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    const keys = await ApiKey.find({ user: user._id }).select(
      "name createdAt lastUsedAt"
    );
    return keys;
  } catch (error) {
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const deleteApiKey = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const address = await authenticateUser(ctx);
    if (!address) {
      ctx.set.status = 401;
      return { message: "Unauthorized" };
    }

    const user = await User.findOne({ address });

    await ApiKey.findOneAndDelete({ _id: id, user: user?._id });

    return { message: "Deleted" };
  } catch (error) {
    ctx.set.status = 500;
    return { message: "Error" };
  }
};
