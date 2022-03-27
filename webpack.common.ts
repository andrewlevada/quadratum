import fs from "fs";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import FileManagerPlugin from "filemanager-webpack-plugin";
import SimpleProgressWebpackPlugin from "simple-progress-webpack-plugin";
import { DefinePlugin } from "webpack";
import router from "./router";
import paths from "./webpack.paths";

const pages = router.map(config => ({
    ...config,
    keyName: config.source.replace(/\//g, "sl").replace(/-/g, ""),
    component: fs.readFileSync(`${paths.pages}${config.source}/index.ts`).toString().match(/@customElement\("([^"]+)"\)/)![1],
    description: "",
}));

if (!process.env.NODE_ENV)
    process.env.NODE_ENV = "development";

for (let i = 0; i < pages.length; i++)
    pages[i].outputPath = pages[i].outputPath === undefined ? pages[i].source : pages[i].outputPath;

const config = {
    entry: Object.fromEntries(pages.map(page => [page.keyName, `${paths.pages}${page.source}/index.ts`])),

    output: {
        path: `${paths.build}`,
        publicPath: "/",
        filename: "bundles/[name].[contenthash].js",
    },

    plugins: [
        ...pages.map(page => new HtmlWebpackPlugin({
            template: `${paths.pages}/base.html`,
            templateParameters: {
                title: page.title,
                description: page.description,
                component: `<${page.component}></${page.component}>`,
            },
            filename: `.${page.outputPath}/index.html`,
            chunks: [page.keyName],
        })),
        new DefinePlugin({
            PRODUCTION: process.env.NODE_ENV.startsWith("production"),
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
        new FileManagerPlugin({
            runTasksInSeries: true,
            events: {
                onStart: {
                    delete: [`${paths.build}/`],
                    mkdir: [`${paths.build}/`],
                },
                onEnd: {
                    copy: [
                        { source: `${paths.src}/assets/to-root`, destination: `${paths.build}/` },
                    ],
                },
            },
        }),
    ],

    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            use: [{
                loader: "esbuild-loader",
                options: {
                    loader: "ts",
                    target: "es6",
                },
            }],
        }, {
            test: /.(scss|css)$/,
            use: [
                { loader: "css-loader", options: { modules: "global", importLoaders: 1 }},
                { loader: "sass-loader" },
            ],
        }, {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: "asset/resource",
        }, {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
        }],
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js", ".css", ".scss"],
        plugins: [new TsconfigPathsPlugin()],
    },
};

// This plugin brakes stats.json
if (!process.env.NODE_ENV.endsWith("stats"))
    config.plugins.push(new SimpleProgressWebpackPlugin({}));

export default config;
