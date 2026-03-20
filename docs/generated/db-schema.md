# Generated DB Schema

## Current Prisma Models

### `User`
- single owner account for private access
- unique `username`
- password stored as a salted hash

### `Note`
- belongs to one owner
- stores `title`, `slug`, `markdown`, `excerpt`
- tracks `isPublished` and optional `publishedAt`
- many-to-many with shared tags

### `Link`
- belongs to one owner
- stores `url`, `title`, `summary`
- remains private in v1
- many-to-many with shared tags

### `Tag`
- shared taxonomy for both notes and links
- unique `name`

## Runtime Notes

- the SQLite database lives at `file:./dev.db` under the Prisma workspace path
- `npm run db:prepare` runs `prisma generate`, `prisma db push`, and owner seeding
- the seeded owner comes from `OWNER_USERNAME` and `OWNER_PASSWORD`
