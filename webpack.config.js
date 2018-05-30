var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './js/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loader: 'style!css!autoprefixer'
      },
      {
        test: /\.less$/,
        loader: 'style!css!less!autoprefixer'
      },
      {
        // Support ?123 suffix, e.g. ../fonts/m4d-icons.svg?3179539#iefix (for svg)
        test: /\.(png|jpg|gif|svg)((\?|\#).*)?$/,
        // inline base64 URLs for <=64k images, direct URLs for the rest
        loader: 'url-loader?limit=65536'
      },
      {
        // Support ?123 suffix, e.g. ../fonts/m4d-icons.eot?3179539#iefix
        test: /\.(eot|ttf|woff|woff2)((\?|\#).*)?$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.glsl$/,
        loader: 'raw-loader'
      },
      {
        test: /\.kml$/,
        loader: 'raw-loader'
      },
      {
        // Pass global THREE variable to OrbitControls
        test: /three\/examples\/js/,
        loader: 'imports-loader?THREE=three'
      },
      {
        // Pass global THREE variable to OrbitControls
        test: /leaflet-plugins\//,
        loader: 'imports?L=leaflet'
      }
    ],
    // See: https://gist.github.com/mjackson/ecd3914ebee934f4daf4
    postLoaders: [
      {
        include: path.resolve(__dirname, 'node_modules/pixi.js'),
        loader: 'transform/cacheable?brfs'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: 'public'}
    ])
  ]
};

if (process.env.PRODUCTION) {
  // We could use NODE_ENV directly (instead of PRODUCTION), but for some reason,
  // when NODE_ENV is defined in command line, React does not seem to recognize it.
  module.exports.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  )
  module.exports.plugins.push(
    new UglifyJsPlugin({
      sourceMap: true
    })
  )
}

