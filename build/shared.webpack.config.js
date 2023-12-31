const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    target: 'web',
    externals: ['fs', 'child_process'],
    resolve: {
        extensions: ['.ts', '.js'], // support ts-files and js-files
        fallback: {
            "child_process": false,
            "fs": false,
            "vm": false
            // and also other packages that are not found
          }
    },
    module: {
        rules: [
            {
                parser: {
                    amd: false
                },
                include: /node_modules\/lodash\// // https://github.com/lodash/lodash/issues/3052
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader' }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{ loader: 'ts-loader' }]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};