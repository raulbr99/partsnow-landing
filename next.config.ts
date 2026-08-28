import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Monorepo parent has its own lockfile; keep tracing scoped to this app on Vercel.
  outputFileTracingRoot: appRoot,
};

export default nextConfig;
