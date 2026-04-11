# readmeabook-mcp

An MCP (Model Context Protocol) server for [ReadMeABook](https://github.com/kikootwo/readmeabook) — the Radarr/Sonarr + Overseerr for audiobooks.

Lets Claude (or any MCP-compatible AI client) search for audiobooks, manage requests, browse recommendations, and administer your ReadMeABook instance.

## Setup

### 1. Install dependencies and build

```bash
npm install
npm run build
```

### 2. Generate an API token

In ReadMeABook, go to **User Settings → API Tokens** and create a new token.

### 3. Configure Claude Code

From your project directory, run:

```bash
claude mcp add readmeabook \
  -e READMEABOOK_URL=http://your-readmeabook-host:3000 \
  -e READMEABOOK_TOKEN=your-api-token-here \
  -- node /path/to/readmeabook-mcp/dist/index.js
```

Then restart Claude Code for the server to load.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `READMEABOOK_URL` | Yes | Base URL of your ReadMeABook instance |
| `READMEABOOK_TOKEN` | Yes | API token from ReadMeABook user settings |

## Available tools

### System
- `health_check` — Check server health
- `get_version` — Get app version

### Audiobook discovery
- `search_audiobooks` — Search Audible by title/author/keyword
- `get_audiobook` — Get audiobook details by ASIN
- `get_popular_audiobooks` — Browse popular audiobooks
- `get_new_releases` — Browse new releases
- `get_audiobook_download_status` — Check if an audiobook is in your library
- `search_torrents` — Search indexers for a specific audiobook

### Authors & Series
- `search_authors` / `get_author` / `get_author_books`
- `search_series` / `get_series`

### Request management
- `get_requests` — List your requests
- `create_request` — Request an audiobook by ASIN
- `get_request` — Get request status
- `delete_request` — Cancel a request
- `manual_search_request` — Trigger a new search for a request
- `select_torrent` — Select a specific torrent/NZB result

### BookDate (AI recommendations)
- `get_bookdate_recommendations` — Get pending AI recommendations
- `generate_bookdate_recommendations` — Generate a new batch
- `swipe_bookdate` — Swipe left/right/up on a recommendation
- `undo_bookdate_swipe` — Undo last swipe

### User preferences
- `get_watched_series` / `watch_series` / `unwatch_series`
- `get_watched_authors` / `watch_author` / `unwatch_author`
- `get_ignored_audiobooks` / `ignore_audiobook` / `unignore_audiobook`
- `get_api_tokens` / `create_api_token` / `delete_api_token`

### Admin tools *(require admin role)*
- `admin_get_requests` — All requests with optional status filter
- `admin_get_pending_approval` / `admin_approve_request`
- `admin_retry_download`
- `admin_get_users` / `admin_get_pending_users` / `admin_approve_user` / `admin_update_user` / `admin_delete_user`
- `admin_get_jobs` / `admin_trigger_job`
- `admin_get_active_downloads`
- `admin_get_logs` / `admin_get_metrics`
- `admin_plex_scan`
- `admin_get_reported_issues` / `admin_resolve_issue` / `admin_replace_issue`
