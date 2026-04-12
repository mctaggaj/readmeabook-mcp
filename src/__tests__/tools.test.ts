import { beforeEach, describe, expect, it, vi } from "vitest";
import { toolDefinitions, toolHandlers } from "../tools.js";
import type { ReadMeABookClient } from "../client.js";

// ---------------------------------------------------------------------------
// Mock client — all methods used by the full 46-tool handler set
// ---------------------------------------------------------------------------

function makeClient(): ReadMeABookClient {
  return {
    getHealth: vi.fn().mockResolvedValue({ status: "ok" }),
    getVersion: vi.fn().mockResolvedValue({ version: "1.1.7" }),
    searchAudiobooks: vi.fn().mockResolvedValue([]),
    getAudiobook: vi.fn().mockResolvedValue({}),
    getPopularAudiobooks: vi.fn().mockResolvedValue([]),
    getNewReleases: vi.fn().mockResolvedValue([]),
    getAudiobookDownloadStatus: vi.fn().mockResolvedValue({}),
    searchTorrents: vi.fn().mockResolvedValue([]),
    searchAuthors: vi.fn().mockResolvedValue([]),
    getAuthor: vi.fn().mockResolvedValue({}),
    getAuthorBooks: vi.fn().mockResolvedValue([]),
    searchSeries: vi.fn().mockResolvedValue([]),
    getSeries: vi.fn().mockResolvedValue({}),
    getRequests: vi.fn().mockResolvedValue([]),
    createRequest: vi.fn().mockResolvedValue({}),
    getRequest: vi.fn().mockResolvedValue({}),
    deleteRequest: vi.fn().mockResolvedValue({}),
    manualSearchRequest: vi.fn().mockResolvedValue({}),
    selectTorrent: vi.fn().mockResolvedValue({}),
    getBookDateRecommendations: vi.fn().mockResolvedValue([]),
    generateBookDateRecommendations: vi.fn().mockResolvedValue([]),
    swipeBookDate: vi.fn().mockResolvedValue({}),
    undoBookDateSwipe: vi.fn().mockResolvedValue({}),
    getWatchedSeries: vi.fn().mockResolvedValue([]),
    watchSeries: vi.fn().mockResolvedValue({}),
    unwatchSeries: vi.fn().mockResolvedValue({}),
    getWatchedAuthors: vi.fn().mockResolvedValue([]),
    watchAuthor: vi.fn().mockResolvedValue({}),
    unwatchAuthor: vi.fn().mockResolvedValue({}),
    getIgnoredAudiobooks: vi.fn().mockResolvedValue([]),
    ignoreAudiobook: vi.fn().mockResolvedValue({}),
    unignoreAudiobook: vi.fn().mockResolvedValue({}),
    getApiTokens: vi.fn().mockResolvedValue([]),
    createApiToken: vi.fn().mockResolvedValue({}),
    deleteApiToken: vi.fn().mockResolvedValue({}),
    adminGetRequests: vi.fn().mockResolvedValue([]),
    adminGetPendingApproval: vi.fn().mockResolvedValue([]),
    adminApproveRequest: vi.fn().mockResolvedValue({}),
    adminRetryDownload: vi.fn().mockResolvedValue({}),
    adminGetUsers: vi.fn().mockResolvedValue([]),
    adminGetPendingUsers: vi.fn().mockResolvedValue([]),
    adminApproveUser: vi.fn().mockResolvedValue({}),
    adminUpdateUser: vi.fn().mockResolvedValue({}),
    adminDeleteUser: vi.fn().mockResolvedValue({}),
    adminGetJobs: vi.fn().mockResolvedValue([]),
    adminTriggerJob: vi.fn().mockResolvedValue({}),
    adminGetActiveDownloads: vi.fn().mockResolvedValue([]),
    adminGetLogs: vi.fn().mockResolvedValue([]),
    adminGetMetrics: vi.fn().mockResolvedValue({}),
    adminPlexScan: vi.fn().mockResolvedValue({}),
    adminGetReportedIssues: vi.fn().mockResolvedValue([]),
    adminResolveIssue: vi.fn().mockResolvedValue({}),
    adminReplaceIssue: vi.fn().mockResolvedValue({}),
  } as unknown as ReadMeABookClient;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

describe("toolHandlers", () => {
  let client: ReadMeABookClient;

  beforeEach(() => {
    client = makeClient();
  });

  it("health_check delegates to client.getHealth", async () => {
    await toolHandlers.health_check(client, {});
    expect(client.getHealth).toHaveBeenCalledOnce();
  });

  it("get_version delegates to client.getVersion", async () => {
    await toolHandlers.get_version(client, {});
    expect(client.getVersion).toHaveBeenCalledOnce();
  });

  it("search_audiobooks passes query and page", async () => {
    await toolHandlers.search_audiobooks(client, { query: "Andy Weir", page: 3 });
    expect(client.searchAudiobooks).toHaveBeenCalledWith("Andy Weir", 3);
  });

  it("search_audiobooks defaults page to 1 when omitted", async () => {
    await toolHandlers.search_audiobooks(client, { query: "test" });
    expect(client.searchAudiobooks).toHaveBeenCalledWith("test", 1);
  });

  it("get_audiobook passes asin", async () => {
    await toolHandlers.get_audiobook(client, { asin: "B08G9PRS1K" });
    expect(client.getAudiobook).toHaveBeenCalledWith("B08G9PRS1K");
  });

  it("get_popular_audiobooks delegates to client", async () => {
    await toolHandlers.get_popular_audiobooks(client, {});
    expect(client.getPopularAudiobooks).toHaveBeenCalledOnce();
  });

  it("get_new_releases delegates to client", async () => {
    await toolHandlers.get_new_releases(client, {});
    expect(client.getNewReleases).toHaveBeenCalledOnce();
  });

  it("get_audiobook_download_status passes asin", async () => {
    await toolHandlers.get_audiobook_download_status(client, { asin: "B08G9PRS1K" });
    expect(client.getAudiobookDownloadStatus).toHaveBeenCalledWith("B08G9PRS1K");
  });

  it("search_torrents passes asin, title, author", async () => {
    await toolHandlers.search_torrents(client, { asin: "B08G9PRS1K", title: "Project Hail Mary", author: "Andy Weir" });
    expect(client.searchTorrents).toHaveBeenCalledWith("B08G9PRS1K", "Project Hail Mary", "Andy Weir");
  });

  it("search_authors passes query", async () => {
    await toolHandlers.search_authors(client, { query: "Andy Weir" });
    expect(client.searchAuthors).toHaveBeenCalledWith("Andy Weir");
  });

  it("get_author passes asin", async () => {
    await toolHandlers.get_author(client, { asin: "B001H6UB6S" });
    expect(client.getAuthor).toHaveBeenCalledWith("B001H6UB6S");
  });

  it("get_author_books passes asin", async () => {
    await toolHandlers.get_author_books(client, { asin: "B001H6UB6S" });
    expect(client.getAuthorBooks).toHaveBeenCalledWith("B001H6UB6S");
  });

  it("search_series passes query", async () => {
    await toolHandlers.search_series(client, { query: "Mistborn" });
    expect(client.searchSeries).toHaveBeenCalledWith("Mistborn");
  });

  it("get_series passes asin", async () => {
    await toolHandlers.get_series(client, { asin: "B07CM4FVPZ" });
    expect(client.getSeries).toHaveBeenCalledWith("B07CM4FVPZ");
  });

  it("get_requests delegates to client", async () => {
    await toolHandlers.get_requests(client, {});
    expect(client.getRequests).toHaveBeenCalledWith(undefined);
  });

  it("get_requests passes page", async () => {
    await toolHandlers.get_requests(client, { page: 3 });
    expect(client.getRequests).toHaveBeenCalledWith(3);
  });

  it("create_request passes asin and auto_search", async () => {
    await toolHandlers.create_request(client, { asin: "B08G9PRS1K", auto_search: false });
    expect(client.createRequest).toHaveBeenCalledWith("B08G9PRS1K", false);
  });

  it("create_request defaults auto_search to true", async () => {
    await toolHandlers.create_request(client, { asin: "B08G9PRS1K" });
    expect(client.createRequest).toHaveBeenCalledWith("B08G9PRS1K", true);
  });

  it("get_request passes id", async () => {
    await toolHandlers.get_request(client, { id: "req-uuid" });
    expect(client.getRequest).toHaveBeenCalledWith("req-uuid");
  });

  it("delete_request passes id", async () => {
    await toolHandlers.delete_request(client, { id: "req-uuid" });
    expect(client.deleteRequest).toHaveBeenCalledWith("req-uuid");
  });

  it("manual_search_request passes id", async () => {
    await toolHandlers.manual_search_request(client, { id: "req-uuid" });
    expect(client.manualSearchRequest).toHaveBeenCalledWith("req-uuid");
  });

  it("select_torrent passes request_id and torrent_id", async () => {
    await toolHandlers.select_torrent(client, { request_id: "req-uuid", torrent_id: "torrent-id" });
    expect(client.selectTorrent).toHaveBeenCalledWith("req-uuid", "torrent-id");
  });

  it("get_bookdate_recommendations delegates to client", async () => {
    await toolHandlers.get_bookdate_recommendations(client, {});
    expect(client.getBookDateRecommendations).toHaveBeenCalledOnce();
  });

  it("generate_bookdate_recommendations delegates to client", async () => {
    await toolHandlers.generate_bookdate_recommendations(client, {});
    expect(client.generateBookDateRecommendations).toHaveBeenCalledOnce();
  });

  it("swipe_bookdate passes recommendation_id and action", async () => {
    await toolHandlers.swipe_bookdate(client, { recommendation_id: "rec-uuid", action: "right" });
    expect(client.swipeBookDate).toHaveBeenCalledWith("rec-uuid", "right");
  });

  it("undo_bookdate_swipe delegates to client", async () => {
    await toolHandlers.undo_bookdate_swipe(client, {});
    expect(client.undoBookDateSwipe).toHaveBeenCalledOnce();
  });

  it("get_watched_series delegates to client", async () => {
    await toolHandlers.get_watched_series(client, {});
    expect(client.getWatchedSeries).toHaveBeenCalledOnce();
  });

  it("watch_series passes series_asin and series_title", async () => {
    await toolHandlers.watch_series(client, { series_asin: "series-asin", series_title: "Dungeon Crawler Carl" });
    expect(client.watchSeries).toHaveBeenCalledWith("series-asin", "Dungeon Crawler Carl");
  });

  it("unwatch_series passes id", async () => {
    await toolHandlers.unwatch_series(client, { id: "watch-uuid" });
    expect(client.unwatchSeries).toHaveBeenCalledWith("watch-uuid");
  });

  it("get_watched_authors delegates to client", async () => {
    await toolHandlers.get_watched_authors(client, {});
    expect(client.getWatchedAuthors).toHaveBeenCalledOnce();
  });

  it("watch_author passes author_asin and author_name", async () => {
    await toolHandlers.watch_author(client, { author_asin: "author-asin", author_name: "Andy Weir" });
    expect(client.watchAuthor).toHaveBeenCalledWith("author-asin", "Andy Weir");
  });

  it("unwatch_author passes id", async () => {
    await toolHandlers.unwatch_author(client, { id: "watch-uuid" });
    expect(client.unwatchAuthor).toHaveBeenCalledWith("watch-uuid");
  });

  it("get_ignored_audiobooks delegates to client", async () => {
    await toolHandlers.get_ignored_audiobooks(client, {});
    expect(client.getIgnoredAudiobooks).toHaveBeenCalledOnce();
  });

  it("ignore_audiobook passes asin and title", async () => {
    await toolHandlers.ignore_audiobook(client, { asin: "B08G9PRS1K", title: "Project Hail Mary" });
    expect(client.ignoreAudiobook).toHaveBeenCalledWith("B08G9PRS1K", "Project Hail Mary");
  });

  it("unignore_audiobook passes id", async () => {
    await toolHandlers.unignore_audiobook(client, { id: "ignored-uuid" });
    expect(client.unignoreAudiobook).toHaveBeenCalledWith("ignored-uuid");
  });

  it("get_api_tokens delegates to client", async () => {
    await toolHandlers.get_api_tokens(client, {});
    expect(client.getApiTokens).toHaveBeenCalledOnce();
  });

  it("create_api_token passes name and expires_at", async () => {
    await toolHandlers.create_api_token(client, { name: "My Token", expires_at: "2027-01-01T00:00:00Z" });
    expect(client.createApiToken).toHaveBeenCalledWith("My Token", "2027-01-01T00:00:00Z");
  });

  it("delete_api_token passes id", async () => {
    await toolHandlers.delete_api_token(client, { id: "token-uuid" });
    expect(client.deleteApiToken).toHaveBeenCalledWith("token-uuid");
  });

  it("admin_get_requests passes status", async () => {
    await toolHandlers.admin_get_requests(client, { status: "failed" });
    expect(client.adminGetRequests).toHaveBeenCalledWith("failed", undefined);
  });

  it("admin_get_requests passes status and page", async () => {
    await toolHandlers.admin_get_requests(client, { status: "awaiting_search", page: 2 });
    expect(client.adminGetRequests).toHaveBeenCalledWith("awaiting_search", 2);
  });

  it("admin_get_pending_approval delegates to client", async () => {
    await toolHandlers.admin_get_pending_approval(client, {});
    expect(client.adminGetPendingApproval).toHaveBeenCalledOnce();
  });

  it("admin_approve_request passes id, approved, reason", async () => {
    await toolHandlers.admin_approve_request(client, { id: "req-uuid", approved: true, reason: "ok" });
    expect(client.adminApproveRequest).toHaveBeenCalledWith("req-uuid", true, "ok");
  });

  it("admin_retry_download passes id", async () => {
    await toolHandlers.admin_retry_download(client, { id: "req-uuid" });
    expect(client.adminRetryDownload).toHaveBeenCalledWith("req-uuid");
  });

  it("admin_get_users delegates to client", async () => {
    await toolHandlers.admin_get_users(client, {});
    expect(client.adminGetUsers).toHaveBeenCalledOnce();
  });

  it("admin_get_pending_users delegates to client", async () => {
    await toolHandlers.admin_get_pending_users(client, {});
    expect(client.adminGetPendingUsers).toHaveBeenCalledOnce();
  });

  it("admin_approve_user passes id", async () => {
    await toolHandlers.admin_approve_user(client, { id: "user-uuid" });
    expect(client.adminApproveUser).toHaveBeenCalledWith("user-uuid");
  });

  it("admin_update_user passes id and updates", async () => {
    await toolHandlers.admin_update_user(client, { id: "user-uuid", role: "admin" });
    expect(client.adminUpdateUser).toHaveBeenCalledWith("user-uuid", { role: "admin", permissions: undefined });
  });

  it("admin_delete_user passes id", async () => {
    await toolHandlers.admin_delete_user(client, { id: "user-uuid" });
    expect(client.adminDeleteUser).toHaveBeenCalledWith("user-uuid");
  });

  it("admin_get_jobs delegates to client", async () => {
    await toolHandlers.admin_get_jobs(client, {});
    expect(client.adminGetJobs).toHaveBeenCalledOnce();
  });

  it("admin_trigger_job passes id", async () => {
    await toolHandlers.admin_trigger_job(client, { id: "job-uuid" });
    expect(client.adminTriggerJob).toHaveBeenCalledWith("job-uuid");
  });

  it("admin_get_active_downloads delegates to client", async () => {
    await toolHandlers.admin_get_active_downloads(client, {});
    expect(client.adminGetActiveDownloads).toHaveBeenCalledOnce();
  });

  it("admin_get_logs delegates to client", async () => {
    await toolHandlers.admin_get_logs(client, {});
    expect(client.adminGetLogs).toHaveBeenCalledOnce();
  });

  it("admin_get_metrics delegates to client", async () => {
    await toolHandlers.admin_get_metrics(client, {});
    expect(client.adminGetMetrics).toHaveBeenCalledOnce();
  });

  it("admin_plex_scan delegates to client", async () => {
    await toolHandlers.admin_plex_scan(client, {});
    expect(client.adminPlexScan).toHaveBeenCalledOnce();
  });

  it("admin_get_reported_issues delegates to client", async () => {
    await toolHandlers.admin_get_reported_issues(client, {});
    expect(client.adminGetReportedIssues).toHaveBeenCalledOnce();
  });

  it("admin_resolve_issue passes id", async () => {
    await toolHandlers.admin_resolve_issue(client, { id: "issue-uuid" });
    expect(client.adminResolveIssue).toHaveBeenCalledWith("issue-uuid");
  });

  it("admin_replace_issue passes id", async () => {
    await toolHandlers.admin_replace_issue(client, { id: "issue-uuid" });
    expect(client.adminReplaceIssue).toHaveBeenCalledWith("issue-uuid");
  });
});

// ---------------------------------------------------------------------------
// Tool definitions structure
// ---------------------------------------------------------------------------

describe("toolDefinitions", () => {
  it("every definition has a non-empty name", () => {
    for (const def of toolDefinitions) {
      expect(def.name).toBeTruthy();
    }
  });

  it("every definition has a non-empty description", () => {
    for (const def of toolDefinitions) {
      expect(def.description.length).toBeGreaterThan(10);
    }
  });

  it("every definition has a valid inputSchema", () => {
    for (const def of toolDefinitions) {
      expect(def.inputSchema).toBeDefined();
      expect((def.inputSchema as { type: string }).type).toBe("object");
    }
  });

  it("every definition name has a corresponding handler", () => {
    for (const def of toolDefinitions) {
      expect(toolHandlers[def.name], `no handler for ${def.name}`).toBeDefined();
    }
  });

  it("every handler name has a corresponding definition", () => {
    const definedNames = new Set(toolDefinitions.map((d) => d.name));
    for (const name of Object.keys(toolHandlers)) {
      expect(definedNames.has(name), `no definition for handler ${name}`).toBe(true);
    }
  });

  it("definition names are unique", () => {
    const names = toolDefinitions.map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("required fields in inputSchema are a subset of defined properties", () => {
    for (const def of toolDefinitions) {
      const schema = def.inputSchema as {
        properties: Record<string, unknown>;
        required: string[];
      };
      for (const req of schema.required ?? []) {
        expect(
          schema.properties,
          `${def.name}: required field "${req}" not in properties`
        ).toHaveProperty(req);
      }
    }
  });
});
