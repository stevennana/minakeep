import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const port = process.env.SMOKE_PORT ?? "3200";
const host = "127.0.0.1";
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the server is ready.
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

await run(npmBin, ["run", "db:prepare"]);

if (!existsSync(".next/BUILD_ID")) {
  await run(npmBin, ["run", "build"]);
}

const child = spawn(npmBin, ["run", "start", "--", "--hostname", host, "--port", port], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: port
  }
});

try {
  await waitForHealth(`http://${host}:${port}/api/health`);
} finally {
  child.kill("SIGTERM");
}
