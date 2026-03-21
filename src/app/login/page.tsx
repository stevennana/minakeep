import { Button, DetailBlock, FormField, IntroBlock, SectionHeading, Surface } from "@/components/ui/primitives";
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
      <Surface className="login-intro-card ui-intro-surface" tone="hero">
        <IntroBlock
          compact
          description="Minakeep runs as a single-owner workspace. Public readers only see published notes, while drafting, saved links, tags, and search remain restricted to the private studio."
          eyebrow="Owner access"
          title="Sign in to the private vault."
        >
          <div className="ui-support-grid ui-support-grid-dual">
            <DetailBlock title="Bootstrapped through SQLite">
              <p>The owner account is configured through the environment and seeded by `npm run db:prepare`.</p>
            </DetailBlock>
            <DetailBlock title="After sign-in">
              <p>The private `/app` area exposes note authoring, private link capture, shared tags, and owner-only search.</p>
            </DetailBlock>
          </div>
        </IntroBlock>
      </Surface>

      <Surface className="login-form-card ui-form-surface" tone="panel">
        <SectionHeading meta="Single owner account" title="Credentials" />
        <form action={loginAction} className="sign-in-form ui-form-stack">
          <FormField label="Username">
            <input autoComplete="username" name="username" placeholder="owner" required type="text" />
          </FormField>
          <FormField label="Password">
            <input autoComplete="current-password" name="password" required type="password" />
          </FormField>
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
