// @ts-check

const path = require('path');
const shared = require('./shared.webpack.config');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
const config = {
    ...shared,
    resolve: {
        extensions: ['.ts', '.js']
    },
    target: 'es5',
    entry: {
        'index': path.join(__dirname, '..', 'polyfill', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist-preview'),
        filename: 'polyfill.bundle.js',
        chunkFormat: 'array-push'
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ]
};

module.exports = config;
