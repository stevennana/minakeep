# Media Storage And Serving

## Goal
Add note-image uploads and cached favicons without weakening the private-vault model or bloating SQLite.

## Storage Rules
- store uploaded note images on a mounted filesystem path
- store cached link favicons on that same mounted media root or a clear favicon subpath
- do not use SQLite blobs in this wave
- do not require object storage in this wave

## Visibility Rules
- uploaded note images are owner-visible immediately after upload
- uploaded note images become publicly resolvable only when referenced by a published note
- public media serving should not expose a raw directory index or unscoped bucket-like namespace
- cached favicons may be served publicly as part of public link-card rendering

## Derived Image Rules
- the first embedded markdown image is the derived note card/showroom image
- do not add a second explicit cover-image field in this wave
- if a note has no embedded image, note cards fall back to the existing text-first treatment
- loading-priority policy should sit above this derived-image contract rather than introducing separate stored "priority image" metadata

## Failure Rules
- note save must not fail because a card image cannot be derived
- link save must not fail because favicon fetch or cache fails
- favicon fetch failure should fall back to a stable generic icon

## Anti-Goals
- no generalized attachment manager
- no object-storage abstraction
- no public media access independent of note publish state
