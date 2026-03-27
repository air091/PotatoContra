import express from "express";
import PlayerController from "../controllers/playerController";

const router = express.Router();

router.get("/:sportId", PlayerController.getPlayers);
router.post("/register/:sportId", PlayerController.postPlayer);
router.patch("/:playerId", PlayerController.patchPlayer);

export default router;
