# UI Verification Contract

## Source
- skill reference: `references/ui-verification.md`

## Minakeep adaptation
- every UI-focused exec-plan in the current wave should require:
  - `npm run verify`
  - `npm run test:e2e -- --grep @ui-<surface>`
- public-surface hardening should require `npm run test:e2e -- --grep @ui-public-taste-regression` so one deterministic command replays the shipped public chrome, homepage, and public note checks
- final UI hardening should also support `npm run test:e2e -- --grep @ui-regression` so one deterministic command replays the full redesigned public/private wave
- refinement follow-up tasks may introduce a narrower task tag when a small pair of shipped layout fixes needs dedicated regression replay without rerunning the whole wave
- Mermaid hardening should require `npm run test:e2e -- --grep @ui-mermaid-regression` so one deterministic command replays the shipped public-note and owner-preview diagram surfaces
- reference-link hardening should require `npm run test:e2e -- --grep @ui-reference-link-regression` so one deterministic command replays the shipped public-note and owner-preview reference-link surfaces
- UI task metadata should set `promotion_mode` to `deterministic_only`
- the tagged UI test should prove:
  - desktop `1440x900`
  - mobile `390x844`
  - key hierarchy anchors and primary actions are visible
  - no obvious overflow or collapsed-layout regression escapes the scoped surface
  - screenshot baselines match the expected result
  - automated accessibility scanning passes

## Wave tags
- `@ui-system`
- `@ui-home-shell`
- `@ui-home-grid`
- `@ui-public-taste-regression`
- `@ui-public-note`
- `@ui-owner-shell`
- `@ui-owner-dashboard`
- `@ui-forms`
- `@ui-owner-secondary`
- `@ui-responsive`
- `@ui-mermaid-regression`
- `@ui-public-note-reference-links`
- `@ui-note-editor-reference-links`
- `@ui-reference-link-regression`
- `@ui-refinement-hardening`
- `@ui-regression`
