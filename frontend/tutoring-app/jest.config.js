module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  transform: { "^.+\\.(ts|tsx)$": ["babel-jest", { presets: ["babel-preset-expo"] }] },
};
