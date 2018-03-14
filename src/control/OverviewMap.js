/**
 * Created by FDD on 2017/10/12.
 * @desc 自定义鹰眼控件
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME, OVERVIEWMAP} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
ol.control.OverviewMapH = function (options = {}) {
  /**
   * @type {boolean}
   * @private
   */
  this.collapsed_ = options.collapsed !== undefined ? options.collapsed : true

  /**
   * @private
   * @type {boolean}
   */
  this.collapsible_ = options.collapsible !== undefined ? options.collapsible : true

  if (!this.collapsible_) {
    this.collapsed_ = false
  }
  let className = options.className !== undefined ? options.className : 'hmap-overview-map'
  let element = htmlUtils.create('div', className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE)

  /**
   * @type {Element}
   * @private
   */
  this.ovmapDiv_ = htmlUtils.create('div', 'hmap-overview-map-target', element)

  /**
   * 收起按钮
   * @type {Element}
   * @private
   */
  if (this.collapsible_) {
    this.collapsElement_ = htmlUtils.create('div', 'hmap-overview-map-button', element)
    Events.listen(this.collapsElement_, 'click', this.handleClick_, this)
  }

  /**
   * @type {ol.Map}
   * @private
   */
  this.ovmap_ = new ol.Map({
    controls: new ol.Collection(),
    interactions: new ol.Collection(),
    view: options.view
  })
  let render = options.render ? options.render : ol.control.OverviewMapH.render
  ol.control.Control.call(this, {
    element: element,
    render: render,
    target: options.target
  })
  this.addBoxControl_()
}

ol.inherits(ol.control.OverviewMapH, ol.control.Control)

/**
 * 添加图层
 * @param options
 * @private
 */
ol.control.OverviewMapH.prototype.addOptionLayers_ = function (options) {
  let ovmap = this.ovmap_
  if (options.layers) {
    options.layers.forEach(function (layer) {
      ovmap.addLayer(layer)
    }, this)
  }
}

/**
 * 计算鼠标位置
 * @param mousePosition
 * @returns {{clientX: number, clientY: *}}
 */
ol.control.OverviewMapH.computeDesiredMousePosition = function (mousePosition, overlayBox) {
  return {
    clientX: mousePosition.clientX - (overlayBox.offsetWidth / 2),
    clientY: mousePosition.clientY + (overlayBox.offsetHeight / 2)
  }
}

/**
 * 处理移动事件
 * @private
 */
ol.control.OverviewMapH.prototype.move_ = function (event) {
  const overlayBox = this.boxOverlay_.getElement()
  let coordinates = this.ovmap_.getEventCoordinate(ol.control.OverviewMapH.computeDesiredMousePosition(event, overlayBox))
  this.boxOverlay_.setPosition(coordinates)
}

/**
 * 移动结束事件
 * @param event
 * @private
 */
ol.control.OverviewMapH.prototype.endMoving_ = function (event) {
  let coordinates = this.ovmap_.getEventCoordinate(event)
  this.getMap().getView().setCenter(coordinates)
  Events.unListen(window, 'mousemove', this.move_, this)
  Events.unListen(window, 'mouseup', this.endMoving_, this)
}

/**
 * 添加事件
 * @private
 */
ol.control.OverviewMapH.prototype.addEvent_ = function () {
  Events.listen(window, 'mousemove', this.move_, this)
  Events.listen(window, 'mouseup', this.endMoving_, this)
}

/**
 * 添加box
 * @private
 */
ol.control.OverviewMapH.prototype.addBoxControl_ = function () {
  let box = htmlUtils.create('div', 'hmap-overview-map-box')
  Events.listen(box, 'mousedown', this.addEvent_, this)
  this.boxOverlay_ = new ol.Overlay({
    position: [0, 0],
    positioning: 'bottom-left',
    element: box
  })
  this.ovmap_.addOverlay(this.boxOverlay_)
}

/**
 * setMap
 * @param map
 */
ol.control.OverviewMapH.prototype.setMap = function (map) {
  let oldMap = this.getMap()
  if (map === oldMap) {
    return
  }
  if (oldMap) {
    let oldView = oldMap.getView()
    if (oldView) {
      this.unbindView_(oldView)
    }
    this.ovmap_.setTarget(null)
  }
  ol.control.Control.prototype.setMap.call(this, map)
  if (map) {
    this.ovmap_.setTarget(this.ovmapDiv_)
    Events.listen(map, 'propertychange', this.handleMapPropertyChange_, this)
    if (this.ovmap_.getLayers().getLength() === 0) {
      this.ovmap_.setLayerGroup(map.getLayerGroup())
    }
    let view = map.getView()
    if (view) {
      this.bindView_(view)
      if (this.isDef(view)) {
        this.ovmap_.updateSize()
        this.resetExtent_()
      }
    }
  }
}

/**
 * 判断视图是否定义
 * @param view
 * @returns {boolean}
 */
ol.control.OverviewMapH.prototype.isDef = function (view) {
  return !!view.getCenter() && view.getResolution() !== undefined
}

/**
 * 处理地图属性变化
 * @param event
 * @private
 */
ol.control.OverviewMapH.prototype.handleMapPropertyChange_ = function (event) {
  if (event.key === 'view') {
    let oldView = (event.oldValue)
    if (oldView) {
      this.unbindView_(oldView)
    }
    let newView = this.getMap().getView()
    this.bindView_(newView)
  }
}

/**
 * 注册视图变化事件
 * @param view
 * @private
 */
ol.control.OverviewMapH.prototype.bindView_ = function (view) {
  Events.listen(view, 'change:rotation', this.handleRotationChanged_, this)
}

/**
 * 取消视图事件绑定
 * @param view
 * @private
 */
ol.control.OverviewMapH.prototype.unbindView_ = function (view) {
  Events.unListen(view, 'change:rotation', this.handleRotationChanged_, this)
}

/**
 * 处理视图旋转
 * @private
 */
ol.control.OverviewMapH.prototype.handleRotationChanged_ = function () {
  this.ovmap_.getView().setRotation(this.getMap().getView().getRotation())
}

/**
 * 更新控件要素
 * @param mapEvent
 */
ol.control.OverviewMapH.render = function (mapEvent) {
  this.validateExtent_()
  this.updateBox_()
}

/**
 * 重新调整范围，避免过大或者过小
 * @private
 */
ol.control.OverviewMapH.prototype.validateExtent_ = function () {
  let map = this.getMap()
  let ovmap = this.ovmap_
  let mapSize = /** @type {ol.Size} */ (map.getSize())
  let view = map.getView()
  let extent = view.calculateExtent(mapSize)
  let ovmapSize = /** @type {ol.Size} */ (ovmap.getSize())
  let ovview = ovmap.getView()
  let ovextent = ovview.calculateExtent(ovmapSize)
  let topLeftPixel =
    ovmap.getPixelFromCoordinate(ol.extent.getTopLeft(extent))
  let bottomRightPixel =
    ovmap.getPixelFromCoordinate(ol.extent.getBottomRight(extent))
  let boxWidth = Math.abs(topLeftPixel[0] - bottomRightPixel[0])
  let boxHeight = Math.abs(topLeftPixel[1] - bottomRightPixel[1])
  let ovmapWidth = ovmapSize[0]
  let ovmapHeight = ovmapSize[1]
  if (boxWidth < ovmapWidth * OVERVIEWMAP.MIN_RATIO ||
    boxHeight < ovmapHeight * OVERVIEWMAP.MIN_RATIO ||
    boxWidth > ovmapWidth * OVERVIEWMAP.MAX_RATIO ||
    boxHeight > ovmapHeight * OVERVIEWMAP.MAX_RATIO) {
    this.resetExtent_()
  } else if (!ol.extent.containsExtent(ovextent, extent)) {
    this.recenter_()
  }
}

/**
 * 重新设置视图范围
 * @private
 */
ol.control.OverviewMapH.prototype.resetExtent_ = function () {
  if (OVERVIEWMAP.MAX_RATIO === 0 || OVERVIEWMAP.MIN_RATIO === 0) {
    return
  }
  let map = this.getMap()
  let ovmap = this.ovmap_
  let mapSize = /** @type {ol.Size} */ (map.getSize())
  let view = map.getView()
  let extent = view.calculateExtent(mapSize)
  let ovview = ovmap.getView()
  let steps = Math.log(OVERVIEWMAP.MAX_RATIO / OVERVIEWMAP.MIN_RATIO) / Math.LN2
  let ratio = 1 / (Math.pow(2, steps / 2) * OVERVIEWMAP.MIN_RATIO)
  this.scaleFromCenter(extent, ratio)
  ovview.fit(extent)
}

/**
 * 计算缩放
 * @param extent
 * @param value
 */
ol.control.OverviewMapH.prototype.scaleFromCenter = function (extent, value) {
  let deltaX = ((extent[2] - extent[0]) / 2) * (value - 1)
  let deltaY = ((extent[3] - extent[1]) / 2) * (value - 1)
  extent[0] -= deltaX
  extent[2] += deltaX
  extent[1] -= deltaY
  extent[3] += deltaY
}

/**
 * 重新设置视图中心
 * @private
 */
ol.control.OverviewMapH.prototype.recenter_ = function () {
  let map = this.getMap()
  let ovmap = this.ovmap_
  let view = map.getView()
  let ovview = ovmap.getView()
  ovview.setCenter(view.getCenter())
}

/**
 * Update the box using the main map extent
 * @private
 */
ol.control.OverviewMapH.prototype.updateBox_ = function () {
  let map = this.getMap()
  let ovmap = this.ovmap_
  let mapSize = /** @type {ol.Size} */ (map.getSize())
  let view = map.getView()
  let ovview = ovmap.getView()
  let rotation = view.getRotation()
  let overlay = this.boxOverlay_
  let box = this.boxOverlay_.getElement()
  let extent = view.calculateExtent(mapSize)
  let ovresolution = ovview.getResolution()
  let bottomLeft = ol.extent.getBottomLeft(extent)
  let topRight = ol.extent.getTopRight(extent)
  let rotateBottomLeft = this.calculateCoordinateRotate_(rotation, bottomLeft)
  overlay.setPosition(rotateBottomLeft)
  if (box) {
    box.style.width = Math.abs((bottomLeft[0] - topRight[0]) / ovresolution) + 'px'
    box.style.height = Math.abs((topRight[1] - bottomLeft[1]) / ovresolution) + 'px'
  }
}

/**
 * 计算坐标角度
 * @param rotation
 * @param coordinate
 * @returns {*}
 * @private
 */
ol.control.OverviewMapH.prototype.calculateCoordinateRotate_ = function (rotation, coordinate) {
  let coordinateRotate
  let map = this.getMap()
  let view = map.getView()
  let currentCenter = view.getCenter()
  if (currentCenter) {
    coordinateRotate = [
      coordinate[0] - currentCenter[0],
      coordinate[1] - currentCenter[1]
    ]
    ol.coordinate.rotate(coordinateRotate, rotation)
    ol.coordinate.add(coordinateRotate, currentCenter)
  }
  return coordinateRotate
}

/**
 * 处理点击事件
 * @param event
 * @private
 */
ol.control.OverviewMapH.prototype.handleClick_ = function (event) {
  event.preventDefault()
  this.handleToggle_()
}

/**
 * @private
 */
ol.control.OverviewMapH.prototype.handleToggle_ = function () {
  if (this.collapsed_) {
    this.collapsed_ = false
    event.target.style.backgroundPosition = '-40px -405px'
    this.element.style.width = '17px'
    this.element.style.height = '17px'
  } else {
    this.collapsed_ = true
    event.target.style.backgroundPosition = '-40px -386px'
    this.element.style.width = '120px'
    this.element.style.height = '120px'
  }
  let ovmap = this.ovmap_
  if (!this.collapsed_ && !ovmap) {
    ovmap.updateSize()
    this.resetExtent_()
    Events.listenOnce(ovmap, 'postrender', this.updateBox_, this)
  }
}

/**
 * 返回鹰眼是否可折叠
 * @returns {*|boolean}
 */
ol.control.OverviewMapH.prototype.getCollapsible = function () {
  return this.collapsible_
}

/**
 * 设置鹰眼是否可折叠
 * @param collapsible
 */
ol.control.OverviewMapH.prototype.setCollapsible = function (collapsible) {
  if (this.collapsible_ === collapsible) {
    return
  }
  this.collapsible_ = collapsible
  if (!collapsible && this.collapsed_) {
    this.handleToggle_()
  }
}

/**
 * 设置鹰眼收起状态
 * @param collapsed
 */
ol.control.OverviewMapH.prototype.setCollapsed = function (collapsed) {
  if (!this.collapsible_ || this.collapsed_ === collapsed) {
    return
  }
  this.handleToggle_()
}

/**
 * 判断鹰眼是否收起
 * @returns {boolean|*}
 */
ol.control.OverviewMapH.prototype.getCollapsed = function () {
  return this.collapsed_
}

/**
 * 返回当前鹰眼
 * @returns {ol.Map}
 */
ol.control.OverviewMapH.prototype.getOverviewMap = function () {
  return this.ovmap_
}

const olControlOverviewMap = ol.control.OverviewMapH
export default olControlOverviewMap
