import { Context } from "elysia";
import ApiKey from "../models/ApiKey";
import { hashKey } from "./hash";

export const authenticateUser = async (ctx: Context) => {
  const auth_token = ctx.cookie?.auth_token;

  // Robust header extraction using ctx.request.headers as fallback
  const authorizationHeader =
    ctx.headers?.["authorization"] || ctx.request.headers.get("authorization");
  const apiKeyHeader =
    ctx.headers?.["x-api-key"] || ctx.request.headers.get("x-api-key");
  const walletAddressHeader =
    ctx.headers?.["x-wallet-address"] ||
    ctx.request.headers.get("x-wallet-address");

  let address: string | undefined;

  // 1. Try Authorization Header (Bearer token)
  if (authorizationHeader) {
    try {
      const token = authorizationHeader.replace(/^Bearer\s+/i, "");

      // Check if it's an API Key (starts with sk_)
      if (token.startsWith("sk_")) {
        const hashed = hashKey(token);
        const apiKey = await ApiKey.findOne({ keyHash: hashed }).populate(
          "user"
        );
        if (apiKey && apiKey.user) {
          // @ts-ignore
          address = apiKey.user.address;
          // Update last used
          apiKey.lastUsedAt = new Date();
          await apiKey.save();
        }
      } else {
        // Assume it's a JWT
        // @ts-ignore
        const profile = await ctx.jwt.verify(token);
        if (profile) {
          address = profile.address;
        }
      }
    } catch (e) {
      console.error("[Auth] Error verifying Auth header token:", e);
      console.log("[Auth] Received header:", authorizationHeader);
    }
  }

  // 2. Try Wallet Address Header (for backward compatibility)
  if (!address && walletAddressHeader) {
    address = Array.isArray(walletAddressHeader)
      ? walletAddressHeader[0]
      : walletAddressHeader;
  }

  // 3. Try Cookie Auth if other methods failed
  if (!address && auth_token && auth_token.value) {
    try {
      // @ts-ignore
      const profile = await ctx.jwt.verify(auth_token.value);
      if (profile) {
        address = profile.address;
      }
    } catch (e) {
      console.error("[Auth] Error verifying Cookie token:", e);
    }
  }

  // 4. Try API Key Auth if JWT methods failed
  if (!address && apiKeyHeader) {
    try {
      const key = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
      const hashed = hashKey(key);
      const apiKey = await ApiKey.findOne({ keyHash: hashed }).populate("user");

      if (apiKey && apiKey.user) {
        // @ts-ignore
        address = apiKey.user.address;
        // Update last used
        apiKey.lastUsedAt = new Date();
        await apiKey.save();
      }
    } catch (error) {
      console.error("Error authenticating with API key:", error);
    }
  }

  return address || null;
};
