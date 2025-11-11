import nextPlugin from "@next/eslint-plugin-next";
import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.mjs";

const config = [
    ...baseConfig,
    ...nx.configs["flat/react-typescript"],
    nextPlugin.configs["core-web-vitals"],
    {
        ignores: [
            ".next/**/*",
            "**/out-tsc"
        ]
    }
];

export default config;
