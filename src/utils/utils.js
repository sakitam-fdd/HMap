/**
 * 获取两数值之间的随机值
 * @param t1 <下限>
 * @param t2 <上限>
 * @param t3 <需要保留的小数位, 不能大于十五位>
 * @returns {*}
 */
export const getrandom = (t1, t2, t3) => {
  if (!t1 || isNaN(t1)) {
    t1 = 0
  }
  if (!t2 || isNaN(t2)) {
    t2 = 1
  }
  if (!t3 || isNaN(t3)) {
    t3 = 0
  }
  t3 = t3 > 15 ? 15 : t3
  let [ra, du] = [(Math.random() * (t2 - t1) + t1), (Math.pow(10, t3))]
  ra = (Math.round(ra * du) / du)
  return ra
}

/**
 * 获取id
 * @returns {*|string|!Array.<T>}
 */
export const getuuid = () => {
  let [ s, hexDigits ] = [ [], '0123456789abcdef' ]
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'
  return (s.join(''))
}

/**
 * 添加标识
 * @param obj
 * @returns {*}
 */
export const stamp = function (obj) {
  let key = '_p_id_'
  obj[key] = obj[key] || (getuuid())
  return obj[key]
}

/**
 * 去除字符串前后空格
 * @param str
 * @returns {*}
 */
export const trim = (str) => {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
}

/**
 * 将类名截取成数组
 * @param str
 * @returns {Array|*}
 */
export const splitWords = (str) => {
  return trim(str).split(/\s+/)
}

/**
 * 首字母大写(其他小写)
 * @param str
 * @returns {string}
 */
export const firstUpperToCase = (str) => {
  return (str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()))
}
/**
 * 只转换第一个字母
 * @param str
 */
export const upperFirstChart = str => {
  return (str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase()))
}
