import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const webFiles = ["apps/web/**/*.{js,jsx,mjs,ts,tsx,mts,cts}"];

const nextWebConfig = nextVitals.flatMap((config) => {
  if (config.ignores) {
    return [];
  }

  return [
    {
      ...config,
      files: config.files?.map((pattern) => `apps/web/${pattern}`) ?? webFiles,
    },
  ];
});

export default defineConfig([
  ...nextTypeScript,
  ...nextWebConfig,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  prettier,
  globalIgnores([
    "**/.next/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/dist/**",
    "apps/web/public/widget/**",
    "**/node_modules/**",
    "**/next-env.d.ts",
  ]),
]);
