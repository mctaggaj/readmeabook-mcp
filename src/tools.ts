import type { ReadMeABookClient } from "./client.js";

export type ToolArgs = Record<string, unknown>;

export type ToolHandler = (
  client: ReadMeABookClient,
  args: ToolArgs
) => Promise<unknown>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function str(args: ToolArgs, key: string): string {
  return args[key] as string;
}

function optBool(args: ToolArgs, key: string): boolean | undefined {
  return args[key] as boolean | undefined;
}

// ---------------------------------------------------------------------------
// Handlers
//
// REMOVED — confirmed broken against v1.1.7 (see working-endpoints-only branch):
//   401 Authors/Series:  search_authors, get_author, get_author_books,
//                        search_series, get_series
//   403 User-scoped:     get_request, get_audiobook_download_status,
//                        get_watched_*, get_ignored_*, get_api_tokens,
//                        watch_*/unwatch_*, ignore_*/unignore_*,
//                        create_api_token, delete_api_token
//   403 BookDate:        get_bookdate_recommendations,
//                        generate_bookdate_recommendations, swipe_bookdate,
//                        undo_bookdate_swipe
//   403 Admin:           admin_get_requests, admin_get_pending_approval,
//                        admin_approve_request, admin_retry_download,
//                        admin_get_users, admin_get_pending_users,
//                        admin_approve_user, admin_update_user, admin_delete_user,
//                        admin_get_jobs, admin_trigger_job, admin_get_logs,
//                        admin_get_reported_issues, admin_resolve_issue,
//                        admin_replace_issue, admin_plex_scan
// ---------------------------------------------------------------------------

export const toolHandlers: Record<string, ToolHandler> = {
  // System
  health_check: (client) => client.getHealth(),
  get_version: (client) => client.getVersion(),

  // Audiobook discovery
  search_audiobooks: (client, args) =>
    client.searchAudiobooks(str(args, "query"), (args.page as number | undefined) ?? 1),
  get_audiobook: (client, args) => client.getAudiobook(str(args, "asin")),
  get_popular_audiobooks: (client) => client.getPopularAudiobooks(),
  get_new_releases: (client) => client.getNewReleases(),

  // Requests — get_requests (list) confirmed working; write tools untested but
  // grouped here as the only functional workflow path
  get_requests: (client) => client.getRequests(),
  create_request: (client, args) =>
    client.createRequest(str(args, "asin"), optBool(args, "auto_search") ?? true),
  delete_request: (client, args) => client.deleteRequest(str(args, "id")),
  manual_search_request: (client, args) => client.manualSearchRequest(str(args, "id")),
  search_torrents: (client, args) =>
    client.searchTorrents(str(args, "asin"), str(args, "title"), str(args, "author")),
  select_torrent: (client, args) =>
    client.selectTorrent(str(args, "request_id"), str(args, "torrent_id")),

  // Admin — only these two confirmed working
  admin_get_metrics: (client) => client.adminGetMetrics(),
  admin_get_active_downloads: (client) => client.adminGetActiveDownloads(),
};

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const toolDefinitions = [
  // ── System ──────────────────────────────────────────────────────────────

  {
    name: "health_check",
    description:
      'Check if the ReadMeABook server is online and its database is reachable. Returns {"status": "ok"} when healthy.',
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_version",
    description:
      'Get the running ReadMeABook application version. Returns {"version": "1.1.7", "buildDate": "2026-03-20", "commit": "54b54d3"}.',
    inputSchema: { type: "object", properties: {}, required: [] },
  },

  // ── Audiobook discovery ──────────────────────────────────────────────────

  {
    name: "search_audiobooks",
    description:
      "Search Audible for audiobooks by title, author, or keyword. " +
      "Returns an array of audiobook objects, each containing: asin (e.g. B08G9PRS1K), " +
      "title, authors[], narrators[], coverArtUrl, ratingAverage (0–5), ratingCount, " +
      "releaseDate (ISO 8601), seriesName, seriesPosition, lengthMinutes, summary. " +
      "Use page for pagination (20 results per page). " +
      'Examples: query="Project Hail Mary", query="Andy Weir", query="Dungeon Crawler Carl series".',
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: 'Search terms — title, author, series, or keyword. Example: "Brandon Sanderson Stormlight"',
        },
        page: {
          type: "number",
          description: "1-based page number (20 results per page). Defaults to 1.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_audiobook",
    description:
      "Get full metadata for a specific audiobook by its Audible ASIN. " +
      "Returns the same fields as search_audiobooks plus: isbn, language, publisherName, " +
      "genres[], isAvailable (true if already in your library), requestStatus if requested. " +
      "Use this to confirm details before calling create_request.",
    inputSchema: {
      type: "object",
      properties: {
        asin: {
          type: "string",
          description: 'Audible ASIN — 10-character alphanumeric ID. Example: "B08G9PRS1K"',
        },
      },
      required: ["asin"],
    },
  },
  {
    name: "get_popular_audiobooks",
    description:
      "Get the top 100 audiobooks currently trending on Audible. " +
      "Returns an array of audiobook objects (same shape as search_audiobooks results). " +
      "Each includes an isAvailable flag and requestStatus if the book has been requested. " +
      "Useful for discovering what to request next.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_new_releases",
    description:
      "Get recently released audiobooks from Audible (typically the last 30–60 days). " +
      "Returns an array of audiobook objects. Each includes releaseDate (ISO 8601), " +
      "isAvailable, and requestStatus if applicable.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },

  // ── Requests ─────────────────────────────────────────────────────────────

  {
    name: "get_requests",
    description:
      "List all audiobook requests made by the current user. " +
      "Returns an array of request objects: id (UUID), asin, title, author, " +
      "status (one of: pending | awaiting_approval | denied | searching | downloading | " +
      "processing | downloaded | available | failed | cancelled | awaiting_search | awaiting_import | warn), " +
      "progress (0–100), createdAt (ISO 8601), updatedAt (ISO 8601), errorMessage.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "create_request",
    description:
      "Request an audiobook for download by its Audible ASIN. " +
      "With auto_search=true (default), ReadMeABook immediately queries Prowlarr indexers and " +
      "starts the download if a match is found. Set auto_search=false to queue the request " +
      "without searching (useful if you want to call manual_search_request later). " +
      "Returns the created request object including its id and initial status.",
    inputSchema: {
      type: "object",
      properties: {
        asin: {
          type: "string",
          description: 'Audible ASIN of the book to request. Example: "B08G9PRS1K"',
        },
        auto_search: {
          type: "boolean",
          description:
            "If true (default), triggers an immediate Prowlarr search and download. " +
            "Set false to create the request without searching yet.",
        },
      },
      required: ["asin"],
    },
  },
  {
    name: "delete_request",
    description:
      "Cancel and permanently delete an audiobook request. " +
      "If a download is in progress it will be stopped. This cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: 'Request UUID from get_requests. Example: "95996919-f295-4e62-8525-0706e18d6b74"',
        },
      },
      required: ["id"],
    },
  },
  {
    name: "manual_search_request",
    description:
      "Trigger a fresh Prowlarr indexer search for an existing request. " +
      "Use this when a request is stuck in 'searching' or 'failed' status. " +
      "Returns the updated request object. If results are found, the best match " +
      "is automatically selected and the download starts.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: 'Request UUID from get_requests. Example: "95996919-f295-4e62-8525-0706e18d6b74"',
        },
      },
      required: ["id"],
    },
  },
  {
    name: "search_torrents",
    description:
      "Search Prowlarr indexers for torrent/NZB sources for a specific audiobook. " +
      "Returns an array of results each containing: id, indexer, title, size (bytes), " +
      "seeders, leechers, qualityScore, downloadUrl. " +
      "Typically called after create_request fails to find a source automatically. " +
      "Pass the result id to select_torrent to trigger the download.",
    inputSchema: {
      type: "object",
      properties: {
        asin: {
          type: "string",
          description: 'Audible ASIN. Example: "B08G9PRS1K"',
        },
        title: {
          type: "string",
          description: 'Exact audiobook title from Audible metadata. Example: "Project Hail Mary"',
        },
        author: {
          type: "string",
          description: 'Primary author name. Example: "Andy Weir"',
        },
      },
      required: ["asin", "title", "author"],
    },
  },
  {
    name: "select_torrent",
    description:
      "Manually select a specific torrent/NZB result to download for a request. " +
      "Call search_torrents first to get the torrent_id. " +
      "Returns the updated request object with status changing to 'downloading'.",
    inputSchema: {
      type: "object",
      properties: {
        request_id: {
          type: "string",
          description: 'Request UUID from get_requests. Example: "95996919-f295-4e62-8525-0706e18d6b74"',
        },
        torrent_id: {
          type: "string",
          description: "Torrent/NZB result id from search_torrents output.",
        },
      },
      required: ["request_id", "torrent_id"],
    },
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  {
    name: "admin_get_metrics",
    description:
      "(Admin) Get system-level metrics. " +
      "Returns: totalRequests, pendingRequests, activeDownloads, totalUsers, " +
      "storageUsedBytes, storageAvailableBytes, uptimeSeconds.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "admin_get_active_downloads",
    description:
      "(Admin) Get all downloads currently in progress across all download clients. " +
      "Returns an array of: requestId, title, downloadClient, progress (0–100), " +
      "speed (bytes/s), eta (seconds), status.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
] as const;
