import dotenv from "dotenv"
import express from "express";

dotenv.config()

const app = express();
const port = process.env.PORT as string;

const startServer = () => {
    try {
        app.listen(port, () => console.log(`Server running: ${port}`));
    } catch (error) {
        console.error(`Start server failed`);
        throw error;
    }
}

startServer();