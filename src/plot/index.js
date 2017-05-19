/**
 * Created by FDD on 2017/5/15.
 * @desc 基于openlayer的动态标绘
 */
import { ol } from '../constants'
import PlotDraw from './Event/PlotDraw'
import PlotEdit from './Event/PlotEdit'
class Plot {
  constructor (map) {
    this.version = '1.0.0'
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('缺少地图对象！')
    }
    this.PlotTypes = {
      ARC: 'arc',
      ELLIPSE: 'ellipse',
      CURVE: 'curve',
      CLOSED_CURVE: 'closedcurve',
      LUNE: 'lune',
      SECTOR: 'sector',
      GATHERING_PLACE: 'gatheringplace',
      STRAIGHT_ARROW: 'straightarrow',
      ASSAULT_DIRECTION: 'assaultdirection',
      ATTACK_ARROW: 'attackarrow',
      TAILED_ATTACK_ARROW: 'tailedattackarrow',
      SQUAD_COMBAT: 'squadcombat',
      TAILED_SQUAD_COMBAT: 'tailedsquadcombat',
      FINE_ARROW: 'finearrow',
      CIRCLE: 'circle',
      DOUBLE_ARROW: 'doublearrow',
      POLYLINE: 'polyline',
      FREEHAND_LINE: 'freehandline',
      POLYGON: 'polygon',
      FREEHAND_POLYGON: 'freehandpolygon',
      RECTANGLE: 'rectangle',
      POINT: 'point',
      TRIANGLE: 'triangle',
      Rectangle: 'rectangle'
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
      case this.PlotTypes.ARC:
        return new this.Plot.Arc(points, params)
      case this.PlotTypes.ELLIPSE:
        return new this.Plot.Ellipse(points, params)
      case this.PlotTypes.CURVE:
        return new this.Plot.Curve(points, params)
      case this.PlotTypes.CLOSED_CURVE:
        return new this.Plot.ClosedCurve(points, params)
      case this.PlotTypes.LUNE:
        return new this.Plot.Lune(points, params)
      case this.PlotTypes.SECTOR:
        return new this.Plot.Sector(points, params)
      case this.PlotTypes.GATHERING_PLACE:
        return new this.Plot.GatheringPlace(points, params)
      case this.PlotTypes.STRAIGHT_ARROW:
        return new this.Plot.StraightArrow(points, params)
      case this.PlotTypes.ASSAULT_DIRECTION:
        return new this.Plot.AssaultDirection(points, params)
      case this.PlotTypes.ATTACK_ARROW:
        return new this.Plot.AttackArrow(points, params)
      case this.PlotTypes.FINE_ARROW:
        return new this.Plot.FineArrow(points, params)
      case this.PlotTypes.CIRCLE:
        return new this.Plot.Circle(points, params)
      case this.PlotTypes.DOUBLE_ARROW:
        return new this.Plot.DoubleArrow(points, params)
      case this.PlotTypes.TAILED_ATTACK_ARROW:
        return new this.Plot.TailedAttackArrow(points, params)
      case this.PlotTypes.SQUAD_COMBAT:
        return new this.Plot.SquadCombat(points, params)
      case this.PlotTypes.TAILED_SQUAD_COMBAT:
        return new this.Plot.TailedSquadCombat(points, params)
      case this.PlotTypes.FREEHAND_LINE:
        return new this.Plot.FreehandLine(points, params)
      case this.PlotTypes.FREEHAND_POLYGON:
        return new this.Plot.FreehandPolygon(points, params)
      case this.PlotTypes.POLYGON:
        return new this.Plot.Polygon(points, params)
      case this.PlotTypes.POLYLINE:
        return new this.Plot.Polyline(points, params)
      case this.PlotTypes.Rectangle:
        return new this.Plot.Rectangle(points, params)
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
Plot.PlotEdit = PlotEdit
Plot.PlotDraw = PlotDraw
export default Plot
