# readmeabook-mcp — Project Instructions

## Architecture

- `src/client.ts` — `ReadMeABookClient` class; all HTTP calls go through the private `request<T>()` method
- `src/tools.ts` — MCP tool handlers + definitions; `toolHandlers` and `toolDefinitions` must stay in sync (every handler needs a definition and vice versa — tests enforce this)
- `src/types.ts` — Shared domain types (`RequestStatus`, `SwipeAction`, `UserRole`, etc.)
- `src/index.ts` — MCP server entry point; reads `READMEABOOK_URL` and `READMEABOOK_TOKEN` from env

## Branches

- `main` — working endpoints only (13 tools confirmed against v1.1.7)
- `all-endpoints` — full 46-tool implementation; re-enable tools here as upstream ReadMeABook auth is fixed

## Known broken endpoints (v1.1.7)

- **401** Authors and series routes (`/authors/*`, `/series/*`) — Audible credential issue server-side
- **403** All user-scoped routes except `GET /requests` — auth middleware applied inconsistently
- **403** All admin routes except `/admin/metrics` and `/admin/downloads/active`

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
