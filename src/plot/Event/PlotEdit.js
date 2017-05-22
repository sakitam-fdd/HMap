import { ol } from '../../constants'
import EventType from './EventType'
import { DomUtil } from '../../dom'
import * as Events from '../../event/Events'
const Observable = ol.Observable
class PlotEdit extends Observable {
  constructor (map) {
    super()
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    /**
     * 当前地图容器
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport()
    /**
     * 激活绘制工具
     * @type {null}
     */
    this.activePlot = null
    /**
     * 开始点
     * @type {null}
     */
    this.startPoint = null
    /**
     * clone的控制点
     * @type {null}
     */
    this.ghostControlPoints = null
    /**
     * 控制点
     * @type {null}
     */
    this.controlPoints = null
    /**
     * 鼠标移入
     * @type {boolean}
     */
    this.mouseOver = false
    /**
     * 元素
     * @type {{}}
     */
    this.elementTable = {}
    /**
     * 当前激活的控制点的ID
     * @type {null}
     */
    this.activeControlPointId = null
    /**
     * 地图拖拽交互
     * @type {null}
     */
    this.mapDragPan = null
  }

  /**
   * 初始化提示DOM
   * @returns {boolean}
   */
  initHelperDom () {
    if (!this.map || !this.activePlot) {
      return false
    }
    let parent = this.getMapParentElement()
    if (!parent) {
      return false
    } else {
      let hiddenDiv = DomUtil.createHidden('div', parent, 'plot-helper-hidden-div')
      let cPnts = this.getControlPoints()
      if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
        cPnts.forEach((item, index) => {
          let id = 'plot-helper-control-point-div' + '-' + index
          DomUtil.create('div', 'plot-helper-control-point-div', hiddenDiv, id)
          this.elementTable[id] = index
        })
      }
    }
  }

  /**
   * 获取地图元素的父元素
   * @returns {*}
   */
  getMapParentElement () {
    let mapElement = this.map.getTargetElement()
    if (!mapElement) {
      return false
    } else {
      return mapElement.parentNode
    }
  }

  /**
   * 销毁帮助提示DOM
   */
  destroyHelperDom () {
    if (this.controlPoints && Array.isArray(this.controlPoints) && this.controlPoints.length > 0) {
      this.controlPoints.forEach((item, index) => {
        if (item && item instanceof ol.Overlay) {
          this.map.removeOverlay(item)
        }
        let element = DomUtil.get('plot-helper-control-point-div' + '-' + index)
        if (element) {
          DomUtil.removeListener(element, 'mousedown', this.controlPointMouseDownHandler, this)
          DomUtil.removeListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this)
        }
      })
      this.controlPoints = []
    }
    let parent = this.getMapParentElement()
    let hiddenDiv = DomUtil.get('plot-helper-hidden-div')
    if (hiddenDiv && parent) {
      DomUtil.remove(hiddenDiv, parent)
    }
  }

  /**
   * 初始化要素控制点
   */
  initControlPoints () {
    this.controlPoints = []
    let cPnts = this.getControlPoints()
    if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
      cPnts.forEach((item, index) => {
        let id = 'plot-helper-control-point-div' + '-' + index
        this.elementTable[id] = index
        let element = DomUtil.get(id)
        let pnt = new ol.Overlay({
          id: id,
          position: cPnts[index],
          positioning: 'center-center',
          element: element
        })
        this.controlPoints.push(pnt)
        this.map.addOverlay(pnt)
        this.map.render()
        DomUtil.addListener(element, 'mousedown', this.controlPointMouseDownHandler, this)
        DomUtil.addListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this)
      })
    }
  }

  /**
   * 对控制点的移动事件
   * @param e
   */
  controlPointMouseMoveHandler2 (e) {
    e.stopImmediatePropagation()
  }

  /**
   * 对控制点的鼠标按下事件
   * @param e
   */
  controlPointMouseDownHandler (e) {
    let id = e.target.id
    this.activeControlPointId = id
    Events.listen(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this, false)
    Events.listen(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler, this, false)
  }

  /**
   * 对控制点的移动事件
   * @param e
   */
  controlPointMouseMoveHandler (e) {
    let coordinate = this.map.getCoordinateFromPixel([e.offsetX, e.offsetY])
    if (this.activeControlPointId) {
      let plot = this.activePlot.getGeometry()
      let index = this.elementTable[this.activeControlPointId]
      plot.updatePoint(coordinate, index)
      let overlay = this.map.getOverlayById(this.activeControlPointId)
      overlay.setPosition(coordinate)
    }
  }

  /**
   * 对控制点的鼠标抬起事件
   * @param e
   */
  controlPointMouseUpHandler (e) {
    Events.unlisten(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this)
    Events.unlisten(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler, this)
  }

  /**
   * 激活工具
   * @param plot
   * @returns {boolean}
   */
  activate (plot) {
    try {
      if (!plot || !(plot instanceof ol.Feature) || plot === this.activePlot) {
        return false
      } else {
        let geom = plot.getGeometry()
        if (!geom.isPlot()) {
          return false
        } else {
          this.deactivate()
          this.activePlot = plot
          window.setTimeout(() => {
            // this.dispatchEvent(new EditEvent(EditEvent.ACTIVE_PLOT_CHANGE, this.activePlot))
          }, 500)
          this.map.on('pointermove', this.plotMouseOverOutHandler, this)
          this.initHelperDom()
          this.initControlPoints()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取要素的控制点
   * @returns {Array}
   */
  getControlPoints () {
    let points = []
    if (this.activePlot) {
      let geom = this.activePlot.getGeometry()
      if (geom) {
        points = geom.getPoints()
      }
    }
    return points
  }

  /**
   * 鼠标移出要编辑的要素范围
   * @param e
   * @returns {T|undefined}
   */
  plotMouseOverOutHandler (e) {
    try {
      let feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        return feature
      })
      if (feature && feature === this.activePlot) {
        if (!this.mouseOver) {
          this.mouseOver = true
          this.map.getViewport().style.cursor = 'move'
          this.map.on('pointerdown', this.plotMouseDownHandler, this)
        }
      } else {
        if (this.mouseOver) {
          this.mouseOver = false
          this.map.getViewport().style.cursor = 'default'
          this.map.un('pointerdown', this.plotMouseDownHandler, this)
        }
      }
      return feature
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 在要编辑的要素按下鼠标按键
   * @param e
   */
  plotMouseDownHandler (e) {
    this.ghostControlPoints = this.getControlPoints()
    this.startPoint = e.coordinate
    this.disableMapDragPan()
    this.map.on('pointerup', this.plotMouseUpHandler, this)
    this.map.on('pointerdrag', this.plotMouseMoveHandler, this)
  }

  /**
   * 在要编辑的要素上移动鼠标
   * @param e
   */
  plotMouseMoveHandler (e) {
    try {
      let point = e.coordinate
      let [dx, dy, newPoints] = [(point[0] - this.startPoint[0]), (point[1] - this.startPoint[1]), []]
      if (this.ghostControlPoints && Array.isArray(this.ghostControlPoints) && this.ghostControlPoints.length > 0) {
        this.ghostControlPoints.forEach((item, index) => {
          let p = this.ghostControlPoints[index]
          let coordinate = [p[0] + dx, p[1] + dy]
          newPoints.push(coordinate)
          let id = 'plot-helper-control-point-div' + '-' + index
          let overlay = this.map.getOverlayById(id)
          overlay.setPosition(coordinate)
          overlay.setPositioning('center-center')
        })
      }
      let plot = this.activePlot.getGeometry()
      plot.setPoints(newPoints)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 鼠标抬起事件
   * @param e
   */
  plotMouseUpHandler (e) {
    this.enableMapDragPan()
    this.map.un('pointerup', this.plotMouseUpHandler, this)
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this)
  }

  /**
   * 取消事件关联
   */
  disconnectEventHandlers () {
    this.map.un('pointermove', this.plotMouseOverOutHandler, this)
    Events.unlisten(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this)
    Events.unlisten(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler, this)
    this.map.un('pointerdown', this.plotMouseDownHandler, this)
    this.map.un('pointerup', this.plotMouseUpHandler, this)
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this)
  }

  /**
   * 取消激活工具
   */
  deactivate () {
    this.activePlot = null
    this.mouseOver = false
    this.destroyHelperDom()
    this.disconnectEventHandlers()
    this.elementTable = {}
    this.activeControlPointId = null
    this.startPoint = null
  }

  /**
   * 禁止地图的拖拽平移
   */
  disableMapDragPan () {
    let interactions = this.map.getInteractions().getArray()
    interactions.every(item => {
      if (item instanceof ol.interaction.DragPan) {
        this.mapDragPan = item
        item.setActive(false)
        this.map.removeInteraction(item)
        return false
      } else {
        return true
      }
    })
  }

  /**
   * 激活地图的拖拽平移
   */
  enableMapDragPan () {
    if (this.mapDragPan && this.mapDragPan instanceof ol.interaction.DragPan) {
      this.mapDragPan.setActive(true)
      this.map.addInteraction(this.mapDragPan)
      this.mapDragPan = null
    }
  }
}
export default PlotEdit
