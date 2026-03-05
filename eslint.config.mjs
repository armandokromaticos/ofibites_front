import tseslint from "@typescript-eslint/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "@typescript-eslint": tseslint,
    },
    rules: {
      // No console.log (allow warn and error)
      "no-console": ["error", { allow: ["warn", "error"] }],

      // Unused vars (allow _ prefix)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // No unused expressions
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: false,
          allowTaggedTemplates: false,
          allowTernary: false,
        },
      ],

      // Quotes and semicolons
      "quotes": ["error", "double"],
      "semi": ["error", "always"],

      // Max line length
      "max-len": [
        "error",
        {
          code: 105,
          tabWidth: 2,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],

      // JSX formatting
      "react/jsx-indent": ["error", 2],
      "react/jsx-wrap-multilines": "error",

      // Import sorting
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React and Next.js imports
            ["^react", "^next"],
            // External packages
            ["^@?\\w"],
            // Internal imports (aliases)
            [
              "^@/libs",
              "^@/domain",
              "^@/shared",
              "^@/types",
              "^@/app",
            ],
            // Parent imports
            ["^\\.\\."],
            // Sibling imports
            ["^\\."],
            // Style imports
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
]);

export default eslintConfig;
