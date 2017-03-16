# webgis jsapi构建

### 类库
> 在 JavaScript 语境中，我对类库的定义是 “提供了特定功能的一段代段”。
一个类库只做一件事，并且把这件事做好。在理想情况下，
它不依赖其它类库或框架。jQuery 就是一个很好的例子。
React 或者 Vue.js 也可以认为是一个类库。

> **一个类库应该：**
> > * 可以在浏览器环境下使用。也就是说，可以通过`<script> `标签来引入这个类库。
> > * 可以通过 npm 来安装。
> > * 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范。

### 目录结构

```
ES6 source files
       |
       |
    webpack
       |
       +--- babel, eslint
       |
  ready to use
     library
  in umd format
```

# Webpack library starter

Webpack based boilerplate for producing libraries (Input: ES6, Output: universal library)

## Features

* Webpack 2 based.
* ES6 as a source.
* Exports in a [umd](https://github.com/umdjs/umd) format so your library works everywhere.
* ES6 test setup with [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/).
* Linting with [ESLint](http://eslint.org/).

## Process



*Have in mind that you have to build your library before publishing. The files under the `lib` folder are the ones that should be distributed.*

## Getting started

1. Setting up the name of your library
  * Open `webpack.config.js` file and change the value of `libraryName` variable.
  * Open `package.json` file and change the value of `main` property so it matches the name of your library.
2. Build your library
  * Run `npm install` to get the project's dependencies
  * Run `npm run build` to produce minified version of your library.
3. Development mode
  * Having all the dependencies installed run `npm run dev`. This command will generate an non-minified version of your library and will run a watcher so you get the compilation on file change.
4. Running the tests
  * Run `npm run test`

## Scripts

* `npm run build` - produces production version of your library under the `lib` folder
* `npm run dev` - produces development version of your library and runs a watcher
* `npm run test` - well ... it runs the tests :)
* `npm run test:watch` - same as above but in a watch mode

## Readings

* [Start your own JavaScript library using webpack and ES6](http://krasimirtsonev.com/blog/article/javascript-library-starter-using-webpack-es6)

## Misc

### An example of using dependencies that shouldn’t be resolved by webpack, but should become dependencies of the resulting bundle

In the following example we are excluding React and Lodash:

```js
{
  devtool: 'source-map',
  output: {
    path: '...',
    libraryTarget: 'umd',
    library: '...'
  },
  entry: '...',
  ...
  externals: {
    react: 'react'
    // Use more complicated mapping for lodash.
    // We need to access it differently depending
    // on the environment.
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: '_',
      root: '_'
    }
  }
}
```

## 修改 proj4里面的两个保持路径正确

```javascript
var proj4 = require('./core');
proj4.defaultDatum = 'WGS84'; //default datum
proj4.Proj = require('./Proj');
proj4.WGS84 = new proj4.Proj('WGS84');
proj4.Point = require('./Point');
proj4.toPoint = require('./common/toPoint');
proj4.defs = require('./defs');
proj4.transform = require('./transform');
proj4.mgrs = require('../../mgrs');
proj4.version = require('./version');
require('./includedProjections')(proj4);
module.exports = proj4;

```