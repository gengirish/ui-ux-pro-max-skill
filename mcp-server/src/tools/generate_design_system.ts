import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getBridgeEnv, runSearchScript } from "../bridge.js";

const designFormatSchema = z.enum(["ascii", "markdown", "json"]);

const input = {
  prompt: z
    .string()
    .min(3)
    .describe(
      "Describe the product, e.g. 'beauty spa landing page'",
    ),
  project_name: z.string().optional(),
  format: designFormatSchema
    .default("json")
    .describe(
      "Output shape. 'json' wraps markdown output in a JSON object (Python CLI only supports ascii|markdown).",
    ),
  stack: z
    .string()
    .optional()
    .describe(
      "react, nextjs, vue, svelte, astro, swiftui, react-native, flutter, html-tailwind, shadcn, jetpack-compose, threejs, etc. — appended to the query for context",
    ),
};

export function registerGenerateDesignSystem(mcp: McpServer): void {
  mcp.registerTool(
    "generate_design_system",
    {
      description:
        "Generate a complete design system recommendation from a product prompt (via search.py --design-system).",
      inputSchema: input,
    },
    async (args) => {
      const env = getBridgeEnv();
      let text = args.prompt;
      if (args.stack?.length) {
        text = `${text} (stack: ${args.stack})`;
      }
      const pyFormat = args.format === "json" ? "markdown" : args.format;
      const cli: string[] = [text, "--design-system", "-f", pyFormat];
      if (args.project_name?.length) {
        cli.push("-p", args.project_name);
      }
      const result = await runSearchScript(cli, env);
      if (!result.ok) {
        if (result.code === "PYTHON_NOT_FOUND") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: result.code,
                    message: result.message,
                    hint: result.hint,
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: result.code,
                  message: result.message,
                  hint: result.hint,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
      let out = result.stdout;
      if (args.format === "json") {
        out = JSON.stringify(
          { format: "json", text: result.stdout },
          null,
          2,
        );
      }
      return {
        content: [{ type: "text", text: out }],
      };
    },
  );
}
