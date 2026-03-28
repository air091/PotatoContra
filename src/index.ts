import dotenv from "dotenv";
import express from "express";

dotenv.config();

import sportRoutes from "./routes/sportRoutes";
import playerRoutes from "./routes/playerRoutes";
import courtRoutes from "./routes/courtRoutes";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(express.json());

app.use("/api/sports", sportRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/courts", courtRoutes);

const startServer = () => {
  try {
    app.listen(port, () => console.log(`Server running: ${port}`));
  } catch (error) {
    console.error(`Start server failed`);
    throw error;
  }
};

startServer();
