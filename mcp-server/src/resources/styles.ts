import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { getStyleById, listStyleIds } from "../data.js";

export function registerStyleResources(mcp: McpServer): void {
  const template = new ResourceTemplate("uipro://styles/{id}", {
    list: async () => {
      const ids = listStyleIds();
      return {
        resources: ids.map((id) => ({
          uri: `uipro://styles/${id}`,
          name: `Style row ${id}`,
        })),
      };
    },
  });
  mcp.registerResource("styles-row", template, { mimeType: "application/json" }, (_uri, variables) => {
    const id = Number.parseInt(String(variables["id"] ?? ""), 10);
    if (!Number.isFinite(id) || id < 1) {
      return {
        contents: [
          {
            uri: _uri.toString(),
            mimeType: "text/plain",
            text: JSON.stringify({ error: "invalid_id", id: variables["id"] }),
          },
        ],
      };
    }
    const row = getStyleById(id);
    if (!row) {
      return {
        contents: [
          {
            uri: _uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify({ error: "not_found", id }),
          },
        ],
      };
    }
    return {
      contents: [
        {
          uri: _uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(row, null, 2),
        },
      ],
    };
  });
}
