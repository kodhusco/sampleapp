const webpack = require('webpack');
const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        app: ['webpack/hot/dev-server', './entry.js'],
    },
    output: {
        path: path.join(__dirname, '/public/built'),
        filename: 'bundle.js',
        publicPath: 'http://localhost:8080/built/'
    },
    devServer: {
        contentBase: './public',
        publicPath: 'http://localhost:8080/built/'
    },
    module: {
        rules: [
            { test: /\.js$/, loader: 'babel-loader' , exclude: /node_modules/},
            { test: /\.css$/, loader: 'style-loader!css-loader' }
          ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}
