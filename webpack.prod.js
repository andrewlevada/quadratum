const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const { DuplicatesPlugin } = require("inspectpack/plugin");
const { mergeWithRules } = require("webpack-merge");
const common = require("./webpack.common");
const paths = require("./webpack.paths");

const config = mergeWithRules({
    module: {
        rules: {
            test: "match",
            use: {
                loader: "match",
                options: "replace",
            },
        },
    },
})(common, {
    mode: "production",

    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            // use: [{ loader: "minify-html-literals-loader" }],
        }, {
            test: /.(scss|css)$/,
            use: [{
                loader: "lit-css-loader",
                options: { uglify: true },
            }],
        }],
    },

    devtool: "source-map",
    plugins: [
        new FileManagerPlugin({
            events: {
                onEnd: {
                    archive: [
                        { source: `${paths.build}/`, destination: `${paths.build}/build.zip` },
                    ],
                },
            },
        }),
        new SentryWebpackPlugin({
            // sentry-cli configuration - can also be done directly through sentry-cli
            // see https://docs.sentry.io/product/cli/configuration/ for details
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "andrew-levada",
            project: "quadratum",

            // other SentryWebpackPlugin configuration
            include: "/build",
            ignore: ["node_modules", "webpack.config.js", ],
        }),
    ],

    optimization: {
        minimize: true,

        minimizer: [
            new TerserPlugin({
                terserOptions: { format: { comments: false } },
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ],

        runtimeChunk: "single",
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                },
            },
        },
    },
});

// This plugin brakes stats.json
if (!process.env.NODE_ENV.endsWith("stats"))
    config.plugins.push(new DuplicatesPlugin());

module.exports = config;
