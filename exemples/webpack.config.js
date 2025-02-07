module.exports = {
    mode: "production",
    entry: {
        main: "./src/index.ts",
        admin: "./src/admin.ts"
    },
    
    output: {
        path: "./dist",
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].chunk.js",
        publicPath: "/assets/",
        clean: true
    },

    module: {
        rules: [
            {
                test: "\\.(ts|tsx)$",
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true
                        }
                    }
                ],
                exclude: "node_modules"
            },
            {
                test: "\\.css$",
                use: ["style-loader", "css-loader"]
            },
            {
                test: "\\.(png|svg|jpg|jpeg|gif)$",
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024
                    }
                }
            }
        ]
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "@": "./src",
            "@components": "./src/components",
            "@utils": "./src/utils"
        },
        fallback: {
            "path": false,
            "fs": false
        }
    },

    optimization: {
        minimize: true,
        splitChunks: {
            chunks: "all",
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: "node_modules",
                    priority: -10,
                    reuseExistingChunk: true
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },

    performance: {
        hints: "warning",
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },

    devServer: {
        port: 3000,
        hot: true,
        compress: true,
        historyApiFallback: true,
        client: {
            overlay: true,
            progress: true
        },
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    },

    stats: {
        colors: true,
        chunks: false,
        modules: false
    },

    devtool: "source-map"
}; 