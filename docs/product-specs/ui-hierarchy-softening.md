# UI hierarchy softening

## Goal
Reduce the oversized and overly strong feel of `h1` and `strong` text while preserving clear hierarchy across public and owner surfaces.

## Trigger / Entry
A visitor or owner uses the core public or private routes after the next wave lands.

## User-Visible Behavior
- `h1` elements feel calmer and less oversized than the current implementation.
- `strong` text remains useful for section hierarchy but no longer feels too dark or aggressive.
- The public showroom and owner workspace both feel easier on the eyes without losing structure.

## Validation
- The hierarchy remains clear after the visual softening.
- The public showroom and owner surfaces both feel less visually aggressive than before.
- `npm run verify` passes.
