import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const hasError = resolvedSearchParams.error === "CredentialsSignin";

  return (
    <div className="feature-layout login-layout">
      <section className="hero-card login-intro-card">
        <p className="eyebrow">Owner access</p>
        <h1>Sign in to the private vault.</h1>
        <p className="lede">
          Minakeep runs as a single-owner workspace. Public readers only see published notes, while drafting, saved
          links, tags, and search remain restricted to the private studio.
        </p>
        <div className="detail-stack">
          <div className="detail-block">
            <strong>Bootstrapped through SQLite</strong>
            <p>The owner account is configured through the environment and seeded by `npm run db:prepare`.</p>
          </div>
          <div className="detail-block">
            <strong>After sign-in</strong>
            <p>The private `/app` area exposes note authoring, private link capture, shared tags, and owner-only search.</p>
          </div>
        </div>
      </section>

      <section className="panel-card login-form-card">
        <div className="section-heading">
          <strong>Credentials</strong>
          <span className="section-meta">Single owner account</span>
        </div>
        <form action={loginAction} className="sign-in-form">
          <label>
            Username
            <input autoComplete="username" name="username" placeholder="owner" required type="text" />
          </label>
          <label>
            Password
            <input autoComplete="current-password" name="password" required type="password" />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit">
              Sign in
            </button>
          </div>
        </form>
        {hasError ? <p className="signin-error">Credentials were rejected. Check the seeded owner username and password.</p> : null}
        <p className="auth-note">The private workspace keeps authored notes primary and AI metadata visibly secondary.</p>
      </section>
    </div>
  );
}
