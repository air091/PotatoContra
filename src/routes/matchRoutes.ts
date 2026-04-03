import express from "express";
import MatchController from "../controllers/matchController";

const router = express.Router();

router.get("/sports/:sportId", MatchController.getMatches);
router.post("/sports/:sportId/queue", MatchController.saveQueue);
router.post("/sports/:sportId", MatchController.postMatch);
router.patch("/:matchId", MatchController.patchMatch);
router.delete("/:matchId", MatchController.deleteMatch);

export default router;
