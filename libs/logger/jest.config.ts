// jest.config.js
const { readFileSync } = require("fs");
const { exclude, ...swcJestConfig } = JSON.parse(
  readFileSync(__dirname + "/.swcrc", "utf-8"),
);
swcJestConfig.swcrc = swcJestConfig.swcrc ?? false;

module.exports = {
  displayName: "@helix/logger",
  preset: "../../../jest.preset.js",
  transform: {
    "^.+\\.[tj]s$": ["@swc/jest", swcJestConfig],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  testEnvironment: "node",
  coverageDirectory: "../../../coverage/libs/shared/logger",
};
