import PlotTypes from '../../Utils/PlotTypes'
import { ol } from '../../../constants'
// import mix from '../../../utils/mixin'
// import Plot from '../../index'
let LineString = ol.geom.LineString
class Polyline extends LineString {
  constructor (points, params) {
    super()
    ol.geom.LineString.call(this, [])
    this.type = PlotTypes.POLYLINE
    this.set('params', params)
    this.setPoints(points)
  }
  generate () {
    this.setCoordinates(this.points)
  }

  /**
   * 设置坐标点
   * @param value
   */
  setPoints (value) {
    this.points = !value ? [] : value
    if (this.points.length >= 2) {
      this.generate()
    }
  }
}

export default Polyline
