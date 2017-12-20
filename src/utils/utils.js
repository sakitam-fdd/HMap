/**
 * Created by FDD on 2017/9/18.
 * @desc 工具类
 */

/** Used to infer the `Object` constructor. */
const objectProto = Object.prototype
const toString = objectProto.toString
const hasOwnProperty = Object.prototype.hasOwnProperty
const symToStringTag = typeof Symbol !== 'undefined' ? Symbol.toStringTag : undefined

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

export {
  isObject,
  isFunction,
  TypeOf,
  isString,
  trim,
  firstUpperToCase,
  upperFirstChart
}
