module.exports = function(api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@": "./",
                        "@components": "./components",
                        "@context": "./context",
                        "@screens": "./screens",
                        "@assets": "./assets",
                        "@utils": "./utils",
                    },
                },
            ],
            "react-native-reanimated/plugin",
        ],
    };
};
