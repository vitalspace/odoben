import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import connectDB from "./db/db";
import { userRoutes } from "./routes/user.route";
import { uploadRoutes } from "./routes/upload.route";

import { apiKeyRoutes } from "./routes/apikey.route";

const PORT = 4001; // Use 4001 to avoid conflict
const ORIGIN = process.env.ORIGIN || "http://localhost:5173";

(async () => await connectDB())();

const app = new Elysia()
  .use(
    cors({
      origin: (request: Request): boolean => {
        return true;
      },
      allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "Fischl von Luftschloss Narfidort",
    })
  )
  .group("/api/v1", (app) =>
    app.use(userRoutes).use(uploadRoutes).use(apiKeyRoutes)
  )
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
