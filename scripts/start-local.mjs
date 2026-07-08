#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local")
};

const apiKey = env.OPENWEATHER_API_KEY?.trim();

if (!apiKey) {
  console.error("OPENWEATHER_API_KEY is required.");
  console.error('Add it to .env.local, for example: OPENWEATHER_API_KEY="your_api_key_here"');
  process.exit(1);
}

run("yarn", ["build"], env);
run("mcp-inspector", ["-e", `OPENWEATHER_API_KEY=${apiKey}`, "node", "dist/index.js"], env);

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return values;
      }

      const equalsIndex = trimmed.indexOf("=");

      if (equalsIndex === -1) {
        return values;
      }

      const key = trimmed.slice(0, equalsIndex).trim().replace(/^export\s+/, "");
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");

      if (key) {
        values[key] = value;
      }

      return values;
    }, {});
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    env,
    stdio: "inherit",
    shell: false
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
