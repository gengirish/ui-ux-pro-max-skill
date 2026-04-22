#!/usr/bin/env node
import { startStdioServer } from "./server.js";

function main(): void {
  const argv = process.argv.slice(2);
  if (argv.includes("--http")) {
    console.error("HTTP transport coming in a follow-up PR");
    process.exit(1);
  }
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "uipro-mcp — UI/UX Pro Max MCP server (stdio by default)\n\n  --http   (not implemented; exits 1)\n  -h, --help\n",
    );
    process.exit(0);
  }
  startStdioServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
