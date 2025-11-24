import { Context } from "elysia";
import User from "../models/user.model";
import { IUser } from "../types";
import { authenticateUser } from "../utils/auth";

export const updateUser = async (ctx: Context) => {
  try {
    // console.log("[updateUser] Called");

    // console.log(ctx, "SOMMEMEM")

    const address = await authenticateUser(ctx);
    // console.log("[updateUser] Address:", address);

    if (!address) {
      // console.log("[updateUser] Auth failed - no address");
      ctx.set.status = 401;
      return { message: "Unauthorized: Invalid token or API Key" };
    }

    const updates = ctx.body as Partial<IUser>;

    const user = await User.findOneAndUpdate({ address }, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    ctx.set.status = 200;
    return JSON.stringify(user);
  } catch (error) {
    console.error("Error in updateUser:", error);
    ctx.set.status = 500;
    return { message: "internal server error", error: String(error) };
  }
};

export const profile = async (ctx: Context) => {
  try {
    let { address } = ctx.body as IUser;

    if (!address) {
      address = (await authenticateUser(ctx)) as string;
    }

    if (!address) {
      ctx.set.status = 401;
      return { message: "Unauthorized" };
    }

    const user = await User.findOne({
      address,
    }).select("-_id -__v -updatedAt");

    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    ctx.set.status = 200;
    return JSON.stringify(user);
  } catch (error) {
    console.error("internal server error");
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};

export const loginWithWallet = async (ctx: Context) => {
  try {
    const { address } = ctx.body as any;
    console.log("Login request for address:", address);

    let user = await User.findOne({ address });
    if (!user) {
      console.log("User not found, creating new user for:", address);
      // Create new user
      user = new User({
        address,
        username: `User ${address.slice(0, 6)}`,
      });
      await user.save();
      console.log("User created successfully");
    } else {
      console.log("User found:", user._id);
    }

    // @ts-ignore
    const token = await ctx.jwt.sign({
      address: user.address,
    });
    console.log("Token generated");

    // ctx.cookie.auth_token.set({
    //   value: token,
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    //   path: "/",
    // });

    ctx.set.status = 200;
    return { user, token };
  } catch (error) {
    console.error("Login error:", error);
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};
