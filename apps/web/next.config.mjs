import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Compile ESM source for Next; the API continues to consume the package's CommonJS build.
    config.resolve.alias["@businessos/domain"] = fileURLToPath(new URL("../../packages/domain/src/index.ts", import.meta.url));
    return config;
  },
};

export default nextConfig;
