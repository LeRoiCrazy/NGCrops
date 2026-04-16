import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const tailwindcssPath = require.resolve("tailwindcss");

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: tailwindcssPath,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      tailwindcss: tailwindcssPath,
    };
    return config;
  },
};

export default nextConfig;
