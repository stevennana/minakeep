import { Button, DetailBlock, SectionHeading, Surface } from "@/components/ui/primitives";
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
      <Surface className="login-intro-card" tone="hero">
        <p className="eyebrow">Owner access</p>
        <h1>Sign in to the private vault.</h1>
        <p className="lede">
          Minakeep runs as a single-owner workspace. Public readers only see published notes, while drafting, saved
          links, tags, and search remain restricted to the private studio.
        </p>
        <div className="detail-stack">
          <DetailBlock title="Bootstrapped through SQLite">
            <p>The owner account is configured through the environment and seeded by `npm run db:prepare`.</p>
          </DetailBlock>
          <DetailBlock title="After sign-in">
            <p>The private `/app` area exposes note authoring, private link capture, shared tags, and owner-only search.</p>
          </DetailBlock>
        </div>
      </Surface>

      <Surface className="login-form-card" tone="panel">
        <SectionHeading meta="Single owner account" title="Credentials" />
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
            <Button type="submit">Sign in</Button>
          </div>
        </form>
        {hasError ? <p className="signin-error">Credentials were rejected. Check the seeded owner username and password.</p> : null}
        <p className="auth-note">The private workspace keeps authored notes primary and AI metadata visibly secondary.</p>
      </Surface>
    </div>
  );
}
