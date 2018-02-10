// Config file for running Rollup in "normal" mode (non-watch)

const path = require('path');
const babel = require('rollup-plugin-babel'); // ES2015 tran
const json = require('rollup-plugin-json');
const cjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const eslint = require('rollup-plugin-eslint');
const friendlyFormatter = require('eslint-friendly-formatter');
const scss = require('rollup-plugin-scss');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const urlLoader = require('rollup-plugin-url');
const _package = require('../package.json');
const eslintConfig = require('../.eslintrc');
const time = new Date();
const year = time.getFullYear();
const banner = `/*!\n * author: ${_package.author} 
 * ${_package.name} v${_package.version}
 * build-time: ${year}-${time.getMonth()}-${time.getDay()} ${time.getHours()}:${time.getMinutes()}
 * LICENSE: ${_package.license}
 * (c) 2016-${year} ${_package.homepage}\n */`;

const resolve = _path => path.resolve(__dirname, '../', _path)

const genConfig = (opts) => {
  const config = {
    input: {
      input: resolve('src/index.js'),
      plugins: [
        json({
          include: resolve('package.json'),
          indent: ' '
        }),
        eslint(Object.assign({}, eslintConfig, {
          formatter: friendlyFormatter,
          exclude: [
            resolve('package.json'),
            resolve('node_modules/**'),
            resolve('src/assets/**')]
        })),
        scss({
          output: resolve(_package.style),
          processor: css => postcss([autoprefixer, cssnano])
            .process(css)
            .then(result => result.css)
        }),
        urlLoader({
          limit: 1024, // inline files < 10k, copy files > 10k
          include: ['**/*.svg', '**/*.png', '**/*.gif'], // defaults to .svg, .png, .jpg and .gif files
          emitFiles: true, // defaults to true
          publicPath: resolve('src/dist/img')
        }),
        babel({
          exclude: [
            resolve('package.json'),
            resolve('node_modules/**')
          ] // only transpile our source code
        }),
        nodeResolve({
          jsnext: true,
          main: true,
          browser: true
        }),
        cjs()
      ]
      // external: ['openlayers']
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      globals: {
        openlayers: 'ol'
      },
      name: _package.namespace
    }
  }
  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }
  return config
}

const handleMinEsm = name => {
  if (typeof name === 'string') {
    let arr_ = name.split('.')
    let arrTemp = []
    arr_.forEach((item, index) => {
      if (index < arr_.length - 1) {
        arrTemp.push(item)
      } else {
        arrTemp.push('min')
        arrTemp.push(item)
      }
    })
    return arrTemp.join('.')
  }
}

module.exports = [
  {
    file: resolve(_package.unpkg),
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve(handleMinEsm(_package.unpkg)),
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve(_package.main),
    format: 'cjs'
  },
  {
    file: resolve(_package.module),
    format: 'es'
  }
].map(genConfig)
