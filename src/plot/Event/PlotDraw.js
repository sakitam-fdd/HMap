/**
 * Created by FDD on 2017/5/15.
 * @desc PlotDraw
 */

import { ol } from '../../constants'
import { MathDistance } from '../Utils/utils'
const Observable = ol.Observable
class PlotDraw extends Observable {
  constructor (map) {
    super()
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
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
    this.dispatchEvent = new ol.Observable()
    /**
     * 当前默认样式
     * @type {ol.style.Style}
     */
    this.style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0,0,0,0.4)'
      }),
      stroke: new ol.style.Stroke({
        color: '#000000',
        width: 1.25
      })
    })
    this.drawLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: this.style
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
    this.plotParams = params
    this.map.addLayer(this.drawLayer)
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
   * 地图事件处理
   * 激活工具后第一次点击事件
   * @param event
   */
  mapFirstClickHandler (event) {
    this.points.push(event.coordinate)
    this.plot = this.createPlot(this.plotType, this.points, this.plotParams)
    this.plot.setMap(this.map)

    this.map.un('click', this.mapFirstClickHandler, this)
    this.map.on('click', this.mapNextClickHandler, this)
    if (!this.plot.freehand) {
      this.map.on('dblclick', this.mapDoubleClickHandler, this)
    }
    ol.events.listen(this.mapViewport, 'mousemove', this.mapMouseMoveHandler, false, this)
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
    ol.events.unlisten(this.mapViewport, 'mousemove', this.mapMouseMoveHandler, this)
    this.map.un('dblclick', this.mapDoubleClickHandler, this)
  }

  /**
   * 绘制结束
   */
  drawEnd (event) {
    if (this.feature) {
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
    this.dispatchEvent({
      type: 'drawEnd',
      originEvent: event,
      value: this.feature
    })
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
    if (this.dblClickZoomInteraction && this.dblClickZoomInteraction instanceof ol.interaction.interactions) {
      this.map.addInteraction(this.dblClickZoomInteraction)
      this.dblClickZoomInteraction = null
    }
  }
}

export default PlotDraw
