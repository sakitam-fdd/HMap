/**
 * Created by FDD on 2017/9/18.
 * @desc 鼠标交互事件处理
 */
import ol from 'openlayers'
import { EVENT_TYPE, INTERNAL_KEY } from '../constants'
ol.interaction.PointerEvents = function () {
  /**
   * @type {ol.Pixel}
   * @private
   */
  this.coordinate_ = null

  /**
   * @type {string|undefined}
   * @private
   */
  this.cursor_ = 'pointer'

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = null

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined

  ol.interaction.Pointer.call(this, {
    handleDownEvent: ol.interaction.PointerEvents.handleDownEvent,
    handleDragEvent: ol.interaction.PointerEvents.handleDragEvent,
    handleMoveEvent: ol.interaction.PointerEvents.handleMoveEvent,
    handleUpEvent: ol.interaction.PointerEvents.handleUpEvent
  })
}

ol.inherits(ol.interaction.PointerEvents, ol.interaction.Pointer)

/**
 * 处理鼠标按下事件
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.PointerEvents.handleDownEvent = function (evt) {
  if (evt.originalEvent.button === 0) {
    let map = evt.map
    let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature
    })
    if (feature && this.isSelectSupported(feature)) {
      this.coordinate_ = evt.coordinate
      this.feature_ = feature
      map.dispatchEvent({
        type: EVENT_TYPE.FEATUREONMOUSEDOWN,
        originEvent: evt,
        value: feature
      })
    }
    return !!this.feature_
  }
}

/**
 * 处理鼠标拖拽事件
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ol.interaction.PointerEvents.handleDragEvent = function (evt) {
  if (this.coordinate_ && this.isMoveSupported(this.feature_)) {
    let deltaX = evt.coordinate[0] - this.coordinate_[0]
    let deltaY = evt.coordinate[1] - this.coordinate_[1]
    let geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry())
    geometry.translate(deltaX, deltaY)
    this.coordinate_[0] = evt.coordinate[0]
    this.coordinate_[1] = evt.coordinate[1]
    this.feature_.dispatchEvent(EVENT_TYPE.FEATUREONMOVE)
  }
}

/**
 * 处理鼠标移动事件
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol.interaction.PointerEvents.handleMoveEvent = function (evt) {
  if (this.cursor_) {
    let map = evt.map
    let feature = null
    if (this.feature_) {
      feature = this.feature_
    } else {
      feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature
      })
    }
    let element = evt.map.getTargetElement()
    if (feature && this.isSelectSupported(feature)) {
      if (element.style.cursor !== this.cursor_) {
        this.previousCursor_ = element.style.cursor
        element.style.cursor = this.cursor_
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_
      this.previousCursor_ = undefined
    }
  }
}

/**
 * 处理鼠标抬起事件
 * @return {boolean} `false` to stop the drag sequence.
 */
ol.interaction.PointerEvents.handleUpEvent = function (evt) {
  let map = evt.map
  if (this.feature_ && this.isSelectSupported(this.feature_)) {
    map.dispatchEvent({
      type: EVENT_TYPE.FEATUREONMOUSEUP,
      originEvent: evt,
      value: this.feature_
    })
  }
  this.coordinate_ = null
  this.feature_ = null
  return false
}

/**
 * 是否支持选中事件
 * @param feature
 * @returns {boolean}
 */
ol.interaction.PointerEvents.prototype.isSelectSupported = function (feature) {
  let re_ = false
  if (feature && feature instanceof ol.Feature) {
    let _params = feature.get('params')
    if (_params && _params[INTERNAL_KEY.SELECTABLE]) {
      re_ = true
    }
  }
  return re_
}

/**
 * 是否支持移动事件
 * @param feature
 * @returns {boolean}
 */
ol.interaction.PointerEvents.prototype.isMoveSupported = function (feature) {
  let re_ = false
  if (feature && feature instanceof ol.Feature) {
    let _params = feature.get('params')
    if (_params && _params[INTERNAL_KEY.MOVEABLE]) {
      re_ = true
    }
  }
  return re_
}

export default ol.interaction.PointerEvents
