import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(thisDir, "..");
const entry = path.join(packageRoot, "dist", "index.js");

test("MCP stdio: tools, resources, and one tool call (audit stub)", async () => {
  const transport = new StdioClientTransport({
    command: "node",
    args: [entry],
    stderr: "pipe",
  });
  const client = new Client(
    { name: "uipro-mcp-smoke", version: "0.0.0" },
    { capabilities: {} },
  );
  await client.connect(transport);
  const tools = await client.listTools();
  assert.ok(
    (tools.tools?.length ?? 0) >= 4,
    `expected >=4 tools, got ${tools.tools?.length}`,
  );
  const res = await client.listResources();
  const templ = await client.listResourceTemplates();
  const nRes = res.resources?.length ?? 0;
  const nTempl = templ.resourceTemplates?.length ?? 0;
  assert.ok(
    nRes + nTempl >= 3,
    `expected >=3 total resources+templates, got static ${nRes} + templates ${nTempl}`,
  );
  const call = await client.callTool({
    name: "audit_html",
    arguments: { html: "<div>x</div>", severity_threshold: "MEDIUM" },
  });
  const text = call.content?.find((c) => c.type === "text");
  assert.ok(text && text.type === "text" && "text" in text);
  if (text && text.type === "text" && "text" in text) {
    const body = JSON.parse(text.text as string) as { status?: string };
    assert.equal(body.status, "stub");
  }
  await transport.close();
});
