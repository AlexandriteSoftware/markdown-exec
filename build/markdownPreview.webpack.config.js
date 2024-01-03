// @ts-check

const path = require('path');
const shared = require('./shared.webpack.config');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
const config = {
    ...shared,
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            // interpreter tries to load vm (it does `require('vm')`) but
            // it causes webpack complain about missing module
            "vm": false
        }
    },
    target: 'web',
    entry: {
        'index': path.join(__dirname, '..', 'markdownPreview', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist-preview'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ]
};

module.exports = config;
