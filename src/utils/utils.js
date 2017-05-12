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
