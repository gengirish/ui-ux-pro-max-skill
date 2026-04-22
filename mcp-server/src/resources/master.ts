import fs from "node:fs";
import path from "node:path";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const URI = "uipro://master-design-system";

export function registerMasterResource(mcp: McpServer): void {
  mcp.registerResource(
    "master-design-system",
    URI,
    {
      description:
        "MASTER.md from design-system/ when present (from `uipro init` / --persist).",
      mimeType: "text/markdown",
    },
    (uri) => {
      const masterPath = path.join(process.cwd(), "design-system", "MASTER.md");
      if (!fs.existsSync(masterPath)) {
        return {
          contents: [
            {
              uri: uri.toString(),
              mimeType: "text/plain",
              text: JSON.stringify(
                {
                  error: "not_found",
                  path: masterPath,
                  hint: "Run `uipro init` (or generate with persistence) to create design-system/MASTER.md in the process working directory.",
                },
                null,
                2,
              ),
            },
          ],
        };
      }
      const text = fs.readFileSync(masterPath, "utf-8");
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "text/markdown",
            text,
          },
        ],
      };
    },
  );
}
