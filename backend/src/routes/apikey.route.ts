import { Elysia } from "elysia";
import {
  generateApiKey,
  listApiKeys,
  deleteApiKey,
} from "../controllers/apikey.controller";

export const apiKeyRoutes = (app: Elysia) =>
  app.group("/apikeys", (app) =>
    app
      .post("/", generateApiKey)
      .get("/", listApiKeys)
      .delete("/:id", deleteApiKey)
  );
