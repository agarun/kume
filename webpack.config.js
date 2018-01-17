const webpack = require('webpack');
const path = require('path');
const debug = process.env.NODE_ENV !== 'production';
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const prodPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
    },
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: true,
    },
  }),
];

const devPlugins = [
  new ExtractTextPlugin('assets/styles/main.css'),
];

const plugins = process.env.NODE_ENV === 'production'
  ? prodPlugins
  : devPlugins;

module.exports = {
  context: __dirname,
  devtool: debug ? 'inline-sourcemap' : false,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'assets/js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        })
      }
    ],
  },
  plugins: plugins,
  target: 'node',
};
