import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getBridgeEnv, runSearchScript } from "../bridge.js";

const moodSchema = z.enum([
  "calm",
  "energetic",
  "luxury",
  "trustworthy",
  "playful",
]);

const input = {
  industry: z.string().min(1),
  mood: moodSchema.optional(),
};

export function registerRecommendPalette(mcp: McpServer): void {
  mcp.registerTool(
    "recommend_palette",
    {
      description: "Search color/palette domain for an industry and optional mood.",
      inputSchema: input,
    },
    async (args) => {
      const q = [args.industry, args.mood].filter(Boolean).join(" ");
      const env = getBridgeEnv();
      const result = await runSearchScript(
        [q, "--domain", "color", "--json"],
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
