import express from "express";
import CourtController from "../controllers/courtController";
const router = express.Router();

router.post("/sport/:sportId/add", CourtController.postCourt);
router.get("/sport/:sportId", CourtController.getCourts);
router.patch("/:courtId/sport/:sportId/teams", CourtController.patchCourtTeams);
router.patch("/:courtId/sport/:sportId", CourtController.patchCourt);
router.delete("/:courtId/sport/:sportId", CourtController.deleteCourt);

export default router;
