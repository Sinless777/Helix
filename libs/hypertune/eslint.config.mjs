import baseConfig from "../../eslint.config.mjs";

export default [
    ...baseConfig,
    {
        "files": [
            "**/*.json"
        ],
        "rules": {
            "@nx/dependency-checks": [
                "error",
                {
                    "ignoredFiles": [
                        "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"
                    ]
                }
            ],
            "@typescript-eslint/no-undef": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslinbt/no-explicit-any": "off"
        },
        "languageOptions": {
            "parser": (await import('jsonc-eslint-parser'))
        }
    },
    {
        ignores: [
            "**/out-tsc"
        ]
    }
];
