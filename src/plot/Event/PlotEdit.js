import { ol } from '../../constants'
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

  initHelperDom () {
    if (!this.map || !this.activePlot) {
      return false
    }
    var parent = this.getMapParentElement()
    if (!parent) {
      return false
    }
    var hiddenDiv = P.DomUtils.createHidden('div', parent, this.Constants.HELPER_HIDDEN_DIV)
    var cPnts = this.getControlPoints()
    for (var i = 0; i < cPnts.length; i++) {
      var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i
      // P.DomUtils.create('div', this.Constants.HELPER_CONTROL_POINT_DIV, hiddenDiv, id)
      this.elementTable[id] = i
    }
  }

  getMapParentElement () {
    var mapElement = this.map.getTargetElement()
    if (!mapElement) {
      return false
    }
    return mapElement.parentNode
  }

  destroyHelperDom () {
    if (this.controlPoints) {
      for (var i = 0; i < this.controlPoints.length; i++) {
        this.map.removeOverlay(this.controlPoints[i])
        var element = P.DomUtils.get(this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i)
        if (element) {
          P.DomUtils.removeListener(element, 'mousedown', this.controlPointMouseDownHandler, this)
          P.DomUtils.removeListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this)
        }
      }
      this.controlPoints = null
    }
    var parent = this.getMapParentElement()
    var hiddenDiv = P.DomUtils.get(this.Constants.HELPER_HIDDEN_DIV)
    if (hiddenDiv && parent) {
      P.DomUtils.remove(hiddenDiv, parent)
    }
  }

  initControlPoints () {
    if (!this.map) {
      return false
    }
    this.controlPoints = []
    var cPnts = this.getControlPoints()
    for (var i = 0; i < cPnts.length; i++) {
      var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i
      var element = ''
      var pnt = new ol.Overlay({
        id: id,
        position: cPnts[i],
        positioning: 'center-center',
        element: element
      })
      this.controlPoints.push(pnt)
      this.map.addOverlay(pnt)
      // P.DomUtils.addListener(element, 'mousedown', this.controlPointMouseDownHandler, this)
      // P.DomUtils.addListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this)
    }
  }

  controlPointMouseMoveHandler2 (e) {
    e.stopImmediatePropagation()
  }

  controlPointMouseDownHandler (e) {
    var id = e.target.id
    this.activeControlPointId = id
    // ol.events.listen(this.mapViewport, P.Event.EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, false, this)
    // ol.events.listen(this.mapViewport, P.Event.EventType.MOUSEUP, this.controlPointMouseUpHandler, false, this)
  }

  controlPointMouseMoveHandler (e) {
    var coordinate = this.map.getCoordinateFromPixel([e.offsetX, e.offsetY])
    if (this.activeControlPointId) {
      var plot = this.activePlot.getGeometry()
      var index = this.elementTable[this.activeControlPointId]
      plot.updatePoint(coordinate, index)
      var overlay = this.map.getOverlayById(this.activeControlPointId)
      overlay.setPosition(coordinate)
    }
  }

  controlPointMouseUpHandler (e) {
    // ol.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this)
    // ol.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEUP, this.controlPointMouseUpHandler, this)
  }

  activate (plot) {
    if (!plot || !(plot instanceof ol.Feature) || plot === this.activePlot) {
      return false
    }
    var geom = plot.getGeometry()
    if (!geom.isPlot()) {
      return
    }
    this.deactivate()
    this.activePlot = plot
    setTimeout(function () {
      // self.dispatchEvent(new P.Event.PlotEditEvent(P.Event.PlotEditEvent.ACTIVE_PLOT_CHANGE, self.activePlot))
    }, 500)
    this.map.on('pointermove', this.plotMouseOverOutHandler, this)
    this.initHelperDom()
    this.initControlPoints()
  }

  getControlPoints () {
    if (!this.activePlot) {
      return []
    }
    var geom = this.activePlot.getGeometry()
    return geom.getPoints()
  }

  plotMouseOverOutHandler (e) {
    var feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
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
  }

  plotMouseDownHandler (e) {
    this.ghostControlPoints = this.getControlPoints()
    this.startPoint = e.coordinate
    this.disableMapDragPan()
    this.map.on('pointerup', this.plotMouseUpHandler, this)
    this.map.on('pointerdrag', this.plotMouseMoveHandler, this)
  }

  plotMouseMoveHandler (e) {
    var point = e.coordinate
    var dx = point[0] - this.startPoint[0]
    var dy = point[1] - this.startPoint[1]
    var newPoints = []
    for (var i = 0; i < this.ghostControlPoints.length; i++) {
      var p = this.ghostControlPoints[i]
      var coordinate = [p[0] + dx, p[1] + dy]
      newPoints.push(coordinate)
      var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i
      var overlay = this.map.getOverlayById(id)
      overlay.setPosition(coordinate)
      overlay.setPositioning('center-center')
    }
    var plot = this.activePlot.getGeometry()
    plot.setPoints(newPoints)
  }

  plotMouseUpHandler (e) {
    this.enableMapDragPan()
    this.map.un('pointerup', this.plotMouseUpHandler, this)
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this)
  }

  disconnectEventHandlers () {
    this.map.un('pointermove', this.plotMouseOverOutHandler, this)
    ol.events.unlisten(this.mapViewport, '',
      this.controlPointMouseMoveHandler, this)
    ol.events.unlisten(this.mapViewport, '',
      this.controlPointMouseUpHandler, this)
    this.map.un('pointerdown', this.plotMouseDownHandler, this)
    this.map.un('pointerup', this.plotMouseUpHandler, this)
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this)
  }

  deactivate () {
    this.activePlot = null
    this.mouseOver = false
    this.destroyHelperDom()
    this.disconnectEventHandlers()
    this.elementTable = {}
    this.activeControlPointId = null
    this.startPoint = null
  }

  disableMapDragPan () {
    var interactions = this.map.getInteractions()
    var length = interactions.getLength()
    for (var i = 0; i < length; i++) {
      var item = interactions.item(i)
      if (item instanceof ol.interaction.DragPan) {
        this.mapDragPan = item
        item.setActive(false)
        break
      }
    }
  }

  enableMapDragPan () {
    if (this.mapDragPan !== null) {
      this.mapDragPan.setActive(true)
      this.mapDragPan = null
    }
  }
}
export default PlotEdit
