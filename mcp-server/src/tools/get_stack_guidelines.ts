import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getBridgeEnv, runSearchScript } from "../bridge.js";
import { SUPPORTED_STACKS, stackSchema } from "./stacks.js";

const input = {
  stack: stackSchema,
  query: z.string().optional(),
};

export function registerGetStackGuidelines(mcp: McpServer): void {
  mcp.registerTool(
    "get_stack_guidelines",
    {
      description: `Stack-specific UI guidelines. Stacks: ${SUPPORTED_STACKS.join(", ")}`,
      inputSchema: input,
    },
    async (args) => {
      const q = args.query?.length ? args.query : args.stack;
      const env = getBridgeEnv();
      const result = await runSearchScript(
        [q, "--stack", args.stack, "--json"],
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
