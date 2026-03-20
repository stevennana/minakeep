# System Shape

## Purpose
Capture the project-specific design constraints for Minakeep that are too detailed for `ARCHITECTURE.md` but too stable to leave implicit.

## Current Decisions
- separate public reading routes from private authoring routes at the filesystem level
- give owner-only workflows a consistent `/app` prefix
- keep markdown rendering and slug rules reusable across public and private note flows
- keep Prisma and environment access behind small server-side helpers
