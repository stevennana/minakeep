# UI Verification Contract

## Source
- skill reference: `references/ui-verification.md`

## Minakeep adaptation
- every UI-focused exec-plan in the current wave should require:
  - `npm run verify`
  - `npm run test:e2e -- --grep @ui-<surface>`
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
- `@ui-public-note`
- `@ui-owner-shell`
- `@ui-owner-dashboard`
- `@ui-forms`
- `@ui-owner-secondary`
- `@ui-responsive`
- `@ui-regression`
