import { requireWorkspaceSession } from "@/lib/auth/owner-session";
import { isReadOnlyWorkspaceRole } from "@/lib/auth/roles";
import { Surface } from "@/components/ui/primitives";
import { VaultNav } from "@/features/navigation/components/vault-nav";

export default async function PrivateVaultLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const workspace = await requireWorkspaceSession();
  const isReadOnly = isReadOnlyWorkspaceRole(workspace.actor.role);

  return (
    <div className="vault-shell">
      <Surface className="vault-frame" tone="shell">
        <div className="vault-shell-grid">
          <div className="vault-frame-header">
            <div className="vault-frame-copy">
              <p className="eyebrow">{isReadOnly ? "Read-only demo" : "Owner workspace"}</p>
              <p className="vault-frame-title">{isReadOnly ? "Inspect the live vault" : "Private vault"}</p>
              {isReadOnly ? (
                <p className="read-only-note vault-frame-note">
                  You are browsing the owner workspace in read-only mode. Create, edit, publish, retry, and upload controls stay disabled.
                </p>
              ) : null}
            </div>
            <div className="vault-nav-block">
              <p className="vault-nav-label">Sections</p>
              <VaultNav />
            </div>
          </div>
          <div className="vault-frame-body">{children}</div>
        </div>
      </Surface>
    </div>
  );
}
