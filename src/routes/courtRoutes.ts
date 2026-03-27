import express from "express";
import CourtController from "../controllers/courtController";
const router = express.Router();

router.post("/sport/:sportId/add", CourtController.postCourt);
router.get("/sport/:sportId", CourtController.getCourts);

export default router;
