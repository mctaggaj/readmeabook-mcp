import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReadMeABookClient } from "../client.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = "http://localhost:3000";
const TOKEN = "test-token";

function makeClient() {
  return new ReadMeABookClient({ baseUrl: BASE, apiToken: TOKEN });
}

const mockFetch = vi.fn();

function ok(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function fail(status: number, statusText: string, body?: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
    json:
      body !== undefined
        ? () => Promise.resolve(body)
        : () => Promise.reject(new Error("not json")),
  });
}

function lastCall() {
  return mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [
    string,
    RequestInit,
  ];
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReadMeABookClient", () => {
  describe("constructor", () => {
    it("strips trailing slash from baseUrl", async () => {
      const c = new ReadMeABookClient({ baseUrl: `${BASE}/`, apiToken: TOKEN });
      ok({ status: "ok" });
      await c.getHealth();
      expect(lastCall()[0]).toBe(`${BASE}/api/health`);
    });
  });

  describe("request internals", () => {
    it("includes Authorization and Content-Type headers", async () => {
      ok({});
      await makeClient().getHealth();
      const [, init] = lastCall();
      expect((init.headers as Record<string, string>)["Authorization"]).toBe(
        `Bearer ${TOKEN}`
      );
      expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
        "application/json"
      );
    });

    it("throws with error field from response body", async () => {
      fail(403, "Forbidden", { error: "Insufficient permissions" });
      await expect(makeClient().getHealth()).rejects.toThrow(
        "Insufficient permissions"
      );
    });

    it("throws with message field from response body", async () => {
      fail(403, "Forbidden", { message: "Access denied" });
      await expect(makeClient().getHealth()).rejects.toThrow("Access denied");
    });

    it("falls back to HTTP status when body has no error/message", async () => {
      fail(404, "Not Found", { other: "field" });
      await expect(makeClient().getHealth()).rejects.toThrow(
        "HTTP 404: Not Found"
      );
    });

    it("falls back to HTTP status when body is not JSON", async () => {
      fail(500, "Internal Server Error");
      await expect(makeClient().getHealth()).rejects.toThrow(
        "HTTP 500: Internal Server Error"
      );
    });
  });

  // ── System ────────────────────────────────────────────────────────────────

  describe("getHealth", () => {
    it("GETs /health and returns response", async () => {
      ok({ status: "ok" });
      const result = await makeClient().getHealth();
      expect(lastCall()[0]).toBe(`${BASE}/api/health`);
      expect(result).toEqual({ status: "ok" });
    });
  });

  describe("getVersion", () => {
    it("GETs /version", async () => {
      ok({ version: "1.1.7" });
      await makeClient().getVersion();
      expect(lastCall()[0]).toBe(`${BASE}/api/version`);
    });
  });

  // ── Audiobooks ────────────────────────────────────────────────────────────

  describe("searchAudiobooks", () => {
    it("encodes query and passes page", async () => {
      ok([]);
      await makeClient().searchAudiobooks("Andy Weir", 2);
      expect(lastCall()[0]).toBe(
        `${BASE}/api/audiobooks/search?q=Andy%20Weir&page=2`
      );
    });

    it("defaults to page 1", async () => {
      ok([]);
      await makeClient().searchAudiobooks("test");
      expect(lastCall()[0]).toContain("page=1");
    });
  });

  describe("getAudiobook", () => {
    it("GETs /audiobooks/:asin", async () => {
      ok({});
      await makeClient().getAudiobook("B08G9PRS1K");
      expect(lastCall()[0]).toBe(`${BASE}/api/audiobooks/B08G9PRS1K`);
    });
  });

  describe("getPopularAudiobooks", () => {
    it("GETs /audiobooks/popular", async () => {
      ok([]);
      await makeClient().getPopularAudiobooks();
      expect(lastCall()[0]).toBe(`${BASE}/api/audiobooks/popular`);
    });
  });

  describe("getNewReleases", () => {
    it("GETs /audiobooks/new-releases", async () => {
      ok([]);
      await makeClient().getNewReleases();
      expect(lastCall()[0]).toBe(`${BASE}/api/audiobooks/new-releases`);
    });
  });

  describe("getAudiobookDownloadStatus", () => {
    it("GETs /audiobooks/:asin/download-status", async () => {
      ok({});
      await makeClient().getAudiobookDownloadStatus("B08G9PRS1K");
      expect(lastCall()[0]).toBe(
        `${BASE}/api/audiobooks/B08G9PRS1K/download-status`
      );
    });
  });

  describe("searchTorrents", () => {
    it("POSTs asin/title/author to /audiobooks/search-torrents", async () => {
      ok([]);
      await makeClient().searchTorrents(
        "B08G9PRS1K",
        "Project Hail Mary",
        "Andy Weir"
      );
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/audiobooks/search-torrents`);
      expect(init.method).toBe("POST");
      expect(init.body).toBe(
        JSON.stringify({
          asin: "B08G9PRS1K",
          title: "Project Hail Mary",
          author: "Andy Weir",
        })
      );
    });
  });

  // ── Authors ───────────────────────────────────────────────────────────────

  describe("searchAuthors", () => {
    it("encodes query", async () => {
      ok([]);
      await makeClient().searchAuthors("Andy Weir");
      expect(lastCall()[0]).toBe(
        `${BASE}/api/authors/search?q=Andy%20Weir`
      );
    });
  });

  describe("getAuthor", () => {
    it("GETs /authors/:asin", async () => {
      ok({});
      await makeClient().getAuthor("B001H6UB6S");
      expect(lastCall()[0]).toBe(`${BASE}/api/authors/B001H6UB6S`);
    });
  });

  describe("getAuthorBooks", () => {
    it("GETs /authors/:asin/books", async () => {
      ok([]);
      await makeClient().getAuthorBooks("B001H6UB6S");
      expect(lastCall()[0]).toBe(`${BASE}/api/authors/B001H6UB6S/books`);
    });
  });

  // ── Series ────────────────────────────────────────────────────────────────

  describe("searchSeries", () => {
    it("encodes query", async () => {
      ok([]);
      await makeClient().searchSeries("Dungeon Crawler Carl");
      expect(lastCall()[0]).toContain("q=Dungeon%20Crawler%20Carl");
    });
  });

  describe("getSeries", () => {
    it("GETs /series/:asin", async () => {
      ok({});
      await makeClient().getSeries("B07CM4FVPZ");
      expect(lastCall()[0]).toBe(`${BASE}/api/series/B07CM4FVPZ`);
    });
  });

  // ── Requests ──────────────────────────────────────────────────────────────

  describe("getRequests", () => {
    it("GETs /requests without page param by default", async () => {
      ok([]);
      await makeClient().getRequests();
      expect(lastCall()[0]).toBe(`${BASE}/api/requests`);
    });

    it("omits page param when page=1", async () => {
      ok([]);
      await makeClient().getRequests(1);
      expect(lastCall()[0]).toBe(`${BASE}/api/requests`);
    });

    it("appends page query param when page > 1", async () => {
      ok([]);
      await makeClient().getRequests(2);
      expect(lastCall()[0]).toBe(`${BASE}/api/requests?page=2`);
    });

    it("omits page param when page=0", async () => {
      ok([]);
      await makeClient().getRequests(0);
      expect(lastCall()[0]).toBe(`${BASE}/api/requests`);
    });
  });

  describe("createRequest", () => {
    it("POSTs asin with autoSearch", async () => {
      ok({});
      await makeClient().createRequest("B08G9PRS1K", false);
      const [, init] = lastCall();
      expect(init.method).toBe("POST");
      expect(init.body).toBe(
        JSON.stringify({ asin: "B08G9PRS1K", autoSearch: false })
      );
    });

    it("defaults autoSearch to true", async () => {
      ok({});
      await makeClient().createRequest("B08G9PRS1K");
      const [, init] = lastCall();
      expect(init.body).toBe(
        JSON.stringify({ asin: "B08G9PRS1K", autoSearch: true })
      );
    });
  });

  describe("getRequest", () => {
    it("GETs /requests/:id", async () => {
      ok({});
      await makeClient().getRequest("req-uuid");
      expect(lastCall()[0]).toBe(`${BASE}/api/requests/req-uuid`);
    });
  });

  describe("deleteRequest", () => {
    it("DELETEs /requests/:id", async () => {
      ok({});
      await makeClient().deleteRequest("req-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/requests/req-uuid`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("manualSearchRequest", () => {
    it("POSTs to /requests/:id/manual-search", async () => {
      ok({});
      await makeClient().manualSearchRequest("req-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/requests/req-uuid/manual-search`);
      expect(init.method).toBe("POST");
    });
  });

  describe("selectTorrent", () => {
    it("POSTs torrentId to /requests/:id/select-torrent", async () => {
      ok({});
      await makeClient().selectTorrent("req-uuid", "torrent-id");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/requests/req-uuid/select-torrent`);
      expect(init.body).toBe(JSON.stringify({ torrentId: "torrent-id" }));
    });
  });

  // ── BookDate ──────────────────────────────────────────────────────────────

  describe("getBookDateRecommendations", () => {
    it("GETs /bookdate/recommendations", async () => {
      ok([]);
      await makeClient().getBookDateRecommendations();
      expect(lastCall()[0]).toBe(`${BASE}/api/bookdate/recommendations`);
    });
  });

  describe("generateBookDateRecommendations", () => {
    it("POSTs to /bookdate/generate", async () => {
      ok([]);
      await makeClient().generateBookDateRecommendations();
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/bookdate/generate`);
      expect(init.method).toBe("POST");
    });
  });

  describe("swipeBookDate", () => {
    it("POSTs recommendationId and action", async () => {
      ok({});
      await makeClient().swipeBookDate("rec-uuid", "right");
      const [, init] = lastCall();
      expect(init.body).toBe(
        JSON.stringify({ recommendationId: "rec-uuid", action: "right" })
      );
    });

    it.each(["left", "right", "up"] as const)(
      "accepts action=%s",
      async (action) => {
        ok({});
        await makeClient().swipeBookDate("rec-uuid", action);
        expect(mockFetch).toHaveBeenCalledOnce();
      }
    );
  });

  describe("undoBookDateSwipe", () => {
    it("POSTs to /bookdate/undo", async () => {
      ok({});
      await makeClient().undoBookDateSwipe();
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/bookdate/undo`);
      expect(init.method).toBe("POST");
    });
  });

  // ── User Preferences ──────────────────────────────────────────────────────

  describe("getWatchedSeries", () => {
    it("GETs /user/watched-series", async () => {
      ok([]);
      await makeClient().getWatchedSeries();
      expect(lastCall()[0]).toBe(`${BASE}/api/user/watched-series`);
    });
  });

  describe("watchSeries", () => {
    it("POSTs seriesAsin and seriesTitle", async () => {
      ok({});
      await makeClient().watchSeries("series-asin", "Dungeon Crawler Carl");
      const [, init] = lastCall();
      expect(init.body).toBe(
        JSON.stringify({
          seriesAsin: "series-asin",
          seriesTitle: "Dungeon Crawler Carl",
        })
      );
    });
  });

  describe("unwatchSeries", () => {
    it("DELETEs /user/watched-series/:id", async () => {
      ok({});
      await makeClient().unwatchSeries("watch-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/user/watched-series/watch-uuid`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("getWatchedAuthors", () => {
    it("GETs /user/watched-authors", async () => {
      ok([]);
      await makeClient().getWatchedAuthors();
      expect(lastCall()[0]).toBe(`${BASE}/api/user/watched-authors`);
    });
  });

  describe("watchAuthor", () => {
    it("POSTs authorAsin and authorName", async () => {
      ok({});
      await makeClient().watchAuthor("author-asin", "Andy Weir");
      const [, init] = lastCall();
      expect(init.body).toBe(
        JSON.stringify({ authorAsin: "author-asin", authorName: "Andy Weir" })
      );
    });
  });

  describe("unwatchAuthor", () => {
    it("DELETEs /user/watched-authors/:id", async () => {
      ok({});
      await makeClient().unwatchAuthor("watch-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/user/watched-authors/watch-uuid`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("getIgnoredAudiobooks", () => {
    it("GETs /user/ignored-audiobooks", async () => {
      ok([]);
      await makeClient().getIgnoredAudiobooks();
      expect(lastCall()[0]).toBe(`${BASE}/api/user/ignored-audiobooks`);
    });
  });

  describe("ignoreAudiobook", () => {
    it("POSTs asin and title", async () => {
      ok({});
      await makeClient().ignoreAudiobook("B08G9PRS1K", "Project Hail Mary");
      const [, init] = lastCall();
      expect(init.body).toBe(
        JSON.stringify({ asin: "B08G9PRS1K", title: "Project Hail Mary" })
      );
    });
  });

  describe("unignoreAudiobook", () => {
    it("DELETEs /user/ignored-audiobooks/:id", async () => {
      ok({});
      await makeClient().unignoreAudiobook("ignored-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/user/ignored-audiobooks/ignored-uuid`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("getApiTokens", () => {
    it("GETs /user/api-tokens", async () => {
      ok([]);
      await makeClient().getApiTokens();
      expect(lastCall()[0]).toBe(`${BASE}/api/user/api-tokens`);
    });
  });

  describe("createApiToken", () => {
    it("POSTs name and expiresAt", async () => {
      ok({});
      await makeClient().createApiToken("My Token", "2027-01-01T00:00:00Z");
      const [, init] = lastCall();
      expect(init.body).toBe(
        JSON.stringify({ name: "My Token", expiresAt: "2027-01-01T00:00:00Z" })
      );
    });

    it("allows omitted expiresAt", async () => {
      ok({});
      await makeClient().createApiToken("No Expiry");
      const [, init] = lastCall();
      expect(JSON.parse(init.body as string)).toMatchObject({ name: "No Expiry" });
    });
  });

  describe("deleteApiToken", () => {
    it("DELETEs /user/api-tokens/:id", async () => {
      ok({});
      await makeClient().deleteApiToken("token-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/user/api-tokens/token-uuid`);
      expect(init.method).toBe("DELETE");
    });
  });

  // ── Admin: Requests ───────────────────────────────────────────────────────

  describe("adminGetRequests", () => {
    it("GETs /admin/requests without params by default", async () => {
      ok([]);
      await makeClient().adminGetRequests();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/requests`);
    });

    it("appends status query param when provided", async () => {
      ok([]);
      await makeClient().adminGetRequests("failed");
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/requests?status=failed`);
    });

    it("appends page query param when page > 1", async () => {
      ok([]);
      await makeClient().adminGetRequests(undefined, 2);
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/requests?page=2`);
    });

    it("appends both status and page when provided", async () => {
      ok([]);
      await makeClient().adminGetRequests("awaiting_search", 2);
      expect(lastCall()[0]).toBe(
        `${BASE}/api/admin/requests?status=awaiting_search&page=2`
      );
    });

    it("omits page param when page=1", async () => {
      ok([]);
      await makeClient().adminGetRequests("failed", 1);
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/requests?status=failed`);
    });

    it("omits page param when page=0", async () => {
      ok([]);
      await makeClient().adminGetRequests("failed", 0);
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/requests?status=failed`);
    });
  });

  describe("adminGetPendingApproval", () => {
    it("GETs /admin/requests/pending-approval", async () => {
      ok([]);
      await makeClient().adminGetPendingApproval();
      expect(lastCall()[0]).toBe(
        `${BASE}/api/admin/requests/pending-approval`
      );
    });
  });

  describe("adminApproveRequest", () => {
    it("POSTs approved=true with reason", async () => {
      ok({});
      await makeClient().adminApproveRequest("req-uuid", true, "Looks good");
      const [, init] = lastCall();
      expect(init.body).toBe(
        JSON.stringify({ approved: true, reason: "Looks good" })
      );
    });

    it("POSTs approved=false without reason", async () => {
      ok({});
      await makeClient().adminApproveRequest("req-uuid", false);
      const [, init] = lastCall();
      expect(JSON.parse(init.body as string).approved).toBe(false);
    });
  });

  describe("adminRetryDownload", () => {
    it("POSTs to /admin/requests/:id/retry-download", async () => {
      ok({});
      await makeClient().adminRetryDownload("req-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/admin/requests/req-uuid/retry-download`);
      expect(init.method).toBe("POST");
    });
  });

  // ── Admin: Users ──────────────────────────────────────────────────────────

  describe("adminGetUsers", () => {
    it("GETs /admin/users", async () => {
      ok([]);
      await makeClient().adminGetUsers();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/users`);
    });
  });

  describe("adminGetPendingUsers", () => {
    it("GETs /admin/users/pending", async () => {
      ok([]);
      await makeClient().adminGetPendingUsers();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/users/pending`);
    });
  });

  describe("adminApproveUser", () => {
    it("POSTs to /admin/users/:id/approve", async () => {
      ok({});
      await makeClient().adminApproveUser("user-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/admin/users/user-uuid/approve`);
      expect(init.method).toBe("POST");
    });
  });

  describe("adminUpdateUser", () => {
    it("PUTs role and permissions", async () => {
      ok({});
      await makeClient().adminUpdateUser("user-uuid", {
        role: "admin",
        permissions: { download_access: true },
      });
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/admin/users/user-uuid`);
      expect(init.method).toBe("PUT");
      expect(JSON.parse(init.body as string)).toEqual({
        role: "admin",
        permissions: { download_access: true },
      });
    });
  });

  describe("adminDeleteUser", () => {
    it("DELETEs /admin/users/:id", async () => {
      ok({});
      await makeClient().adminDeleteUser("user-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/admin/users/user-uuid`);
      expect(init.method).toBe("DELETE");
    });
  });

  // ── Admin: Jobs ───────────────────────────────────────────────────────────

  describe("adminGetJobs", () => {
    it("GETs /admin/jobs", async () => {
      ok([]);
      await makeClient().adminGetJobs();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/jobs`);
    });
  });

  describe("adminTriggerJob", () => {
    it("POSTs to /admin/jobs/:id/trigger", async () => {
      ok({});
      await makeClient().adminTriggerJob("job-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(`${BASE}/api/admin/jobs/job-uuid/trigger`);
      expect(init.method).toBe("POST");
    });
  });

  describe("adminGetActiveDownloads", () => {
    it("GETs /admin/downloads/active", async () => {
      ok([]);
      await makeClient().adminGetActiveDownloads();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/downloads/active`);
    });
  });

  describe("adminGetLogs", () => {
    it("GETs /admin/logs", async () => {
      ok([]);
      await makeClient().adminGetLogs();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/logs`);
    });
  });

  describe("adminGetMetrics", () => {
    it("GETs /admin/metrics", async () => {
      ok({});
      await makeClient().adminGetMetrics();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/metrics`);
    });
  });

  describe("adminPlexScan", () => {
    it("GETs /admin/plex/scan", async () => {
      ok({});
      await makeClient().adminPlexScan();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/plex/scan`);
    });
  });

  // ── Admin: Reported Issues ────────────────────────────────────────────────

  describe("adminGetReportedIssues", () => {
    it("GETs /admin/reported-issues", async () => {
      ok([]);
      await makeClient().adminGetReportedIssues();
      expect(lastCall()[0]).toBe(`${BASE}/api/admin/reported-issues`);
    });
  });

  describe("adminResolveIssue", () => {
    it("POSTs to /admin/reported-issues/:id/resolve", async () => {
      ok({});
      await makeClient().adminResolveIssue("issue-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(
        `${BASE}/api/admin/reported-issues/issue-uuid/resolve`
      );
      expect(init.method).toBe("POST");
    });
  });

  describe("adminReplaceIssue", () => {
    it("POSTs to /admin/reported-issues/:id/replace", async () => {
      ok({});
      await makeClient().adminReplaceIssue("issue-uuid");
      const [url, init] = lastCall();
      expect(url).toBe(
        `${BASE}/api/admin/reported-issues/issue-uuid/replace`
      );
      expect(init.method).toBe("POST");
    });
  });
});
