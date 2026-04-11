import { beforeEach, describe, expect, it, vi } from "vitest";
import { toolDefinitions, toolHandlers } from "../tools.js";
import type { ReadMeABookClient } from "../client.js";

// ---------------------------------------------------------------------------
// Mock client — only the methods used by the working tool handlers
// ---------------------------------------------------------------------------

function makeClient(): ReadMeABookClient {
  return {
    getHealth: vi.fn().mockResolvedValue({ status: "ok" }),
    getVersion: vi.fn().mockResolvedValue({ version: "1.1.7" }),
    searchAudiobooks: vi.fn().mockResolvedValue([]),
    getAudiobook: vi.fn().mockResolvedValue({}),
    getPopularAudiobooks: vi.fn().mockResolvedValue([]),
    getNewReleases: vi.fn().mockResolvedValue([]),
    getRequests: vi.fn().mockResolvedValue([]),
    adminGetMetrics: vi.fn().mockResolvedValue({}),
    adminGetActiveDownloads: vi.fn().mockResolvedValue([]),
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

  it("get_requests delegates to client", async () => {
    await toolHandlers.get_requests(client, {});
    expect(client.getRequests).toHaveBeenCalledOnce();
  });

  it("admin_get_metrics delegates to client", async () => {
    await toolHandlers.admin_get_metrics(client, {});
    expect(client.adminGetMetrics).toHaveBeenCalledOnce();
  });

  it("admin_get_active_downloads delegates to client", async () => {
    await toolHandlers.admin_get_active_downloads(client, {});
    expect(client.adminGetActiveDownloads).toHaveBeenCalledOnce();
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
