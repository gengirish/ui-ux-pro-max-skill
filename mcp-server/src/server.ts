import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadDataCaches } from "./data.js";
import { registerAuditHtml } from "./tools/audit_html.js";
import { registerGenerateDesignSystem } from "./tools/generate_design_system.js";
import { registerGetStackGuidelines } from "./tools/get_stack_guidelines.js";
import { registerRecommendPalette } from "./tools/recommend_palette.js";
import { registerSearchStyles } from "./tools/search_styles.js";

const SERVER_NAME = "uipro-mcp";
const SERVER_VERSION = "0.1.0";

export function createMcpServer(): McpServer {
  loadDataCaches();
  const mcp = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: "UI/UX Pro Max design intelligence (resource URIs in follow-up commit)." },
  );
  registerGenerateDesignSystem(mcp);
  registerSearchStyles(mcp);
  registerRecommendPalette(mcp);
  registerGetStackGuidelines(mcp);
  registerAuditHtml(mcp);
  return mcp;
}

export async function startStdioServer(): Promise<void> {
  const mcp = createMcpServer();
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}
