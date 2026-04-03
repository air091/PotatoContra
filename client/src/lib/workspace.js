export const WORKSPACE_STORAGE_KEY = "potatocontra.workspaceId";
export const WORKSPACE_HEADER = "x-workspace-id";

export const getStoredWorkspaceId = () => {
  if (typeof window === "undefined") return null;

  const workspaceId = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (typeof workspaceId !== "string") return null;

  const trimmedWorkspaceId = workspaceId.trim();
  return trimmedWorkspaceId.length > 0 ? trimmedWorkspaceId : null;
};

export const setStoredWorkspaceId = (workspaceId) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
};

export const resolveWorkspace = async () => {
  const workspaceId = getStoredWorkspaceId();

  const response = await fetch("/api/workspaces/resolve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workspaceId ? { workspaceId } : {}),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.message ?? "Unable to initialize workspace");
  }

  setStoredWorkspaceId(data.workspace.id);
  return data.workspace;
};
