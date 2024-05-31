const path = require("path-browserify");
const url = require("url");

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            console.log('Applying custom Webpack configuration...');
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                "path": require.resolve("path-browserify"),
                "url": require.resolve("url"),
                "fs": false
            };
            console.log('Webpack configuration after modification:', webpackConfig.resolve.fallback);
            return webpackConfig;
        },
    },
};
