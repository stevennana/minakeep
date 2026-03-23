# Workspace settings

## Goal
Let the owner configure the site-wide service title and description from a dedicated settings surface inside the owner workspace, using a settings architecture that can grow over time.

## Trigger / Entry
The owner opens the settings route from the private workspace navigation.

## User-Visible Behavior
- The owner workspace exposes a dedicated settings route for service configuration.
- In this wave, the settings surface edits only two values:
  - site title
  - site description
- When no settings have been saved yet, the app uses deterministic defaults so public/private shells still render stable branding.
- The saved values apply site-wide where the current fixed service branding appears.
- The settings surface remains owner-only and read-only for the demonstration user.
- The UI should make it clear that this is the beginning of a broader configuration section rather than a one-off special page.

## Validation
- The owner can open the settings route and save a new title and description.
- The saved values appear in the public/private shell branding and browser metadata where the current fixed values are shown.
- Demo users can inspect the settings route but cannot save changes.
- `npm run verify` passes.
