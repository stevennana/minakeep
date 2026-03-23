# Site Configuration Architecture

## Goal
Define an owner-editable settings foundation for site-wide service configuration without turning Minakeep into a general admin platform.

## Scope for this wave
- add one owner settings section inside the private workspace
- persist a site title and site description in app data
- apply those values where the current fixed service branding appears

## Architecture Rules
- the settings model should be shaped as an extensible configuration surface rather than a one-off title/description hack
- persistence should use one durable site-settings boundary and singleton record rather than route-local state
- route ownership should stay inside the owner workspace, recommended as `/app/settings`
- reads should be server-backed and available to both public and private shells
- writes remain owner-only and must be blocked for the demo user
- reads must fall back to deterministic defaults when no saved settings record exists yet

## Extensibility Rules
- the first version may ship only title and description
- later settings should be able to attach to the same domain boundary without replacing the storage contract
- future additions should not require inventing a second configuration route or a second persistence model
