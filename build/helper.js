const fs = require('fs');
const path = require('path');
const _package = require('../package.json');
const scss = require('rollup-plugin-scss');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const resolve = _path => path.resolve(__dirname, '../', _path);

/**
 * get file size
 * @param code
 * @returns {string}
 */
const getSize = (code) => {
  return (code.length / 1024).toFixed(2) + 'kb'
};

/**
 * print error
 * @param e
 */
const logError = (e) => {
  console.log(e)
};

/**
 * add message color
 * @param str
 * @returns {string}
 */
const blueString = (str) => {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
};

/**
 * handle min file
 * @param name
 * @returns {string}
 */
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
};

/**
 * check dir exist
 * @param path
 * @param mkdir
 * @returns {boolean}
 */
const checkFolderExist = (path, mkdir) => {
  if (!fs.existsSync(path)) {
    if (mkdir) {
      fs.mkdirSync(path)
    }
    return false
  } else {
    return true
  }
};

const cssPlugins = scss({
  output: resolve(_package.style),
  processor: css => postcss([autoprefixer, cssnano])
    .process(css)
    .then(result => result.css)
});

module.exports = {
  _package,
  resolve,
  getSize,
  logError,
  blueString,
  cssPlugins,
  handleMinEsm
};
