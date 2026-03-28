import express from "express";
import TeamController from "../controllers/TeamController";

const router = express.Router();

router.post("/add/sports/:sportId", TeamController.postTeam);
router.get("/sports/:sportId", TeamController.getTeams);
router.delete("/sports/:sportId", TeamController.deleteTeam);

router.post("/add/players/sports/:sportId", TeamController.postTeamPlayer);

export default router;
