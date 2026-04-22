import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getBridgeEnv, runSearchScript } from "../bridge.js";

const input = {
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(3),
};

export function registerSearchStyles(mcp: McpServer): void {
  mcp.registerTool(
    "search_styles",
    {
      description:
        "Search the style domain (BM25) and return results as JSON.",
      inputSchema: input,
    },
    async (args) => {
      const env = getBridgeEnv();
      const result = await runSearchScript(
        [args.query, "--domain", "style", "--max-results", String(args.limit), "--json"],
        env,
      );
      if (!result.ok) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: result }, null, 2) },
          ],
          isError: true,
        };
      }
      try {
        const data = JSON.parse(result.stdout) as unknown;
        return {
          content: [
            { type: "text", text: JSON.stringify(data, null, 2) },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { error: "invalid_json", raw: result.stdout },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );
}
