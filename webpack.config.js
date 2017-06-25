/* global __dirname, require, module */

const webpack = require('webpack')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const path = require('path')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const autoprefixer = require('autoprefixer')
const env = require('yargs').argv.env // use --env with webpack 2

let libraryName = 'HMap'

const resolve = (dir) => {
  return path.join(__dirname, '..', dir)
}

let plugins = [
  new webpack.BannerPlugin('This file is created by FDD'),
  new FriendlyErrorsPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
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

let outputFile

if (env === 'build') {
  let _plugins = [
    new UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    new ExtractTextPlugin({
      filename: __dirname + '/dist/css/index.css',
      allChunks: true
    }),
    new BundleAnalyzerPlugin()
  ]
  plugins = plugins.concat(_plugins)
  outputFile = libraryName + '.min.js'
} else {
  // extract css into its own file
  let __plugins = [
    new ExtractTextPlugin({
      filename: __dirname + '/dist/css/index.css'
    })
  ]
  plugins = plugins.concat(__plugins)
  outputFile = libraryName + '.js'
}

const config = {
  entry: [
    path.join(__dirname, 'node_modules/babel-polyfill'),
    path.resolve(__dirname + '/src/index.js')
  ],
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {},
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        enforce: 'pre',  // 在babel-loader对源码进行编译前进行lint的检查
        loaders: [
          'babel-loader',
          'eslint-loader'
        ],
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          // resolve-url-loader may be chained before sass-loader if necessary
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          // resolve-url-loader may be chained before sass-loader if necessary
          use: ['css-loader', 'less-loader']
        })
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.scss'],
    alias: {
      '@': resolve('src')
    }
  },
  plugins: plugins
}

module.exports = config
