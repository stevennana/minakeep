import { VaultNav } from "@/features/navigation/components/vault-nav";

export default function PrivateVaultLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="vault-shell">
      <section className="vault-frame">
        <div className="vault-frame-header">
          <div className="vault-frame-copy">
            <p className="eyebrow">Private vault</p>
            <h1 className="vault-frame-title">Notes first, links nearby, retrieval always owner-only.</h1>
            <p className="vault-frame-note">
              Markdown drafting, selective publishing, shared tags, and AI metadata stay inside one compact workspace.
            </p>
          </div>
          <VaultNav />
        </div>
        <div className="vault-frame-body">{children}</div>
      </section>
    </div>
  );
}
