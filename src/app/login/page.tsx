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
    <div className="feature-layout">
      <section className="feature-card">
        <p className="eyebrow">Owner access</p>
        <h1>Sign in to the private vault.</h1>
        <p className="lede">
          Minakeep uses a single owner account configured through the environment and seeded into SQLite by
          `npm run db:prepare`.
        </p>
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
        <p className="auth-note">
          After sign-in, the private `/app` area exposes draft note authoring now. Publishing, links, tags, and search
          remain queued to their own feature slices.
        </p>
      </section>
    </div>
  );
}
