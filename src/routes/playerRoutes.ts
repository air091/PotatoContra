import express from "express";
import PlayerController from "../controllers/playerController";

const router = express.Router();

router.get("/matches-stats/:sportId", PlayerController.getPlayersMatchCount);
router.get("/:playerId/history", PlayerController.getPlayerHistory);
router.get("/:sportId", PlayerController.getPlayers);
router.post("/register/:sportId", PlayerController.postPlayer);
router.patch("/:playerId", PlayerController.patchPlayer);
router.delete("/:playerId", PlayerController.deletePlayer);

export default router;
