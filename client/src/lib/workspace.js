export const WORKSPACE_STORAGE_KEY = "potatocontra.workspaceId";
export const WORKSPACE_HEADER = "x-workspace-id";
const WORKSPACE_RESOLVE_RETRY_DELAYS_MS = [250, 500];

let pendingWorkspacePromise = null;

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

const sleep = (durationMs) =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, durationMs);
  });

const performWorkspaceResolution = async () => {
  const workspaceId = getStoredWorkspaceId();

  const response = await fetch("/api/workspaces/resolve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workspaceId ? { workspaceId } : {}),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message ?? "Unable to initialize workspace");
  }

  setStoredWorkspaceId(data.workspace.id);
  return data.workspace;
};

export const resolveWorkspace = async () => {
  if (pendingWorkspacePromise) {
    return pendingWorkspacePromise;
  }

  pendingWorkspacePromise = (async () => {
    let lastError = null;

    for (let attemptIndex = 0; attemptIndex <= WORKSPACE_RESOLVE_RETRY_DELAYS_MS.length; attemptIndex += 1) {
      try {
        return await performWorkspaceResolution();
      } catch (error) {
        lastError = error;

        if (attemptIndex === WORKSPACE_RESOLVE_RETRY_DELAYS_MS.length) {
          break;
        }

        await sleep(WORKSPACE_RESOLVE_RETRY_DELAYS_MS[attemptIndex]);
      }
    }

    throw lastError ?? new Error("Unable to initialize workspace");
  })().finally(() => {
    pendingWorkspacePromise = null;
  });

  return pendingWorkspacePromise;
};
