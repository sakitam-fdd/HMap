/* global __dirname, require, module */
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const resolve = (dir) => {
  return path.join(__dirname, '..', dir)
}
module.exports = {
  entry: resolve('src') + '/index.js',
  output: {
    path: config.base.distDirectory,
    filename: config.base.fileName + (process.env.NODE_ENV === 'production' ? '.min.js' : '.js'),
    library: config.base.libraryName,
    chunkFilename: '../dist/[name].js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: require.resolve('openlayers'),
        use: [
          {
            loader: 'expose-loader',
            options: 'ol'
          }
        ]
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/ol-extent/src')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[ext]')
        }
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.css', '.scss'],
    alias: {
      '@': resolve('src')
    }
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: function () {
          return [
            autoprefixer({
              browsers: ['ie>=8', '>1% in CN']
            })
          ]
        }
      }
    })
  ]
}
