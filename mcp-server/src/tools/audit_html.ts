import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const severitySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const input = {
  html: z.string().min(1),
  severity_threshold: severitySchema.optional().default("MEDIUM"),
};

// TODO: Delegate to `uipro` CLI / shared audit when feat/cli-commands lands; return real violations.
export function registerAuditHtml(mcp: McpServer): void {
  mcp.registerTool(
    "audit_html",
    {
      description:
        "HTML/UI audit (stub in this release — see tool output note).",
      inputSchema: input,
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "stub",
              violations: [],
              note: "Full audit is implemented by uipro-cli in a parallel PR; the MCP server will delegate to that CLI in a follow-up.",
            },
            null,
            2,
          ),
        },
      ],
    }),
  );
}
