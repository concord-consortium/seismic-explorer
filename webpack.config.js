var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: process.env.PRODUCTION ? 'production' : 'development',
  entry: [
    './js/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        // Support ?123 suffix, e.g. ../fonts/m4d-icons.svg?3179539#iefix (for svg)
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf)((\?|#).*)?$/,
        type: 'asset',
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
        test: /three[\\/]examples[\\/]js/,
        loader: 'imports-loader',
        options: {
          imports: [
            'namespace three THREE'
          ]
        }
      },
      {
        test: /leaflet-plugins\//,
        loader: 'imports-loader',
        options: {
          imports: [
            'namespace leaflet L'
          ]
        }
      },
      {
        test: /\.svg$/,
        oneOf: [
          {
            // Do not apply SVGR import in CSS/LESS files.
            issuer: /\.(less|css)$/,
            type: 'asset',
          },
          {
            issuer: /\.js$/,
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: {
                  // SVGR removes viewbox by default. Disable this behavior.
                  removeViewBox: false
                }
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public' }
      ],
    })
  ]
}

if (process.env.PRODUCTION) {
  // We could use NODE_ENV directly (instead of PRODUCTION), but for some reason,
  // when NODE_ENV is defined in command line, React does not seem to recognize it.
  module.exports.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  )
}
