/**
 * Created by FDD on 2017/5/15.
 * @desc PlotDraw
 */

import { ol } from '../../constants'
import mixin from '../../utils/mixins'
import { MathDistance } from '../Utils/utils'
import EventType from './EventType'
import * as Events from '../../event/Events'
import Layer from '../../layer/Layer'
import Plot from '../index'
import Style from '../../style/Style'
import PlotTypes from '../Utils/PlotTypes'
const Observable = ol.Observable
class PlotDraw extends mixin(Observable, Plot, Layer, Style) {
  constructor (map, params) {
    super()
    ol.Observable.call(this, [])
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    this.options = params || {}
    /**
     * 交互点
     * @type {null}
     */
    this.points = null
    /**
     * 当前标绘工具
     * @type {null}
     */
    this.plot = null
    /**
     * 当前要素
     * @type {null}
     */
    this.feature = null
    /**
     * 标绘类型
     * @type {null}
     */
    this.plotType = null
    /**
     * 当前标绘参数
     * @type {null}
     */
    this.plotParams = null
    /**
     * 当前地图视图
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport()
    /**
     * 地图双击交互
     * @type {null}
     */
    this.dblClickZoomInteraction = null

    /**
     * 绘制OverLay
     * @type {null}
     */
    this.drawOverlay = null

    /**
     * 事件监听器
     * @type {*}
     */
    this.Observable = new ol.Object()

    /**
     * 创建图层名称
     * @type {string}
     */
    this.layerName = ((this.options && this.options['layerName']) ? this.options['layerName'] : 'GISPLOTLAYER')

    /**
     * 当前矢量图层
     * @type {*}
     */
    this.drawLayer = this.createVectorLayer(this.layerName, {
      create: true
    })
  }

  /**
   * 激活工具
   * @param type
   * @param params
   */
  active (type, params) {
    this.disActive()
    this.deactiveMapTools()
    this.map.on('click', this.mapFirstClickHandler, this)
    this.plotType = type
    this.plotParams = params || {}
  }

  /**
   * 取消激活状态
   */
  disActive () {
    this.removeEventHandlers()
    this.map.removeLayer(this.drawOverlay)
    this.points = []
    this.plot = null
    this.feature = null
    this.plotType = null
    this.plotParams = null
    this.activateMapTools()
  }

  /**
   * PLOT是否处于激活状态
   * @returns {boolean}
   */
  isDrawing () {
    return (this.plotType !== null)
  }

  /**
   * 地图事件处理
   * 激活工具后第一次点击事件
   * @param event
   */
  mapFirstClickHandler (event) {
    this.points.push(event.coordinate)
    this.plot = this.createPlot(this.plotType, this.points, this.plotParams)
    this.plot.setMap(this.map)
    this.feature = new ol.Feature(this.plot)
    this.drawLayer.getSource().addFeature(this.feature)
    this.map.un('click', this.mapFirstClickHandler, this)
    if (this.plotType === PlotTypes.POINT || this.plotType === PlotTypes.PENNANT) {
      this.addPointStyle(this.feature, this.plotParams)
      this.plot.finishDrawing()
      this.drawEnd(event)
    } else {
      this.map.on('click', this.mapNextClickHandler, this)
      if (!this.plot.freehand) {
        this.map.on('dblclick', this.mapDoubleClickHandler, this)
      }
      Events.listen(this.mapViewport, EventType.MOUSEMOVE, this.mapMouseMoveHandler, this, false)
    }
    if (this.plotType && this.feature) {
      this.plotParams['plotType'] = this.plotType
      this.feature.setProperties(this.plotParams)
    }
  }

  /**
   * 添加点的样式
   * @param feature
   * @param params
   */
  addPointStyle (feature, params) {
    let style = this.getStyleByPoint(params)
    feature.setStyle(style)
  }

  /**
   * 地图点击事件处理
   * @param event
   * @returns {boolean}
   */
  mapNextClickHandler (event) {
    if (!this.plot.freehand) {
      if (MathDistance(event.coordinate, this.points[this.points.length - 1]) < 0.0001) {
        return false
      }
    }
    this.points.push(event.coordinate)
    this.plot.setPoints(this.points)
    if (this.plot.fixPointCount === this.plot.getPointCount()) {
      this.mapDoubleClickHandler(event)
    }
    if (this.plot && this.plot.freehand) {
      this.mapDoubleClickHandler(event)
    }
  }

  /**
   * 地图双击事件处理
   * @param event
   */
  mapDoubleClickHandler (event) {
    event.preventDefault()
    this.plot.finishDrawing()
    this.drawEnd(event)
  }

  /**
   * 地图事件处理
   * 鼠标移动事件
   * @param event
   * @returns {boolean}
   */
  mapMouseMoveHandler (event) {
    let coordinate = this.map.getCoordinateFromPixel([event.offsetX, event.offsetY])
    if (MathDistance(coordinate, this.points[this.points.length - 1]) < 0.0001) {
      return false
    }
    if (!this.plot.freehand) {
      let pnts = this.points.concat([coordinate])
      this.plot.setPoints(pnts)
    } else {
      this.points.push(coordinate)
      this.plot.setPoints(this.points)
    }
  }

  /**
   * 移除事件监听
   */
  removeEventHandlers () {
    this.map.un('click', this.mapFirstClickHandler, this)
    this.map.un('click', this.mapNextClickHandler, this)
    Events.unlisten(this.mapViewport, EventType.MOUSEMOVE, this.mapMouseMoveHandler, this)
    this.map.un('dblclick', this.mapDoubleClickHandler, this)
  }

  /**
   * 绘制结束
   */
  drawEnd (event) {
    this.Observable.dispatchEvent({
      type: 'drawEnd',
      event: event,
      feature: this.feature
    })
    if (this.feature && this.options['isClear']) {
      this.drawLayer.getSource().removeFeature(this.feature)
    }
    this.activateMapTools()
    this.removeEventHandlers()
    this.map.removeOverlay(this.drawOverlay)
    this.points = []
    this.plot = null
    this.plotType = null
    this.plotParams = null
    this.feature = null
  }

  /**
   * 添加要素
   */
  addFeature () {
    this.feature = new ol.Feature(this.plot)
    if (this.feature && this.drawLayer) {
      this.drawLayer.getSource().addFeature(this.feature)
    }
  }

  /**
   * 取消激活地图交互工具
   */
  deactiveMapTools () {
    let interactions = this.map.getInteractions().getArray()
    interactions.every(item => {
      if (item instanceof ol.interaction.DoubleClickZoom) {
        this.dblClickZoomInteraction = item
        this.map.removeInteraction(item)
        return false
      } else {
        return true
      }
    })
  }

  /**
   * 激活已取消的地图工具
   * 还原之前状态
   */
  activateMapTools () {
    if (this.dblClickZoomInteraction && this.dblClickZoomInteraction instanceof ol.interaction.DoubleClickZoom) {
      this.map.addInteraction(this.dblClickZoomInteraction)
      this.dblClickZoomInteraction = null
    }
  }
}

export default PlotDraw
