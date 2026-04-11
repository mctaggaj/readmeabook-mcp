# readmeabook-mcp

An MCP (Model Context Protocol) server for [ReadMeABook](https://github.com/kikootwo/readmeabook) — the Radarr/Sonarr + Overseerr for audiobooks.

Lets Claude (or any MCP-compatible AI client) search for audiobooks, manage requests, and monitor downloads.

> **Note:** This server targets the confirmed-working endpoints against ReadMeABook v1.1.7. A full endpoint set (authors, series, BookDate, user preferences, and more admin tools) is available on the `all-endpoints` branch pending upstream auth fixes in ReadMeABook.

## Setup

### 1. Clone and build

```bash
git clone https://github.com/mctaggaj/readmeabook-mcp.git
cd readmeabook-mcp
npm install
npm run build
```

### 2. Generate an API token

In ReadMeABook, go to **User Settings → API Tokens** and create a new token.

### 3. Register with Claude Code

Run this from any directory — replace the URL, token, and path values:

```bash
claude mcp add readmeabook \
  -e READMEABOOK_URL=http://your-readmeabook-host:3000 \
  -e READMEABOOK_TOKEN=your-api-token-here \
  -- node /absolute/path/to/readmeabook-mcp/dist/index.js
```

- `READMEABOOK_URL` — base URL of your ReadMeABook instance (e.g. `http://192.168.1.10:3000`)
- `READMEABOOK_TOKEN` — the token you just created
- The path must be absolute (e.g. `/Users/you/readmeabook-mcp/dist/index.js`)

Restart Claude Code after running this command.

## Available tools

### System
- `health_check` — Check server health
- `get_version` — Get app version

### Audiobook discovery
- `search_audiobooks` — Search Audible by title, author, or keyword
- `get_audiobook` — Get audiobook details by ASIN
- `get_popular_audiobooks` — Browse trending audiobooks
- `get_new_releases` — Browse recent releases

### Request management
- `get_requests` — List your requests and their statuses
- `create_request` — Request an audiobook by ASIN
- `delete_request` — Cancel a request
- `manual_search_request` — Trigger a fresh indexer search for a request
- `search_torrents` — Search Prowlarr indexers for a specific audiobook
- `select_torrent` — Select a specific torrent/NZB result to download

### Admin
- `admin_get_metrics` — System-wide stats (requests, users, storage, uptime)
- `admin_get_active_downloads` — Live download progress across all clients
