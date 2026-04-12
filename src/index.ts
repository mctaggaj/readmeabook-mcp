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
const USERNAME = process.env.READMEABOOK_USERNAME;
const PASSWORD = process.env.READMEABOOK_PASSWORD;

if (!BASE_URL) {
  console.error("Error: READMEABOOK_URL environment variable is required.");
  process.exit(1);
}

if (!USERNAME || !PASSWORD) {
  console.error("Error: READMEABOOK_USERNAME and READMEABOOK_PASSWORD environment variables are required.");
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
  username: USERNAME,
  password: PASSWORD,
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
