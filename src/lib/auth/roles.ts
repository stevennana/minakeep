export const WORKSPACE_ROLES = ["owner", "demo"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const DEMO_USER_ID = "demo-user";

export function isReadOnlyWorkspaceRole(role: WorkspaceRole) {
  return role === "demo";
}
