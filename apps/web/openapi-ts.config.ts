import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: process.env.OPENAPI_URL ?? "http://localhost:8000/api-json",
  output: "./lib/api/generated",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "@hey-api/client-next",
      runtimeConfigPath: "./lib/api/hey-api.ts",
    },
    {
      name: "@tanstack/react-query",
      queryKeys: true,
      queryOptions: true,
      mutationOptions: true,
    },
  ],
});
