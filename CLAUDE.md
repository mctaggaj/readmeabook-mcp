# readmeabook-mcp — Project Instructions

## Architecture

- `src/client.ts` — `ReadMeABookClient` class; all HTTP calls go through the private `request<T>()` method
- `src/tools.ts` — MCP tool handlers + definitions; `toolHandlers` and `toolDefinitions` must stay in sync (every handler needs a definition and vice versa — tests enforce this)
- `src/types.ts` — Shared domain types (`RequestStatus`, `SwipeAction`, `UserRole`, etc.)
- `src/index.ts` — MCP server entry point; reads `READMEABOOK_URL` and `READMEABOOK_TOKEN` from env

## Branches

- `main` — stable; API token auth only; full 46-tool set (blocked endpoints return 403 until upstream allowlist is expanded — tracked in kikootwo/ReadMeABook#176)
- `revert-to-api-key-auth` — PR #1; cleans up session auth workaround

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

## Git Workflow

**Never commit directly to `main` or push to it.** All changes must follow this process:

1. **File an issue** — create a GitHub issue describing the change before starting work.
2. **Feature branch** — make all changes on a named feature branch (never on `main`).
3. **Pull request** — open a PR that references the issue (e.g. `Closes #123`).
4. **Sequential agent review** — run two isolated review agents one after another:
   - First agent reviews the PR and leaves comments.
   - Address all first-agent comments before invoking the second agent.
   - Second agent reviews the updated PR.
   - Only merge after both review waves are complete.
5. **Merge & clean up** — squash-merge the PR into `main`, then delete the feature branch.

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
