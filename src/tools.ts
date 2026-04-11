import type { ReadMeABookClient } from "./client.js";
import type { RequestStatus, SwipeAction, UserRole } from "./types.js";

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

function optStr(args: ToolArgs, key: string): string | undefined {
  return args[key] as string | undefined;
}

function bool(args: ToolArgs, key: string): boolean {
  return args[key] as boolean;
}

function optBool(args: ToolArgs, key: string): boolean | undefined {
  return args[key] as boolean | undefined;
}

// ---------------------------------------------------------------------------
// Handlers
//
// NOTE: This is the all-endpoints branch — full 46-tool implementation.
// Many endpoints are blocked by ReadMeABook's API token allowlist
// (src/lib/constants/api-tokens.ts in the ReadMeABook source).
// They will work once that allowlist is expanded.
// The main branch exposes only the 9 confirmed-working endpoints.
// ---------------------------------------------------------------------------

export const toolHandlers: Record<string, ToolHandler> = {
  health_check: (client) => client.getHealth(),
  get_version: (client) => client.getVersion(),
  search_audiobooks: (client, args) =>
    client.searchAudiobooks(str(args, "query"), (args.page as number | undefined) ?? 1),
  get_audiobook: (client, args) => client.getAudiobook(str(args, "asin")),
  get_popular_audiobooks: (client) => client.getPopularAudiobooks(),
  get_new_releases: (client) => client.getNewReleases(),
  get_audiobook_download_status: (client, args) =>
    client.getAudiobookDownloadStatus(str(args, "asin")),
  search_torrents: (client, args) =>
    client.searchTorrents(str(args, "asin"), str(args, "title"), str(args, "author")),
  search_authors: (client, args) => client.searchAuthors(str(args, "query")),
  get_author: (client, args) => client.getAuthor(str(args, "asin")),
  get_author_books: (client, args) => client.getAuthorBooks(str(args, "asin")),
  search_series: (client, args) => client.searchSeries(str(args, "query")),
  get_series: (client, args) => client.getSeries(str(args, "asin")),
  get_requests: (client) => client.getRequests(),
  create_request: (client, args) =>
    client.createRequest(str(args, "asin"), optBool(args, "auto_search") ?? true),
  get_request: (client, args) => client.getRequest(str(args, "id")),
  delete_request: (client, args) => client.deleteRequest(str(args, "id")),
  manual_search_request: (client, args) => client.manualSearchRequest(str(args, "id")),
  select_torrent: (client, args) =>
    client.selectTorrent(str(args, "request_id"), str(args, "torrent_id")),
  get_bookdate_recommendations: (client) => client.getBookDateRecommendations(),
  generate_bookdate_recommendations: (client) => client.generateBookDateRecommendations(),
  swipe_bookdate: (client, args) =>
    client.swipeBookDate(str(args, "recommendation_id"), str(args, "action") as SwipeAction),
  undo_bookdate_swipe: (client) => client.undoBookDateSwipe(),
  get_watched_series: (client) => client.getWatchedSeries(),
  watch_series: (client, args) =>
    client.watchSeries(str(args, "series_asin"), str(args, "series_title")),
  unwatch_series: (client, args) => client.unwatchSeries(str(args, "id")),
  get_watched_authors: (client) => client.getWatchedAuthors(),
  watch_author: (client, args) =>
    client.watchAuthor(str(args, "author_asin"), str(args, "author_name")),
  unwatch_author: (client, args) => client.unwatchAuthor(str(args, "id")),
  get_ignored_audiobooks: (client) => client.getIgnoredAudiobooks(),
  ignore_audiobook: (client, args) =>
    client.ignoreAudiobook(str(args, "asin"), str(args, "title")),
  unignore_audiobook: (client, args) => client.unignoreAudiobook(str(args, "id")),
  get_api_tokens: (client) => client.getApiTokens(),
  create_api_token: (client, args) =>
    client.createApiToken(str(args, "name"), optStr(args, "expires_at")),
  delete_api_token: (client, args) => client.deleteApiToken(str(args, "id")),
  admin_get_requests: (client, args) =>
    client.adminGetRequests(optStr(args, "status") as RequestStatus | undefined),
  admin_get_pending_approval: (client) => client.adminGetPendingApproval(),
  admin_approve_request: (client, args) =>
    client.adminApproveRequest(str(args, "id"), bool(args, "approved"), optStr(args, "reason")),
  admin_retry_download: (client, args) => client.adminRetryDownload(str(args, "id")),
  admin_get_users: (client) => client.adminGetUsers(),
  admin_get_pending_users: (client) => client.adminGetPendingUsers(),
  admin_approve_user: (client, args) => client.adminApproveUser(str(args, "id")),
  admin_update_user: (client, args) =>
    client.adminUpdateUser(str(args, "id"), {
      role: optStr(args, "role") as UserRole | undefined,
      permissions: args.permissions as Record<string, boolean> | undefined,
    }),
  admin_delete_user: (client, args) => client.adminDeleteUser(str(args, "id")),
  admin_get_jobs: (client) => client.adminGetJobs(),
  admin_trigger_job: (client, args) => client.adminTriggerJob(str(args, "id")),
  admin_get_active_downloads: (client) => client.adminGetActiveDownloads(),
  admin_get_logs: (client) => client.adminGetLogs(),
  admin_get_metrics: (client) => client.adminGetMetrics(),
  admin_plex_scan: (client) => client.adminPlexScan(),
  admin_get_reported_issues: (client) => client.adminGetReportedIssues(),
  admin_resolve_issue: (client, args) => client.adminResolveIssue(str(args, "id")),
  admin_replace_issue: (client, args) => client.adminReplaceIssue(str(args, "id")),
};

export const toolDefinitions = [
  { name: "health_check", description: 'Check server health. Returns {"status": "ok"} when healthy.', inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_version", description: 'Get app version. Returns {"version": "1.1.7", "buildDate": "2026-03-20", "commit": "54b54d3"}.', inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "search_audiobooks", description: "Search Audible for audiobooks by title, author, or keyword. Returns: asin, title, authors[], narrators[], ratingAverage (0–5), releaseDate (ISO 8601), seriesName, lengthMinutes.", inputSchema: { type: "object", properties: { query: { type: "string", description: 'Search terms. Example: "Andy Weir"' }, page: { type: "number", description: "1-based page (20 results/page). Defaults to 1." } }, required: ["query"] } },
  { name: "get_audiobook", description: "Get full metadata for an audiobook by Audible ASIN. Includes isAvailable and requestStatus.", inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Audible ASIN. Example: "B08G9PRS1K"' } }, required: ["asin"] } },
  { name: "get_popular_audiobooks", description: "Get the top 100 trending audiobooks from Audible. Each includes isAvailable and requestStatus.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_new_releases", description: "Get recently released audiobooks from Audible (last 30–60 days). Each includes releaseDate (ISO 8601) and isAvailable.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_audiobook_download_status", description: 'Check whether an audiobook is in the library. Returns {"asin": "...", "isAvailable": true, "filePath": "..."}.', inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Audible ASIN. Example: "B08G9PRS1K"' } }, required: ["asin"] } },
  { name: "search_torrents", description: "Search Prowlarr indexers for torrent/NZB sources. Returns results with id, indexer, size (bytes), seeders, qualityScore. Pass id to select_torrent to download.", inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Audible ASIN. Example: "B08G9PRS1K"' }, title: { type: "string", description: 'Title. Example: "Project Hail Mary"' }, author: { type: "string", description: 'Author. Example: "Andy Weir"' } }, required: ["asin", "title", "author"] } },
  { name: "search_authors", description: "Search for authors on Audible. Returns: asin, name, bio, bookCount.", inputSchema: { type: "object", properties: { query: { type: "string", description: 'Author name. Example: "Brandon Sanderson"' } }, required: ["query"] } },
  { name: "get_author", description: "Get full profile for an author by their Audible ASIN.", inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Author ASIN. Example: "B001H6UB6S"' } }, required: ["asin"] } },
  { name: "get_author_books", description: "Get all audiobooks by a specific author, ordered by release date descending. Each includes isAvailable and requestStatus.", inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Author ASIN. Example: "B001H6UB6S"' } }, required: ["asin"] } },
  { name: "search_series", description: "Search for audiobook series by name. Returns: asin, title, authorName, bookCount.", inputSchema: { type: "object", properties: { query: { type: "string", description: 'Series name. Example: "Dungeon Crawler Carl"' } }, required: ["query"] } },
  { name: "get_series", description: "Get full series details including ordered book list. Each book includes asin, seriesPosition, isAvailable, requestStatus.", inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Series ASIN. Example: "B07CM4FVPZ"' } }, required: ["asin"] } },
  { name: "get_requests", description: "List all audiobook requests. Returns: id (UUID), asin, title, status (pending|awaiting_approval|denied|searching|downloading|processing|downloaded|available|failed|cancelled|awaiting_search|awaiting_import|warn), progress (0–100), createdAt (ISO 8601), errorMessage.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "create_request", description: "Request an audiobook by Audible ASIN. auto_search=true (default) triggers an immediate Prowlarr search.", inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Audible ASIN. Example: "B08G9PRS1K"' }, auto_search: { type: "boolean", description: "Trigger immediate search (default: true)." } }, required: ["asin"] } },
  { name: "get_request", description: "Get status and details of a specific request. Returns full request object including progress (0–100) and downloadHistory[].", inputSchema: { type: "object", properties: { id: { type: "string", description: 'Request UUID. Example: "95996919-f295-4e62-8525-0706e18d6b74"' } }, required: ["id"] } },
  { name: "delete_request", description: "Cancel and permanently delete a request. Cannot be undone.", inputSchema: { type: "object", properties: { id: { type: "string", description: 'Request UUID. Example: "95996919-f295-4e62-8525-0706e18d6b74"' } }, required: ["id"] } },
  { name: "manual_search_request", description: "Trigger a fresh Prowlarr search for an existing request. Use when stuck in 'searching' or 'failed'.", inputSchema: { type: "object", properties: { id: { type: "string", description: 'Request UUID. Example: "95996919-f295-4e62-8525-0706e18d6b74"' } }, required: ["id"] } },
  { name: "select_torrent", description: "Select a specific torrent/NZB result to download. Call search_torrents first to get torrent_id.", inputSchema: { type: "object", properties: { request_id: { type: "string", description: 'Request UUID. Example: "95996919-f295-4e62-8525-0706e18d6b74"' }, torrent_id: { type: "string", description: "Torrent/NZB id from search_torrents." } }, required: ["request_id", "torrent_id"] } },
  { name: "get_bookdate_recommendations", description: "Get pending AI-generated audiobook recommendations. Returns: id, title, author, asin, aiReason, coverArtUrl.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "generate_bookdate_recommendations", description: "Generate a new batch of AI audiobook recommendations based on listening history.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "swipe_bookdate", description: '"right" = request it, "left" = skip/hide, "up" = already know/own it.', inputSchema: { type: "object", properties: { recommendation_id: { type: "string", description: "Recommendation UUID." }, action: { type: "string", enum: ["left", "right", "up"], description: '"right"=request, "left"=skip, "up"=already known.' } }, required: ["recommendation_id", "action"] } },
  { name: "undo_bookdate_swipe", description: "Undo the most recent BookDate swipe.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_watched_series", description: "List watched series (auto-request on new releases). Returns: id, seriesAsin, seriesTitle, createdAt.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "watch_series", description: "Watch a series so new releases are automatically requested.", inputSchema: { type: "object", properties: { series_asin: { type: "string", description: 'Series ASIN. Example: "B07CM4FVPZ"' }, series_title: { type: "string", description: 'Display name. Example: "Dungeon Crawler Carl"' } }, required: ["series_asin", "series_title"] } },
  { name: "unwatch_series", description: "Stop watching a series.", inputSchema: { type: "object", properties: { id: { type: "string", description: "Watched-series record UUID." } }, required: ["id"] } },
  { name: "get_watched_authors", description: "List watched authors (auto-request on new books). Returns: id, authorAsin, authorName, createdAt.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "watch_author", description: "Watch an author so their new audiobooks are automatically requested.", inputSchema: { type: "object", properties: { author_asin: { type: "string", description: 'Author ASIN. Example: "B001H6UB6S"' }, author_name: { type: "string", description: 'Display name. Example: "Andy Weir"' } }, required: ["author_asin", "author_name"] } },
  { name: "unwatch_author", description: "Stop watching an author.", inputSchema: { type: "object", properties: { id: { type: "string", description: "Watched-author record UUID." } }, required: ["id"] } },
  { name: "get_ignored_audiobooks", description: "List ignored audiobooks (excluded from auto-requests). Returns: id, asin, title, createdAt.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "ignore_audiobook", description: "Mark an audiobook as ignored so it is never automatically requested.", inputSchema: { type: "object", properties: { asin: { type: "string", description: 'Audible ASIN. Example: "B08G9PRS1K"' }, title: { type: "string", description: 'Title. Example: "Project Hail Mary"' } }, required: ["asin", "title"] } },
  { name: "unignore_audiobook", description: "Remove an audiobook from the ignore list.", inputSchema: { type: "object", properties: { id: { type: "string", description: "Ignored-audiobook record UUID." } }, required: ["id"] } },
  { name: "get_api_tokens", description: "List API tokens. Returns: id, name, createdAt, expiresAt.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "create_api_token", description: "Create a new API token. Returns the raw token value — shown only once.", inputSchema: { type: "object", properties: { name: { type: "string", description: 'Label. Example: "Home Assistant"' }, expires_at: { type: "string", description: 'ISO 8601 expiry. Example: "2027-01-01T00:00:00Z". Omit for no expiry.' } }, required: ["name"] } },
  { name: "delete_api_token", description: "Permanently revoke an API token.", inputSchema: { type: "object", properties: { id: { type: "string", description: "Token UUID." } }, required: ["id"] } },
  { name: "admin_get_requests", description: "(Admin) List all requests across all users. Optionally filter by status.", inputSchema: { type: "object", properties: { status: { type: "string", enum: ["pending","awaiting_approval","denied","searching","downloading","processing","downloaded","available","failed","cancelled","awaiting_search","awaiting_import","warn"], description: "Filter to this status. Omit for all." } }, required: [] } },
  { name: "admin_get_pending_approval", description: "(Admin) Get all requests awaiting manual approval.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_approve_request", description: "(Admin) Approve or deny a request. Approving triggers search and download.", inputSchema: { type: "object", properties: { id: { type: "string", description: 'Request UUID. Example: "95996919-f295-4e62-8525-0706e18d6b74"' }, approved: { type: "boolean", description: "true=approve, false=deny." }, reason: { type: "string", description: "Optional denial reason shown to user." } }, required: ["id", "approved"] } },
  { name: "admin_retry_download", description: "(Admin) Retry a failed download. Resets status to 'searching'.", inputSchema: { type: "object", properties: { id: { type: "string", description: 'Request UUID. Example: "95996919-f295-4e62-8525-0706e18d6b74"' } }, required: ["id"] } },
  { name: "admin_get_users", description: "(Admin) List all users. Returns: id, displayName, role (user|admin), authProvider, createdAt, requestCount.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_get_pending_users", description: "(Admin) List users awaiting admin approval.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_approve_user", description: "(Admin) Approve a pending user registration.", inputSchema: { type: "object", properties: { id: { type: "string", description: "User UUID." } }, required: ["id"] } },
  { name: "admin_update_user", description: "(Admin) Update a user's role or permissions (interactive_search_access, download_access, auto_approve_requests).", inputSchema: { type: "object", properties: { id: { type: "string", description: "User UUID." }, role: { type: "string", enum: ["user", "admin"] }, permissions: { type: "object", properties: { interactive_search_access: { type: "boolean" }, download_access: { type: "boolean" }, auto_approve_requests: { type: "boolean" } } } }, required: ["id"] } },
  { name: "admin_delete_user", description: "(Admin) Permanently delete a user account and all their requests.", inputSchema: { type: "object", properties: { id: { type: "string", description: "User UUID." } }, required: ["id"] } },
  { name: "admin_get_jobs", description: "(Admin) List all background jobs. Returns: id, type, status (pending|active|completed|failed|delayed|stuck), requestId, createdAt.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_trigger_job", description: "(Admin) Manually trigger a background job.", inputSchema: { type: "object", properties: { id: { type: "string", description: "Job UUID." } }, required: ["id"] } },
  { name: "admin_get_active_downloads", description: "(Admin) Get all downloads in progress. Returns: requestId, title, downloadClient, progress (0–100), speed (bytes/s), eta (seconds).", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_get_logs", description: "(Admin) Get recent log entries. Returns: timestamp (ISO 8601), level (info|warn|error), message.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_get_metrics", description: "(Admin) Get system metrics: totalRequests, pendingRequests, activeDownloads, totalUsers, storageUsedBytes, uptimeSeconds.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_plex_scan", description: "(Admin) Trigger a Plex library scan (runs asynchronously).", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_get_reported_issues", description: "(Admin) List reported audiobook problems. Returns: id, title, reporterName, reason, status (open|dismissed|replaced), createdAt.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "admin_resolve_issue", description: "(Admin) Dismiss a reported issue without replacing the file.", inputSchema: { type: "object", properties: { id: { type: "string", description: "Issue UUID." } }, required: ["id"] } },
  { name: "admin_replace_issue", description: "(Admin) Queue a replacement download for a reported issue.", inputSchema: { type: "object", properties: { id: { type: "string", description: "Issue UUID." } }, required: ["id"] } },
] as const;
