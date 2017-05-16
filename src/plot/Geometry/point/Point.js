/**
 * Created by FDD on 2017/5/15.
 * @desc 点要素
 * @Inherits ol.geom.Point
 */
import { ol } from '../../../constants'
import Plot from '../../index'
import mix from '../../../utils/mixin'
const GeomPoint = ol.geom.Point
class Point extends mix(GeomPoint, Plot) {
  constructor (point, params) {
    super()
    this.type = 'POINT'
    this.options = params || {}
    this.set('params', this.options);
    this.setPoints(point)
  }

  generate () {
    this.setCoordinates(this.points)
  }
}

export default Point
