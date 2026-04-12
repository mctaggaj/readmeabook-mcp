import type {
  ApiError,
  HealthResponse,
  RequestStatus,
  SwipeAction,
  UserPermissions,
  UserRole,
  VersionResponse,
} from "./types.js";

export interface ReadMeABookConfig {
  baseUrl: string;
  /** API token auth (limited to allowlisted endpoints) */
  apiToken?: string;
  /** Username/password auth — obtains a JWT that bypasses the token allowlist */
  username?: string;
  password?: string;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export class ReadMeABookClient {
  private readonly baseUrl: string;
  private readonly apiToken: string | undefined;
  private readonly username: string | undefined;
  private readonly password: string | undefined;
  private jwtToken: string | null = null;

  constructor(config: ReadMeABookConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiToken = config.apiToken;
    this.username = config.username;
    this.password = config.password;
  }

  private async login(): Promise<void> {
    const url = `${this.baseUrl}/api/auth/admin/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.username, password: this.password }),
    });
    if (!response.ok) {
      throw new Error(`Login failed: HTTP ${response.status}`);
    }
    const body = (await response.json()) as LoginResponse;
    this.jwtToken = body.accessToken;
  }

  private async request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    // Lazy login on first credentialed request
    if (this.username && !this.jwtToken) {
      await this.login();
    }

    const token = this.jwtToken ?? this.apiToken;
    const url = `${this.baseUrl}/api${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // On 401 with JWT auth, re-login once and retry
    if (response.status === 401 && this.username && !isRetry) {
      this.jwtToken = null;
      await this.login();
      return this.request<T>(path, options, true);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const body = (await response.json()) as ApiError;
        errorMessage = body.error ?? body.message ?? errorMessage;
      } catch {
        // ignore parse error — raw status message is sufficient
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // --- System ---

  getHealth() {
    return this.request<HealthResponse>("/health");
  }

  getVersion() {
    return this.request<VersionResponse>("/version");
  }

  // --- Audiobooks ---

  searchAudiobooks(query: string, page = 1) {
    return this.request<unknown>(
      `/audiobooks/search?q=${encodeURIComponent(query)}&page=${page}`
    );
  }

  getAudiobook(asin: string) {
    return this.request<unknown>(`/audiobooks/${asin}`);
  }

  getPopularAudiobooks() {
    return this.request<unknown>("/audiobooks/popular");
  }

  getNewReleases() {
    return this.request<unknown>("/audiobooks/new-releases");
  }

  getAudiobookDownloadStatus(asin: string) {
    return this.request<unknown>(`/audiobooks/${asin}/download-status`);
  }

  searchTorrents(asin: string, title: string, author: string) {
    return this.request<unknown>("/audiobooks/search-torrents", {
      method: "POST",
      body: JSON.stringify({ asin, title, author }),
    });
  }

  // --- Authors ---

  searchAuthors(query: string) {
    return this.request<unknown>(`/authors/search?q=${encodeURIComponent(query)}`);
  }

  getAuthor(asin: string) {
    return this.request<unknown>(`/authors/${asin}`);
  }

  getAuthorBooks(asin: string) {
    return this.request<unknown>(`/authors/${asin}/books`);
  }

  // --- Series ---

  searchSeries(query: string) {
    return this.request<unknown>(`/series/search?q=${encodeURIComponent(query)}`);
  }

  getSeries(asin: string) {
    return this.request<unknown>(`/series/${asin}`);
  }

  // --- Requests ---

  getRequests() {
    return this.request<unknown>("/requests");
  }

  createRequest(asin: string, autoSearch = true) {
    return this.request<unknown>("/requests", {
      method: "POST",
      body: JSON.stringify({ asin, autoSearch }),
    });
  }

  getRequest(id: string) {
    return this.request<unknown>(`/requests/${id}`);
  }

  deleteRequest(id: string) {
    return this.request<unknown>(`/requests/${id}`, { method: "DELETE" });
  }

  manualSearchRequest(id: string) {
    return this.request<unknown>(`/requests/${id}/manual-search`, { method: "POST" });
  }

  selectTorrent(requestId: string, torrentId: string) {
    return this.request<unknown>(`/requests/${requestId}/select-torrent`, {
      method: "POST",
      body: JSON.stringify({ torrentId }),
    });
  }

  // --- BookDate ---

  getBookDateRecommendations() {
    return this.request<unknown>("/bookdate/recommendations");
  }

  generateBookDateRecommendations() {
    return this.request<unknown>("/bookdate/generate", { method: "POST" });
  }

  swipeBookDate(recommendationId: string, action: SwipeAction) {
    return this.request<unknown>("/bookdate/swipe", {
      method: "POST",
      body: JSON.stringify({ recommendationId, action }),
    });
  }

  undoBookDateSwipe() {
    return this.request<unknown>("/bookdate/undo", { method: "POST" });
  }

  // --- User preferences ---

  getWatchedSeries() {
    return this.request<unknown>("/user/watched-series");
  }

  watchSeries(seriesAsin: string, seriesTitle: string) {
    return this.request<unknown>("/user/watched-series", {
      method: "POST",
      body: JSON.stringify({ seriesAsin, seriesTitle }),
    });
  }

  unwatchSeries(id: string) {
    return this.request<unknown>(`/user/watched-series/${id}`, { method: "DELETE" });
  }

  getWatchedAuthors() {
    return this.request<unknown>("/user/watched-authors");
  }

  watchAuthor(authorAsin: string, authorName: string) {
    return this.request<unknown>("/user/watched-authors", {
      method: "POST",
      body: JSON.stringify({ authorAsin, authorName }),
    });
  }

  unwatchAuthor(id: string) {
    return this.request<unknown>(`/user/watched-authors/${id}`, { method: "DELETE" });
  }

  getIgnoredAudiobooks() {
    return this.request<unknown>("/user/ignored-audiobooks");
  }

  ignoreAudiobook(asin: string, title: string) {
    return this.request<unknown>("/user/ignored-audiobooks", {
      method: "POST",
      body: JSON.stringify({ asin, title }),
    });
  }

  unignoreAudiobook(id: string) {
    return this.request<unknown>(`/user/ignored-audiobooks/${id}`, { method: "DELETE" });
  }

  getApiTokens() {
    return this.request<unknown>("/user/api-tokens");
  }

  createApiToken(name: string, expiresAt?: string) {
    return this.request<unknown>("/user/api-tokens", {
      method: "POST",
      body: JSON.stringify({ name, expiresAt }),
    });
  }

  deleteApiToken(id: string) {
    return this.request<unknown>(`/user/api-tokens/${id}`, { method: "DELETE" });
  }

  // --- Admin: Requests ---

  adminGetRequests(status?: RequestStatus) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.request<unknown>(`/admin/requests${qs}`);
  }

  adminGetPendingApproval() {
    return this.request<unknown>("/admin/requests/pending-approval");
  }

  adminApproveRequest(id: string, approved: boolean, reason?: string) {
    return this.request<unknown>(`/admin/requests/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ approved, reason }),
    });
  }

  adminRetryDownload(id: string) {
    return this.request<unknown>(`/admin/requests/${id}/retry-download`, { method: "POST" });
  }

  // --- Admin: Users ---

  adminGetUsers() {
    return this.request<unknown>("/admin/users");
  }

  adminGetPendingUsers() {
    return this.request<unknown>("/admin/users/pending");
  }

  adminApproveUser(id: string) {
    return this.request<unknown>(`/admin/users/${id}/approve`, { method: "POST" });
  }

  adminUpdateUser(id: string, updates: { role?: UserRole; permissions?: UserPermissions }) {
    return this.request<unknown>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  adminDeleteUser(id: string) {
    return this.request<unknown>(`/admin/users/${id}`, { method: "DELETE" });
  }

  // --- Admin: Jobs ---

  adminGetJobs() {
    return this.request<unknown>("/admin/jobs");
  }

  adminTriggerJob(id: string) {
    return this.request<unknown>(`/admin/jobs/${id}/trigger`, { method: "POST" });
  }

  adminGetActiveDownloads() {
    return this.request<unknown>("/admin/downloads/active");
  }

  adminGetLogs() {
    return this.request<unknown>("/admin/logs");
  }

  adminGetMetrics() {
    return this.request<unknown>("/admin/metrics");
  }

  adminPlexScan() {
    return this.request<unknown>("/admin/plex/scan");
  }

  // --- Admin: Reported Issues ---

  adminGetReportedIssues() {
    return this.request<unknown>("/admin/reported-issues");
  }

  adminResolveIssue(id: string) {
    return this.request<unknown>(`/admin/reported-issues/${id}/resolve`, { method: "POST" });
  }

  adminReplaceIssue(id: string) {
    return this.request<unknown>(`/admin/reported-issues/${id}/replace`, { method: "POST" });
  }
}
