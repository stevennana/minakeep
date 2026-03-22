import { Surface } from "@/components/ui/primitives";
import { VaultNav } from "@/features/navigation/components/vault-nav";

export default function PrivateVaultLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="vault-shell">
      <Surface className="vault-frame" tone="shell">
        <div className="vault-shell-grid">
          <div className="vault-frame-header">
            <div className="vault-frame-copy">
              <p className="eyebrow">Owner workspace</p>
              <p className="vault-frame-title">Private vault</p>
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
