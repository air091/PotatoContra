import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

import sportRoutes from "./routes/sportRoutes";
import playerRoutes from "./routes/playerRoutes";
import courtRoutes from "./routes/courtRoutes";
import teamRoutes from "./routes/teamRoutes";
import matchRoutes from "./routes/matchRoutes";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/sports", sportRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);

const startServer = () => {
  try {
    app.listen(port, () => console.log(`Server running: ${port}`));
  } catch (error) {
    console.error(`Start server failed`);
    throw error;
  }
};

startServer();
