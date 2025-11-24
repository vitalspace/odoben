import { createHash } from "crypto";

export const hashKey = (key: string) => {
  return createHash("sha256").update(key).digest("hex");
};
