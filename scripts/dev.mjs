// Starts `next dev`, choosing the bundler by platform.
//
// Turbopack does not pick up `images.loaderFile` on Windows: every <Image>
// then throws 'Image with src "..." is missing "loader" prop' and each page
// renders a 500. macOS and Linux are unaffected, which is why CI and Vercel
// builds are fine. So Windows gets webpack and everyone else keeps Turbopack's
// speed. Drop this wrapper once the upstream bug is fixed.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const useWebpack = process.platform === "win32";
const args = [
  "dev",
  useWebpack ? "--webpack" : "--turbopack",
  ...process.argv.slice(2),
];

console.log(
  `> next ${args.join(" ")}  (${useWebpack ? "webpack: Turbopack breaks images.loaderFile on Windows" : "turbopack"})`,
);

// Resolve Next's own CLI entry and run it with this Node binary: no shell, so
// there is nothing to quote and no platform-specific .cmd shim to find.
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, ...args], { stdio: "inherit" });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
