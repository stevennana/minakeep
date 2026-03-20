import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-grid">
      <section className="hero-card">
        <p className="eyebrow">Private capture, selective publication</p>
        <h1>Minakeep keeps the vault private and the notes intentional.</h1>
        <p className="lede">
          Minakeep now ships owner authentication, private draft note authoring with markdown preview, deterministic
          runtime commands, and the Ralph task queue. Public publishing, link capture, and owner retrieval remain
          separated into later slices.
        </p>
        <div className="summary-row">
          <div>
            <strong>Public surface</strong>
            <span>Published notes homepage and note routes</span>
          </div>
          <div>
            <strong>Private surface</strong>
            <span>Owner login, notes-first `/app`, and private draft editing</span>
          </div>
          <div>
            <strong>Current mode</strong>
            <span>Draft authoring ready, publishing still queued</span>
          </div>
        </div>
      </section>
      <aside className="panel-card">
        <p className="eyebrow">Active fronts</p>
        <strong>Current feature queue</strong>
        <ul className="inline-list">
          <li>Note authoring shipped</li>
          <li>Public publishing</li>
          <li>Link capture</li>
          <li>Tags and search</li>
        </ul>
        <p>
          The public homepage stays honest about the current product state: private drafting is live, while public note
          publishing is intentionally held for the next task instead of implied early.
        </p>
        <div className="button-row">
          <Link className="primary-button" href="/login">
            Owner login
          </Link>
          <Link className="ghost-button" href="/notes/bootstrap-foundation">
            Example note route
          </Link>
        </div>
      </aside>
    </div>
  );
}
