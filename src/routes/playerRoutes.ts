import express from "express";
import PlayerController from "../controllers/playerController";

const router = express.Router();

router.get("/", PlayerController.getPlayers);
router.post("/register/:sportId", PlayerController.postPlayer);

export default router;
