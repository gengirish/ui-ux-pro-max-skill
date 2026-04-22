import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadDataCaches } from "./data.js";

export function createMcpServer(): McpServer {
  loadDataCaches();
  return new McpServer(
    { name: "uipro-mcp", version: "0.1.0" },
    { instructions: "UI/UX Pro Max MCP (tools register in the next commit)." },
  );
}

export async function startStdioServer(): Promise<void> {
  const mcp = createMcpServer();
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}
