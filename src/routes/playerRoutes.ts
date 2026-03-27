import express from "express";
import PlayerController from "../controllers/playerController";

const router = express.Router();

router.get("/", PlayerController.getAllPlayers);

export default router;
