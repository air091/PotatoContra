import { Request, Response } from "express";

export const WORKSPACE_HEADER = "x-workspace-id";

export const getWorkspaceId = (request: Request) => {
  const workspaceId = request.header(WORKSPACE_HEADER);

  if (typeof workspaceId !== "string") return null;

  const trimmedWorkspaceId = workspaceId.trim();
  return trimmedWorkspaceId.length > 0 ? trimmedWorkspaceId : null;
};

export const requireWorkspaceId = (
  request: Request,
  response: Response,
) => {
  const workspaceId = getWorkspaceId(request);

  if (workspaceId) return workspaceId;

  response.status(400).json({
    success: false,
    message: "Workspace ID is required",
  });
  return null;
};
