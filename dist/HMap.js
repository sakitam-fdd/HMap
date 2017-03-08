(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("HMap", [], factory);
	else if(typeof exports === 'object')
		exports["HMap"] = factory();
	else
		root["HMap"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var mapConfig = {
  center: [109.15169990462329, 31.74108365827285],
  resolution: 0.05406145033589252,
  zoom: 5,
  projection: 'EPSG:102100',
  overViewMapVisible: false,
  scaleLineVisible: true,
  baseLayers: [{
    layerName: 'vector',
    isDefault: true,
    layerType: 'TileXYZ',
    opaque: true, //图层是否不透明
    layerUrl: 'http://10.254.123.75:8080/OneMapServer/rest/services/World2ChinaMapBG/MapServer',
    label: { //地图图层是否对应的有标注层
      layerName: 'vectorLabel',
      isDefault: true,
      layerType: 'TileXYZ',
      layerUrl: 'http://10.254.123.75:8080/OneMapServer/rest/services/World2ChinaMapLabel/MapServer'
    }
  }, {
    layerName: 'earth',
    layerType: 'TitleWMTS',
    layer: 'img',
    isDefault: false,
    layerUrl: 'http://t{0-6}.tianditu.cn/img_c/wmts',
    label: {
      layerName: 'TDTLabel',
      layerType: 'TitleWMTS',
      layer: 'cia',
      isDefault: false,
      layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
    }
  }, {
    layerName: 'panorama',
    layerType: 'TitleWMTS',
    layer: 'ter',
    isDefault: false,
    layerUrl: 'http://t{0-6}.tianditu.com/ter_c/wmts',
    label: {
      layerName: 'TDTLabel',
      layerType: 'TitleWMTS',
      layer: 'cia',
      isDefault: false,
      layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
    }
  }]
};
exports.default = mapConfig;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Layer = function () {
  function Layer() {
    _classCallCheck(this, Layer);

    this.model = 'Layer';
  }

  _createClass(Layer, [{
    key: 'getModel',
    value: function getModel() {
      return this.model;
    }
  }]);

  return Layer;
}();

exports.default = Layer;
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Map = function () {
  function Map() {
    _classCallCheck(this, Map);

    this.model = 'Map';
  }

  _createClass(Map, [{
    key: 'getModel',
    value: function getModel() {
      return this.model;
    }
  }]);

  return Map;
}();

exports.default = Map;
module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {
	"name": "HMap",
	"version": "1.0.0",
	"private": true,
	"description": "HDSXTECH WEBGIS API",
	"keywords": [
		"webgis",
		"canvas",
		"openlayer3",
		"es6"
	],
	"author": "FDD <smileFDD@gmail.com>",
	"repository": {
		"type": "git",
		"url": "https://github.com/smilefdd/"
	},
	"main": "dist/map.js",
	"scripts": {
		"build": "webpack --env build",
		"dev": "webpack --progress --colors --watch --env dev",
		"test": "mocha --compilers js:babel-core/register --colors ./test/*.spec.js",
		"test:watch": "mocha --compilers js:babel-core/register --colors -w ./test/*.spec.js"
	},
	"dependencies": {
		"jquery": "^3.1.1",
		"openlayers": "^4.0.0",
		"proj4": "^2.3.17",
		"zrender": "^3.2.2"
	},
	"devDependencies": {
		"babel": "^6.0.0",
		"babel-core": "^6.0.0",
		"babel-eslint": "^7.0.0",
		"babel-loader": "^6.0.0",
		"babel-plugin-add-module-exports": "0.1.2",
		"babel-preset-es2015": "^6.0.0",
		"babel-plugin-transform-runtime": "^6.0.0",
		"babel-preset-stage-2": "^6.0.0",
		"babel-register": "^6.0.0",
		"eslint": "^3.7.1",
		"eslint-loader": "^1.5.0",
		"eslint-friendly-formatter": "^2.0.5",
		"eslint-config-standard": "^6.1.0",
		"eslint-plugin-promise": "^3.4.0",
		"eslint-plugin-standard": "^2.0.1",
		"yargs": "^6.0.0",
		"chai": "^3.0.0",
		"chalk": "^1.1.3",
		"mocha": "^2.0.0",
		"webpack": "^2.2.0",
		"webpack-dev-middleware": "^1.8.3",
		"webpack-hot-middleware": "^2.12.2",
		"webpack-merge": "^0.14.1"
	}
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapConfig = __webpack_require__(0);

var _mapConfig2 = _interopRequireDefault(_mapConfig);

var _Map = __webpack_require__(2);

var _Map2 = _interopRequireDefault(_Map);

var _Layer = __webpack_require__(1);

var _Layer2 = _interopRequireDefault(_Layer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HMap = {};

HMap.version = __webpack_require__(3).version;

HMap.Map = _Map2.default;
HMap.Layer = _Layer2.default;
HMap.config = _mapConfig2.default;

exports.default = HMap;
module.exports = exports['default'];

/***/ })
/******/ ]);
});
//# sourceMappingURL=HMap.js.map