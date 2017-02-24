/**
 * Created by FDD on 2017/2/22.
 * @desc 要素相关处理
 */

import { ol } from '../constants'
class Feature {
  constructor (map) {
    this.map = map;
    if (!this.map) {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 通过id获取Feature
   * @param id
   * @returns {*}
   */
  getFeatureById (id) {
    return this.map.getFeatureById(id)
  }

  /**
   * 从属性信息中获取空间信息
   * @param point
   * @returns {*}
   * @private
   */
  _getGeometryFromPoint (point) {
    let geometry = null;
    if (point instanceof ol.geom.Geometry) {
      geometry = point;
    } else if (Array.isArray(point.geometry)) {
      geometry = new ol.geom.Point(point.geometry);
    } else {
      geometry = new ol.format.WKT().readGeometry(point.geometry);
    }
    return geometry;
  }

  addPoint (point, params) {
    if (!this.map) return;
  }
}

export default Feature