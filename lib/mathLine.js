/**
 * Created by FDD on 2017/6/6.
 */
class MathLine {
  constructor (radius) {
    if (radius && typeof radius === 'number') {
      this.radius = radius
    } else {
      this.radius = 6378137
    }
  }

  /**
   * 计算地理坐标两点之间距离
   * @param c1
   * @param c2
   * @returns {number}
   */
  haversineDistance (c1, c2) {
    let lat1 = this.toRadians(c1[1])
    let lat2 = this.toRadians(c2[1])
    let deltaLatBy2 = (lat2 - lat1) / 2
    let deltaLonBy2 = this.toRadians(c2[0] - c1[0]) / 2
    let a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
      Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) *
      Math.cos(lat1) * Math.cos(lat2)
    return 2 * this.radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  toRadians (angleInDegrees) {
    return angleInDegrees * Math.PI / 180
  }
}

export default MathLine
