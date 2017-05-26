/**
 * Created by FDD on 2017/5/26.
 * @desc 分队战斗行动
 * @Inherits AttackArrow
 */

import PlotTypes from '../../Utils/PlotTypes'
import AttackArrow from './AttackArrow'
import * as PlotUtils from '../../Utils/utils'
import * as Constants from '../../Constants'
import {ol} from '../../../constants'
class SquadCombat extends AttackArrow {
  constructor (points, params) {
    super()
    AttackArrow.call(this, points, params)
    this.type = PlotTypes.SQUAD_COMBAT
    this.headHeightFactor = 0.18
    this.headWidthFactor = 0.3
    this.neckHeightFactor = 0.85
    this.neckWidthFactor = 0.15
    this.tailWidthFactor = 0.1
    this.set('params', params)
    this.setPoints(points)
  }

  /**
   * 执行动作
   */
  generate () {
    try {
      let pnts = this.getPoints()
      let tailPnts = this.getTailPoints(pnts)
      let headPnts = this.getArrowHeadPoints(pnts)
      let neckLeft = headPnts[0]
      let neckRight = headPnts[4]
      let bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor)
      let count = bodyPnts.length
      let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2))
      leftPnts.push(neckLeft)
      let rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count))
      rightPnts.push(neckRight)
      leftPnts = PlotUtils.getQBSplinePoints(leftPnts)
      rightPnts = PlotUtils.getQBSplinePoints(rightPnts)
      this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())])
    } catch (e) {
      console.log(e)
    }
  }

  getTailPoints (points) {
    let allLen = PlotUtils.getBaseLength(points)
    let tailWidth = allLen * this.tailWidthFactor
    let tailLeft = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, false)
    let tailRight = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, true)
    return ([tailLeft, tailRight])
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

  /**
   * 结束绘制
   */
  finishDrawing () {
  }
}

export default SquadCombat
