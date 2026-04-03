import { Request, Response } from "express";
import prisma from "../lib/prisma";

class WorkspaceController {
  static resolveWorkspace = async (request: Request, response: Response) => {
    try {
      const requestedWorkspaceId = request.body?.workspaceId;

      if (
        requestedWorkspaceId !== undefined &&
        typeof requestedWorkspaceId !== "string"
      )
        return response.status(400).json({
          success: false,
          message: "workspaceId must be a string when provided",
        });

      const normalizedWorkspaceId = requestedWorkspaceId?.trim();

      if (normalizedWorkspaceId) {
        const workspace = await prisma.workspace.findUnique({
          where: { id: normalizedWorkspaceId },
        });

        if (workspace)
          return response.status(200).json({
            success: true,
            workspace,
            isNew: false,
          });
      }

      const workspace = await prisma.workspace.create({
        data: {},
      });

      return response.status(201).json({
        success: true,
        workspace,
        isNew: true,
      });
    } catch (error: any) {
      console.error(`Resolve workspace failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Resolve workspace failed",
        error_message: error.message,
      });
    }
  };
}

export default WorkspaceController;
