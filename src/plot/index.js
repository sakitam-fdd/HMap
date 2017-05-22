/**
 * Created by FDD on 2017/5/15.
 * @desc 基于openlayer的动态标绘
 */
import { ol } from '../constants'
import Plots from './Geometry/index'
import PlotTypes from './Utils/PlotTypes'
class Plot {
  constructor (map) {
    this.version = '1.0.0'
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 创建Plot
   * @param type
   * @param points
   * @param _params
   * @returns {*}
   */
  createPlot (type, points, _params) {
    let params = _params || {}
    switch (type) {
      case PlotTypes.POLYLINE:
        return new Plots.Polyline(points, params)
      case PlotTypes.ARC:
        return new Plots.Arc(points, params)
      case PlotTypes.CIRCLE:
        return new Plots.Circle(points, params)
      case PlotTypes.CURVE:
        return new Plots.Curve(points, params)
    }
    return null
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap (map) {
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
  }

  /**
   * 获取当前地图对象
   * @returns {ol.Map|*}
   */
  getMap () {
    return this.map
  }

  /**
   * 判断是否是Plot
   * @returns {boolean}
   */
  isPlot () {
    return true
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

  /**
   * 获取坐标点
   * @returns {Array.<T>}
   */
  getPoints () {
    return this.points.slice(0)
  }

  /**
   * 获取点数量
   * @returns {Number}
   */
  getPointCount () {
    return this.points.length
  }

  /**
   * 更新当前坐标
   * @param point
   * @param index
   */
  updatePoint (point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point
      this.generate()
    }
  }

  /**
   * 更新最后一个坐标
   * @param point
   */
  updateLastPoint (point) {
    this.updatePoint(point, this.points.length - 1)
  }

  generate () {}
}
export default Plot
