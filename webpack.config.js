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
      filename: assetsPath('../HMap.min.css'),
      allChunks: true
    }),
    new BundleAnalyzerPlugin({
      // Can be `server`, `static` or `disabled`.
      // In `server` mode analyzer will start HTTP server to show bundle report.
      // In `static` mode single HTML file with bundle report will be generated.
      // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
      analyzerMode: 'static',
      // Host that will be used in `server` mode to start HTTP server.
      analyzerHost: '127.0.0.1',
      // Port that will be used in `server` mode to start HTTP server.
      analyzerPort: 8888,
      // Path to bundle report file that will be generated in `static` mode.
      // Relative to bundles output directory.
      reportFilename: 'report.html',
      // Module sizes to show in report by default.
      // Should be one of `stat`, `parsed` or `gzip`.
      // See "Definitions" section for more information.
      defaultSizes: 'parsed',
      // Automatically open report in default browser
      openAnalyzer: true,
      // If `true`, Webpack Stats JSON file will be generated in bundles output directory
      generateStatsFile: false,
      // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
      // Relative to bundles output directory.
      statsFilename: 'stats.json',
      // Options for `stats.toJson()` method.
      // For example you can exclude sources of your modules from stats file with `source: false` option.
      // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
      statsOptions: null,
      // Log level. Can be 'info', 'warn', 'error' or 'silent'.
      logLevel: 'info'
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
    path.join(__dirname, 'node_modules/babel-polyfill'),
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
        enforce: 'pre',  // 在babel-loader对源码进行编译前进行lint的检查
        loaders: [
          'babel-loader',
          'eslint-loader'
        ],
        exclude: /(node_modules|bower_components)/
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
      '@': resolve('src')
    }
  },
  plugins: plugins
}

module.exports = config
