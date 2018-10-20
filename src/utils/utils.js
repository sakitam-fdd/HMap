/**
 * Created by FDD on 2017/9/18.
 * @desc 工具类
 */

/** Used to infer the `Object` constructor. */
const objectProto = Object.prototype;
const toString = objectProto.toString;

/* eslint no-extend-native: "off" */
Array.prototype.add = function (string) {
  if (!(this.indexOf(string) > -1)) {
    this.push(string);
  }
};

/**
 * 首字母大写(其他小写)
 * @param str
 * @returns {string}
 */
const firstUpperToCase = str => {
  return str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());
};
/**
 * 只转换第一个字母
 * @param str
 */
const upperFirstChart = str => {
  return str.replace(/( |^)[a-z]/g, L => L.toUpperCase());
};

/**
 * 去除字符串前后空格
 * @param str
 * @returns {*}
 */
const trim = str => {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
};

/**
 * check is null
 * @param obj
 * @returns {boolean}
 */
const isNull = obj => {
  return obj == null;
};

/**
 * check is number
 * @param val
 * @returns {boolean}
 */
const isNumber = val => {
  return typeof val === 'number' && !isNaN(val);
};

/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
const isObject = value => {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
};

/**
 * check is function
 * @param value
 * @returns {boolean}
 */
const isFunction = value => {
  if (!isObject(value)) {
    return false;
  }
  return (
    typeof value === 'function' ||
    (value.constructor !== null && value.constructor === Function)
  );
};

/**
 * is date value
 * @param val
 * @returns {boolean}
 */
const isDate = val => {
  return toString.call(val) === '[object Date]';
};

/**
 * 判断是否为合法字符串
 * @param value
 * @returns {boolean}
 */
const isString = value => {
  if (value == null) {
    return false;
  }
  return (
    typeof value === 'string' ||
    (value.constructor !== null && value.constructor === String)
  );
};

/**
 * 判断对象是否有某个键值
 * @param object_
 * @param key_
 * @returns {boolean}
 */
const has = (object_, key_) => {
  return typeof object_ === 'object' && object_.hasOwnProperty(key_);
};

/**
 * 检查浏览器版本
 * @returns {*}
 */
const checkBrowser = () => {
  let userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
  if (userAgent.indexOf('OPR') > -1) {
    // 判断是否Opera浏览器 OPR/43.0.2442.991
    return 'Opera';
  } else if (userAgent.indexOf('Firefox') > -1) {
    // 判断是否Firefox浏览器  Firefox/51.0
    return 'FF';
  } else if (userAgent.indexOf('Trident') > -1) {
    // 判断是否IE浏览器  Trident/7.0; rv:11.0
    return 'IE';
  } else if (userAgent.indexOf('Edge') > -1) {
    // 判断是否Edge浏览器  Edge/14.14393
    return 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    // Chrome/56.0.2924.87
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    // 判断是否Safari浏览器
    return 'Safari';
  }
};

/**
 * 获取uuid
 * @returns {*|string|!Array.<T>}
 */
const getuuid = () => {
  let [s, hexDigits] = [[], '0123456789abcdef'];
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
};

/**
 * 替换节点
 * @param newNode
 * @param oldNode
 */
const replaceNode = (newNode, oldNode) => {
  let parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};

/**
 * merge
 * @param target
 * @returns {*}
 */
function merge (target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {};
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }
  return target;
}

/* eslint no-useless-escape: "off" */
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const camelCase = function (name) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1');
};

function toConsumableArray (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

const coalesce = (...args) => {
  return args.filter(value => value != null).shift();
};

const toRadians = (angleInDegrees) => {
  return angleInDegrees * Math.PI / 180;
};

const getDistance = (c1, c2, radius) => {
  const lat1 = toRadians(c1[1]);
  const lat2 = toRadians(c2[1]);
  const deltaLatBy2 = (lat2 - lat1) / 2;
  const deltaLonBy2 = toRadians(c2[0] - c1[0]) / 2;
  const a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
    Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) *
    Math.cos(lat1) * Math.cos(lat2);
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * check object is empty
 * @param _object
 * @returns {boolean}
 */
const isEmpty = _object => {
  try {
    return Object.keys(_object).length === 0;
  } catch (e) {
    return JSON.stringify(_object) === '{}';
  }
};

const arraySame = function (...args) {
  let flag = true;
  // const args = Array.prototype.slice.call(arguments);
  args.reduce(function(before, after) {
    if (before[0] !== after[0] || before[1] !== after[1] || before[2] !== after[2] || before[3] !== after[3]) {
      flag = false;
    }
    return after;
  });
  return flag;
};

/**
 * Gets a unique ID for an object
 * @param _object
 * @returns {*|string}
 */
const generateObjectInterFlag = function (_object) {
  return _object[`object_inter_flag`] || (_object[`object_inter_flag`] = getuuid().replace(/-/g, '_'));
};

const createContext = function (canvas, glOptions = {}, type = 'webgl2') {
  if (!canvas) return null;
  function onContextCreationError(error) {
    console.log(error.statusMessage);
  }

  canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
  let gl = canvas.getContext(type, glOptions);
  gl = gl || canvas.getContext('experimental-webgl2', glOptions);
  if (!gl) {
    gl = canvas.getContext('webgl', glOptions);
    gl = gl || canvas.getContext('experimental-webgl', glOptions);
  }

  canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
  return gl;
};

export {
  coalesce,
  camelCase,
  isObject,
  isEmpty,
  isFunction,
  isDate,
  isString,
  trim,
  isNumber,
  isNull,
  firstUpperToCase,
  upperFirstChart,
  getuuid,
  merge,
  has,
  replaceNode,
  checkBrowser,
  getDistance,
  toConsumableArray,
  arraySame,
  generateObjectInterFlag,
  createContext
};
