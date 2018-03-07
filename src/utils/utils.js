/**
 * Created by FDD on 2017/9/18.
 * @desc 工具类
 */

/** Used to infer the `Object` constructor. */
const objectProto = Object.prototype
const toString = objectProto.toString
const hasOwnProperty = Object.prototype.hasOwnProperty
const symToStringTag = typeof Symbol !== 'undefined' ? Symbol.toStringTag : undefined

/* eslint no-extend-native: "off" */
Array.prototype.add = function (string) {
  if (!(this.indexOf(string) > -1)) {
    this.push(string)
  }
}

/**
 * 首字母大写(其他小写)
 * @param str
 * @returns {string}
 */
const firstUpperToCase = (str) => {
  return (str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()))
}
/**
 * 只转换第一个字母
 * @param str
 */
const upperFirstChart = str => {
  return (str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase()))
}

/**
 * 去除字符串前后空格
 * @param str
 * @returns {*}
 */
const trim = (str) => {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
}

/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
const isObject = value => {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

/**
 * 判断是否为字符串
 * @param value
 * @returns {boolean}
 */
const isString = value => {
  const type = typeof value
  return type === 'string'
}

/**
 * 获取对象基础标识
 * @param value
 * @returns {*}
 */
const baseGetTag = (value) => {
  if (value === null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  if (!(symToStringTag && symToStringTag in Object(value))) {
    return toString.call(value)
  }
  const isOwn = hasOwnProperty.call(value, symToStringTag)
  const tag = value[symToStringTag]
  let unmasked = false
  try {
    value[symToStringTag] = undefined
    unmasked = true
  } catch (e) {
  }

  const result = toString.call(value)
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag
    } else {
      delete value[symToStringTag]
    }
  }
  return result
}

const TypeOf = (ob) => {
  return Object.prototype.toString.call(ob).slice(8, -1).toLowerCase()
}

/**
 * 判断是否为函数
 * @param value
 * @returns {boolean}
 */
const isFunction = value => {
  if (!isObject(value)) {
    return false
  }
  const tag = baseGetTag(value)
  return tag === '[object Function]' || tag === '[object AsyncFunction]' ||
    tag === '[object GeneratorFunction]' || tag === '[object Proxy]'
}

/**
 * 判断对象是否有某个键值
 * @param object_
 * @param key_
 * @returns {boolean}
 */
const has = (object_, key_) => {
  return typeof object_ === 'object' && object_.hasOwnProperty(key_)
}

/**
 * 检查浏览器版本
 * @returns {*}
 */
const checkBrowser = () => {
  let userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  if (userAgent.indexOf('OPR') > -1) { // 判断是否Opera浏览器 OPR/43.0.2442.991
    return 'Opera'
  } else if (userAgent.indexOf('Firefox') > -1) { // 判断是否Firefox浏览器  Firefox/51.0
    return 'FF'
  } else if (userAgent.indexOf('Trident') > -1) { // 判断是否IE浏览器  Trident/7.0; rv:11.0
    return 'IE'
  } else if (userAgent.indexOf('Edge') > -1) { // 判断是否Edge浏览器  Edge/14.14393
    return 'Edge'
  } else if (userAgent.indexOf('Chrome') > -1) { // Chrome/56.0.2924.87
    return 'Chrome'
  } else if (userAgent.indexOf('Safari') > -1) { // 判断是否Safari浏览器
    return 'Safari'
  }
}

/**
 * 获取uuid
 * @returns {*|string|!Array.<T>}
 */
const getuuid = () => {
  let [s, hexDigits] = [[], '0123456789abcdef']
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'
  return (s.join(''))
}

/**
 * 替换节点
 * @param newNode
 * @param oldNode
 */
const replaceNode = (newNode, oldNode) => {
  let parent = oldNode.parentNode
  if (parent) {
    parent.replaceChild(newNode, oldNode)
  }
}

/**
 * merge
 * @param target
 * @returns {*}
 */
function merge (target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {}
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop]
        if (value !== undefined) {
          target[prop] = value
        }
      }
    }
  }
  return target
}

/* eslint no-useless-escape: "off" */
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const camelCase = function (name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

export {
  camelCase,
  isObject,
  isFunction,
  TypeOf,
  isString,
  trim,
  firstUpperToCase,
  upperFirstChart,
  getuuid,
  merge,
  has,
  replaceNode,
  checkBrowser
}
