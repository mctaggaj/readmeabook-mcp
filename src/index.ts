#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createRequire } from "module";
import { ReadMeABookClient } from "./client.js";
import { toolDefinitions, toolHandlers } from "./tools.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = process.env.READMEABOOK_URL;
const API_TOKEN = process.env.READMEABOOK_TOKEN;

if (!BASE_URL) {
  console.error("Error: READMEABOOK_URL environment variable is required.");
  process.exit(1);
}

if (!API_TOKEN) {
  console.error("Error: READMEABOOK_TOKEN environment variable is required.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Version — read from package.json so there is a single source of truth
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const client = new ReadMeABookClient({
  baseUrl: BASE_URL,
  apiToken: API_TOKEN,
});

const server = new Server(
  { name: "readmeabook-mcp", version },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  const handler = toolHandlers[name];
  if (!handler) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const result = await handler(client, args as Record<string, unknown>);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`ReadMeABook MCP v${version} running on stdio → ${BASE_URL}`);
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
