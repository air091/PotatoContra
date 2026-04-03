import express from "express";
import WorkspaceController from "../controllers/workspaceController";

const router = express.Router();

router.post("/resolve", WorkspaceController.resolveWorkspace);

export default router;
