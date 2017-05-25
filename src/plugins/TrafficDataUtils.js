/**
 * Created by FDD on 2017/5/24.
 * @desc 对高德路况数据解析
 */
class TrafficDataUtils {
  constructor () {
    this.version = '1.0.0'
  }

  /**
   * 扩展时间格式化
   */
  addDataFormat () {
    window.Date.prototype.format = function (a) {
      let c = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds()
      }
      if (/(y+)/.test(a)) {
        a = a.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
      }
      for (let b in c) {
        if (new RegExp('(' + b + ')').test(a)) {
          a = a.replace(RegExp.$1, (RegExp.$1.length == 1) ? (c[b]) : (('00' + c[b]).substr(('' + c[b]).length)))
        }
      }
      return a
    }
  }

  /**
   * 对数据的颜色取值
   * @param a
   * @returns {string}
   */
  colorFromIdx (a) {
    let color = ''
    switch (a) {
      case (a >= 4):
        color = '#8e0e0b'
        break
      case (a < 4 || a >= 2):
        color = 'df0100'
        break
      case (a < 2 || a >= 1.5):
        color = 'fecb00'
        break
      default:
        color = '#34b000'
        break
    }
    return color
  }

  getUUID () {
    let baseStr = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    baseStr.replace(/[xy]/g, d => {
      let b = Math.random() * 16 | 0
      let a = d === 'x' ? b : (b & 3 | 8)
      return a.toString(16)
    })
    return baseStr
  }
}

export default TrafficDataUtils
