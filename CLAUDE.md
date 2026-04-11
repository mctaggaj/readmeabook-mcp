# readmeabook-mcp — Project Instructions

## Architecture

- `src/client.ts` — `ReadMeABookClient` class; all HTTP calls go through the private `request<T>()` method
- `src/tools.ts` — MCP tool handlers + definitions; `toolHandlers` and `toolDefinitions` must stay in sync (every handler needs a definition and vice versa — tests enforce this)
- `src/types.ts` — Shared domain types (`RequestStatus`, `SwipeAction`, `UserRole`, etc.)
- `src/index.ts` — MCP server entry point; reads `READMEABOOK_URL` and `READMEABOOK_TOKEN` from env

## Branches

- `main` — 9 confirmed-working tools (allowlisted or public routes only)
- `all-endpoints` — full 46-tool implementation; activate once ReadMeABook's API token allowlist is expanded

## Why most endpoints are blocked

ReadMeABook enforces a hardcoded API token allowlist in `src/lib/constants/api-tokens.ts`.
Only these 5 endpoints are permitted for API token auth:
- `GET /api/auth/me`
- `GET /api/requests`
- `GET /api/admin/metrics`
- `GET /api/admin/downloads/active`
- `GET /api/admin/requests/recent`

All other endpoints return 403. Audiobook browse/search endpoints work because they are
**public routes** that require no auth. To unlock write operations, the ReadMeABook allowlist
must be expanded — this is an upstream change in ReadMeABook, not something we can fix here.

## Build & test

```bash
npm run build          # compile TypeScript → dist/
npm test               # run unit tests
npm run test:coverage  # run with coverage report (90% threshold)
npm run test:watch     # watch mode during development
```

## Development conventions

- Keep `toolHandlers` and `toolDefinitions` in sync — the test suite asserts a 1:1 match
- Tool descriptions must document return shape (field names, types, value ranges), not just intent
- Use the `str` / `optBool` helpers in tool handlers; don't add bare `as string` casts
- Keep README.md in sync with the actual tool list — when endpoints are removed or disabled, update the Available Tools section immediately
- `index.ts` is excluded from coverage (infrastructure glue, not unit-testable)

## MCP registration

```bash
claude mcp add readmeabook \
  -e READMEABOOK_URL=http://<host>:<port> \
  -e READMEABOOK_TOKEN=<rmab_...token> \
  -- node /path/to/readmeabook-mcp/dist/index.js
```
