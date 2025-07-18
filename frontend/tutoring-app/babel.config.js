module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // jeśli używasz Expo
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./", // <- to jest kluczowe!
            "@components": "./components",
            "@context": "./context",
            "@screens": "./screens",
            "@assets": "./assets",
            "@utils": "./utils",
          },
        },
      ],
    ],
  };
};
