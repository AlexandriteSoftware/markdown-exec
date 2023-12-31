// @ts-check

const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
    context: path.dirname(__dirname),
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    target: 'webworker', // extensions run in a webworker context
    entry: {
        'index': './src/index.ts', // source of the web extension main file
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '..', 'dist', 'web'),
        libraryTarget: 'commonjs'
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
        extensions: ['.ts', '.js'], // support ts-files and js-files
        fallback: {
            "path": false,
            "fs": false,
            "url": false,
            "string_decoder": false,
            "stream": false
        }
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [{
                loader: 'ts-loader'
            }]
        }]
    },
    externals: {
        'vscode': 'commonjs vscode' // ignored because it doesn't exist
    },
    performance: {
        hints: false
    },
    devtool: 'nosources-source-map' // create a source map that points to the original source file
};

module.exports = config;
