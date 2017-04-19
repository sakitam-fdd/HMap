import { ol } from '../constants'

class appDrag {
  constructor () {
    ol.interaction.Pointer.call(this, {
      handleDownEvent: this.handleDownEvent,
      handleDragEvent: this.handleDragEvent,
      handleMoveEvent: this.handleMoveEvent,
      handleUpEvent: this.handleUpEvent
    })

    this.customType = 'appDrag'
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
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `true` to start the drag sequence.
   */
  handleDownEvent (evt) {
    if (evt.originalEvent.button === 0) {
      let map = evt.map
      let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature
      })
      if (feature && feature.get('params') && feature.get('params').moveable) {
        this.coordinate_ = evt.coordinate
        this.feature_ = feature
      }
      map.dispatchEvent({
        type: 'mouseDownEvent',
        originEvent: evt,
        value: feature
      })
      return !!feature
    }
  }

  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   */
  handleDragEvent (evt) {
    if (!this.coordinate_) {
      return
    }
    let deltaX = evt.coordinate[0] - this.coordinate_[0]
    let deltaY = evt.coordinate[1] - this.coordinate_[1]
    let geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry())
    geometry.translate(deltaX, deltaY)
    this.coordinate_[0] = evt.coordinate[0]
    this.coordinate_[1] = evt.coordinate[1]
    this.feature_.dispatchEvent('featureMove')
  }

  /**
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
      if (feature) {
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
   * @return {boolean} `false` to stop the drag sequence.
   */
  handleUpEvent () {
    this.coordinate_ = null
    this.feature_ = null
    return false
  }
}

ol.inherits(appDrag, ol.interaction.Pointer)

export default appDrag
