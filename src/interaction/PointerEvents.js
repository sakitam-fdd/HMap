/**
 * Created by FDD on 2017/9/18.
 * @desc 鼠标交互事件处理
 */
import { EVENT_TYPE, INTERNAL_KEY } from '../constants'
class PointerEvents extends (ol.interaction.Pointer) {
  constructor () {
    super()
    ol.interaction.Pointer.call(this, {
      handleDownEvent: this.handleDownEvent,
      handleDragEvent: this.handleDragEvent,
      handleMoveEvent: this.handleMoveEvent,
      handleUpEvent: this.handleUpEvent
    })

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
  }

  /**
   * 处理鼠标按下事件
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `true` to start the drag sequence.
   */
  handleDownEvent (evt) {
    if (evt.originalEvent.button === 0) {
      let map = evt.map
      let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature
      })
      if (feature && this.isSelectSupported(feature)) {
        this.coordinate_ = evt.coordinate
        this.feature_ = feature
        this.feature_.dispatchEvent({
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
  handleDragEvent (evt) {
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
  handleMoveEvent (evt) {
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
  handleUpEvent (evt) {
    if (this.feature_ && this.isSelectSupported(this.feature_)) {
      this.feature_.dispatchEvent({
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
  isSelectSupported (feature) {
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
  isMoveSupported (feature) {
    let re_ = false
    if (feature && feature instanceof ol.Feature) {
      let _params = feature.get('params')
      if (_params && _params[INTERNAL_KEY.MOVEABLE]) {
        re_ = true
      }
    }
    return re_
  }
}
export default PointerEvents
