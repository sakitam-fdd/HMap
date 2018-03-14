const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const uglify = require('uglify-js');
const rollup = require('rollup');
const configs = require('./rollup-base-config');
const { blueString, getSize, logError, cssPlugins } = require('./helper');

/**
 * build
 * @param builds
 */
function build (builds) {
  let index = 0;
  const total = builds.length;
  const next = () => {
    const _result = buildEntry(builds[index]).next();
    _result.value.then(() => {
      index++;
      if (index < total) {
        next();
      }
    }).catch(logError);
  };
  next();
}

/**
 * builder
 * @param input
 * @param output
 * @returns {Promise.<TResult>}
 */
const buildEntry = function* ({ input, output }) {
  const isProd = /min\.js$/.test(output.file);
  input.plugins.splice(2, 0, cssPlugins);
  yield rollup.rollup(input)
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      if (isProd) {
        const minified = uglify.minify(code, {
          output: {
            preamble: output.banner,
            /* eslint-disable camelcase */
            ascii_only: true
            /* eslint-enable camelcase */
          }
        }).code;
        return write(output.file, minified, true)
      } else {
        return write(output.file, code)
      }
    })
}

/**
 * write file to disk
 * @param dest
 * @param code
 * @param zip
 * @returns {Promise}
 */
const write = (dest, code, zip) => {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blueString(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''));
      resolve()
    }
    fs.writeFile(dest, code, err => {
      if (err) return reject(err);
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err);
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
};

build(Object.keys(configs).map(key => configs[key]))
