import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadDataCaches } from "./data.js";
import { registerMasterResource } from "./resources/master.js";
import { registerPaletteResources } from "./resources/palettes.js";
import { registerStyleResources } from "./resources/styles.js";
import { registerAuditHtml } from "./tools/audit_html.js";
import { registerGenerateDesignSystem } from "./tools/generate_design_system.js";
import { registerGetStackGuidelines } from "./tools/get_stack_guidelines.js";
import { registerRecommendPalette } from "./tools/recommend_palette.js";
import { registerSearchStyles } from "./tools/search_styles.js";

const SERVER_NAME = "uipro-mcp";
const SERVER_VERSION = "0.1.0";

/**
 * Creates the UI/UX Pro Max MCP server (tools + resources registered).
 * Call `loadDataCaches()` before connecting if you need CSV-backed resources
 * in the same process (done automatically by {@link startStdioServer}).
 */
export function createMcpServer(): McpServer {
  loadDataCaches();
  const mcp = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: "UI/UX Pro Max design intelligence: styles, palettes, design systems, stack guidelines." },
  );
  registerGenerateDesignSystem(mcp);
  registerSearchStyles(mcp);
  registerRecommendPalette(mcp);
  registerGetStackGuidelines(mcp);
  registerAuditHtml(mcp);
  registerStyleResources(mcp);
  registerPaletteResources(mcp);
  registerMasterResource(mcp);
  return mcp;
}

export async function startStdioServer(): Promise<void> {
  const mcp = createMcpServer();
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}
