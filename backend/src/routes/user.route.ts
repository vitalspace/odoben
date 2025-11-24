import { Elysia, t } from "elysia";
import {
  profile,
  updateUser,
  loginWithWallet,
} from "../controllers/user.controller";

export const userRoutes = new Elysia({
  detail: {
    tags: ["User"],
  },
})
  .post("/login-wallet", loginWithWallet, {
    body: t.Object({
      address: t.String(),
    }),
  })
  .post("/profile", profile, {
    body: t.Object({
      address: t.Optional(t.String()),
    }),
  })
  .put("/update-user", updateUser, {
    body: t.Object({
      username: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
      email: t.Optional(t.String({ format: "email" })),
      avatar: t.Optional(t.String({})),
      banner: t.Optional(t.String({})),
      bio: t.Optional(t.String({ maxLength: 160 })),
    }),
  });
