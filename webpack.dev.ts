import { merge } from "webpack-merge";
import paths from "./webpack.paths";
import common from "./webpack.common";
import { Configuration } from "webpack";
import "webpack-dev-server";

const config: Configuration = merge<any>(common, {
    mode: "development",

    devServer: {
        static: { directory: paths.build },
        compress: true,
        host: "0.0.0.0", // Not localhost to be able to connect from other device in local network
        port: 2797,
        hot: true,
        historyApiFallback: {
            rewrites: [
                {
                    from: /^\/app\/.*/,
                    to: function (context: any) {
                        return context.parsedUrl.pathname.includes(".") ? context.parsedUrl.pathname : "/app/index.html";
                    },
                },
            ],
        },
    },
});

export default config;
