import { Request, Response } from "express";
import prisma from "../lib/prisma";

const DEFAULT_SPORT_NAME = "Badminton";

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

        if (workspace) {
          const sport = await prisma.sport.findFirst({
            where: {
              workspaceId: workspace.id,
              name: DEFAULT_SPORT_NAME,
            },
          });

          if (!sport) {
            await prisma.sport.create({
              data: {
                workspaceId: workspace.id,
                name: DEFAULT_SPORT_NAME,
              },
            });
          }

          return response.status(200).json({
            success: true,
            workspace,
            isNew: false,
          });
        }
      }

      const workspace = await prisma.$transaction(async (transaction) => {
        const createdWorkspace = await transaction.workspace.create({
          data: {},
        });

        await transaction.sport.create({
          data: {
            workspaceId: createdWorkspace.id,
            name: DEFAULT_SPORT_NAME,
          },
        });

        return createdWorkspace;
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
