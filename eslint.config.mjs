import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": "off",
            "@typescript-eslint/no-explicit-any": "off"
        }
    },
    {
        files: ["libs/**/*.{ts,tsx,js,jsx}"],
        rules: {
            // Keep libs dependency-free: only allow core imports from other Helix libs.
            "no-restricted-imports": [
                "error",
                {
                    "patterns": [
                        {
                            "group": ["@helix-ai/(?!core).*"],
                            "message": "Libraries must not depend on other Helix libraries; use @helix-ai/core for shared helpers."
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
