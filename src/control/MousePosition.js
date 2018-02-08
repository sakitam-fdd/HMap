/**
 * Created by FDD on 2017/10/12.
 * @desc 坐标实时拾取
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
ol.control.MousePositionH = function (options = {}) {
  this.className_ = options.className !== undefined ? options.className : 'hmap-mouse-position'
  let element = htmlUtils.create('div', (this.className_ + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))
  let render = options.render ? options.render : ol.control.MousePositionH.render
  ol.control.Control.call(this, {
    element: element,
    render: render,
    target: options.target
  })

  Events.listen(this, 'change:' + ol.control.MousePositionH.Property_.PROJECTION, this.handleProjectionChanged_, this)

  if (options.coordinateFormat) {
    this.setCoordinateFormat(options.coordinateFormat)
  }
  if (options.projection) {
    this.setProjection(options.projection)
  }

  if (options.units) {
    this.setUnits(options.units)
  }
  /**
   * @private
   * @type {string}
   */
  this.undefinedHTML_ = options.undefinedHTML !== undefined ? options.undefinedHTML : ''

  /**
   * @private
   * @type {string}
   */
  this.renderedHTML_ = element.innerHTML

  /**
   * @private
   * @type {ol.proj.Projection}
   */
  this.mapProjection_ = null

  /**
   * @private
   * @type {?ol.TransformFunction}
   */
  this.transform_ = null

  /**
   * @private
   * @type {ol.Pixel}
   */
  this.lastMouseMovePixel_ = null

  /**
   * 是否显示跟随气泡（同步开启点击锚坐标）
   * @type {boolean}
   * @private
   */
  this.followMouse_ = options['followMouse'] === true ? options['followMouse'] : false

  /**
   * 当前气泡
   * @type {null}
   * @private
   */
  this.popver_ = null

  /**
   * 容器边界
   * @type {null}
   * @private
   */
  this._bounds = null
}

ol.inherits(ol.control.MousePositionH, ol.control.Control)

/**
 * 更新控件元素
 * @param mapEvent
 */
ol.control.MousePositionH.render = function (mapEvent) {
  let frameState = mapEvent.frameState
  if (!frameState) {
    this.mapProjection_ = null
  } else {
    if (this.mapProjection_ !== frameState.viewState.projection) {
      this.mapProjection_ = frameState.viewState.projection
      this.transform_ = null
    }
  }
  if (this.getMap() && this.lastMouseMovePixel_) {
    if (this.followMouse_) {
      this.followMousePopver_(this.lastMouseMovePixel_)
    } else {
      this.updateHTML_(this.lastMouseMovePixel_)
    }
  }
}

/**
 * 处理投影变化事件
 * @private
 */
ol.control.MousePositionH.prototype.handleProjectionChanged_ = function () {
  this.transform_ = null
}

/**
 * 获取投影转换函数
 * @returns {ol.CoordinateFormatType|undefined}
 */
ol.control.MousePositionH.prototype.getCoordinateFormat = function () {
  return (this.get(ol.control.MousePositionH.Property_.COORDINATE_FORMAT))
}

/**
 * 获取投影
 * @returns {ol.proj.Projection|undefined}
 */
ol.control.MousePositionH.prototype.getProjection = function () {
  return (this.get(ol.control.MousePositionH.Property_.PROJECTION))
}

/**
 * 处理鼠标移动事件
 * @param event
 */
ol.control.MousePositionH.prototype.handleMouseMove = function (event) {
  let map = this.getMap()
  if (map) {
    this.lastMouseMovePixel_ = map.getEventPixel(event)
    if (this.lastMouseMovePixel_) {
      if (this.followMouse_) {
        this.followMousePopver_(event)
      } else {
        this.updateHTML_(this.lastMouseMovePixel_)
      }
    }
  }
}

/**
 * 显示气泡
 * @param event
 * @private
 */
ol.control.MousePositionH.prototype.followMousePopver_ = function () {
  let html = this.getHTML_(this.lastMouseMovePixel_)
  let map = this.getMap()
  let coordinates = map.getCoordinateFromPixel(this.lastMouseMovePixel_)
  if (!this.popver_) {
    let ele = htmlUtils.create('div', this.className_ + '_overlay')
    ele.innerHTML = html
    this.popver_ = new ol.Overlay({
      element: ele,
      offset: [10, 0],
      position: coordinates,
      positioning: 'center-left'
    })
    map.addOverlay(this.popver_)
    map.render()
  } else {
    let _ele = this.popver_.getElement()
    _ele.innerHTML = html
    if (_ele.offsetWidth >= this._bounds.width - this.lastMouseMovePixel_[0]) {
      this.popver_.setPositioning('center-right')
      this.popver_.setOffset([-10, 0])
    } else {
      this.popver_.setPositioning('center-left')
      this.popver_.setOffset([10, 0])
    }
    this.popver_.setPosition(coordinates)
    this.popver_.setElement(_ele)
  }
}

/**
 * 处理鼠标移出视图事件
 * @param event
 */
ol.control.MousePositionH.prototype.handleMouseOut = function (event) {
  this.updateHTML_(null)
  this.lastMouseMovePixel_ = null
}

/**
 * setMap
 * @param map
 */
ol.control.MousePositionH.prototype.setMap = function (map) {
  ol.control.Control.prototype.setMap.call(this, map)
  if (map) {
    let viewport = map.getViewport()
    this._bounds = map.getTargetElement().getBoundingClientRect()
    Events.listen(viewport, 'mousemove', this.handleMouseMove, this)
    Events.listen(viewport, 'mouseout', this.handleMouseOut, this)
  }
}

/**
 * 设置坐标格式化函数
 * @param format
 */
ol.control.MousePositionH.prototype.setCoordinateFormat = function (format) {
  this.set(ol.control.MousePositionH.Property_.COORDINATE_FORMAT, format)
}

/**
 * 设置投影转换
 * @param projection
 */
ol.control.MousePositionH.prototype.setProjection = function (projection) {
  this.set(ol.control.MousePositionH.Property_.PROJECTION, ol.proj.get(projection))
}

/**
 * 设置显示单位
 * @param units
 */
ol.control.MousePositionH.prototype.setUnits = function (units) {
  this.set(ol.control.MousePositionH.Property_.PROJECTION, units)
}

/**
 * 更新页面控件
 * @param pixel
 * @private
 */
ol.control.MousePositionH.prototype.updateHTML_ = function (pixel) {
  let html = this.getHTML_(pixel)
  if (!this.renderedHTML_ || html !== this.renderedHTML_) {
    this.element.innerHTML = html
    this.renderedHTML_ = html
  }
}

/**
 * 获取dom
 * @param pixel
 * @returns {string|*}
 * @private
 */
ol.control.MousePositionH.prototype.getHTML_ = function (pixel) {
  let html = this.undefinedHTML_
  if (pixel && this.mapProjection_) {
    if (!this.transform_) {
      let projection = this.getProjection()
      if (projection) {
        this.transform_ = ol.proj.getTransformFromProjections(
          this.mapProjection_, projection)
      } else {
        this.transform_ = ol.control.MousePositionH.identityTransform
      }
    }
    let map = this.getMap()
    let coordinate = map.getCoordinateFromPixel(pixel)
    if (coordinate) {
      this.transform_(coordinate, coordinate)
      let coordinateFormat = this.getCoordinateFormat()
      if (coordinateFormat) {
        html = coordinateFormat(coordinate)
      } else {
        html = ol.control.MousePositionH.Property_.UNITS[0] + '：' + coordinate[0] +
          ' ' + ol.control.MousePositionH.Property_.UNITS[1] + '：' + coordinate[1]
      }
    }
  }
  return html
}

/**
 * 属性
 * @type {{PROJECTION: string, COORDINATE_FORMAT: string}}
 * @private
 */
ol.control.MousePositionH.Property_ = {
  PROJECTION: 'projection',
  COORDINATE_FORMAT: 'coordinateFormat',
  UNITS: ['经度', '纬度']
}

/**
 * 转换
 * @param input
 * @param output
 * @param dimension
 * @returns {*}
 */
ol.control.MousePositionH.identityTransform = function (input, output, dimension) {
  if (output !== undefined && input !== output) {
    for (let i = 0, ii = input.length; i < ii; ++i) {
      output[i] = input[i]
    }
    input = output
  }
  return input
}

const olControlMousePosition = ol.control.MousePositionH
export default olControlMousePosition
