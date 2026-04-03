import { getStoredWorkspaceId, WORKSPACE_HEADER } from "./workspace";

export const apiFetch = (input, init = {}) => {
  const headers = new Headers(init.headers ?? {});
  const workspaceId = getStoredWorkspaceId();

  if (workspaceId) {
    headers.set(WORKSPACE_HEADER, workspaceId);
  }

  return fetch(input, {
    credentials: init.credentials ?? "include",
    ...init,
    headers,
  });
};
