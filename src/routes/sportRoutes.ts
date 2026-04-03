import express from "express";
import SportController from "../controllers/sportController";

const router = express.Router();

router.post("/add", SportController.postSport);
router.get("/", SportController.getSports);
router.get("/:sportId/dashboard", SportController.getSportDashboard);
router.delete("/:sportId", SportController.deleteSport);

export default router;
