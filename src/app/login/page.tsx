import { Button, FormField, IntroBlock, SectionHeading, Surface } from "@/components/ui/primitives";
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
      <Surface className="login-intro-card" density="compact" tone="hero">
        <IntroBlock
          compact
          description="Owner-only access to notes, links, tags, and search."
          eyebrow="Owner access"
          title="Sign in to the private vault."
        />
      </Surface>

      <Surface className="login-form-card" density="compact" tone="panel">
        <SectionHeading meta="Owner-only" title="Credentials" />
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
        {hasError ? <p className="signin-error">Credentials were rejected. Try the owner username and password again.</p> : null}
      </Surface>
    </div>
  );
}
