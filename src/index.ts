import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";

dotenv.config();

import sportRoutes from "./routes/sportRoutes";
import playerRoutes from "./routes/playerRoutes";
import courtRoutes from "./routes/courtRoutes";
import teamRoutes from "./routes/teamRoutes";
import matchRoutes from "./routes/matchRoutes";
import workspaceRoutes from "./routes/workspaceRoutes";

const app = express();
const port = process.env.PORT ?? "3000";
const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../client/dist");

app.use(
  cors({
    credentials: true,
    origin: corsOrigins,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ ok: true });
});

app.use("/api/workspaces", workspaceRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.use((request, response, next) => {
    if (request.path.startsWith("/api") || request.path === "/health") {
      next();
      return;
    }

    response.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const startServer = () => {
  try {
    app.listen(port, () => console.log(`Server running: ${port}`));
  } catch (error) {
    console.error(`Start server failed`);
    throw error;
  }
};

startServer();
