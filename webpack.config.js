/* global __dirname, require, module */

const webpack = require('webpack')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const path = require('path')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const autoprefixer = require('autoprefixer')
const env = require('yargs').argv.env // use --env with webpack 2
const assetsPath = function (_path) {
  let assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? 'dist'
    : 'dist'
  return path.posix.join(assetsSubDirectory, _path)
}
let libraryName = 'HMap'

const resolve = (dir) => {
  return path.join(__dirname, './', dir)
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
      filename: assetsPath('../HMap.min.css'),
      allChunks: true
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      analyzerHost: '127.0.0.1',
      analyzerPort: 8888
    })
  ]
  plugins = plugins.concat(_plugins)
  outputFile = libraryName + '.min.js'
} else {
  // extract css into its own file
  let __plugins = [
    new ExtractTextPlugin({
      filename: assetsPath('../HMap.css'),
      allChunks: true
    })
  ]
  plugins = plugins.concat(__plugins)
  outputFile = libraryName + '.js'
}

const config = {
  entry: [
    path.resolve(__dirname + '/src/index.js')
  ],
  // devtool: '#cheap-module-eval-source-map',
  // devtool: '#eval-source-map',
  devtool: '#source-map',
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
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          // resolve-url-loader may be chained before sass-loader if necessary
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.scss'],
    alias: {
      '@': './src'
    }
  },
  plugins: plugins
}

module.exports = config
