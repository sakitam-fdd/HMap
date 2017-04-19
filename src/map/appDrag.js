import { ol } from '../constants'
var app = {}
app.Drag = function () {
  ol.interaction.Pointer.call(this, {
    handleDownEvent: app.Drag.prototype.handleDownEvent,
    handleDragEvent: app.Drag.prototype.handleDragEvent,
    handleMoveEvent: app.Drag.prototype.handleMoveEvent,
    handleUpEvent: app.Drag.prototype.handleUpEvent
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

ol.inherits(app.Drag, ol.interaction.Pointer)

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function (evt) {
  if (evt.originalEvent.button === 0) {
    let map = evt.map
    let feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature) {
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
app.Drag.prototype.handleDragEvent = function (evt) {
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
app.Drag.prototype.handleMoveEvent = function (evt) {
  if (this.cursor_) {
    let map = evt.map
    let feature = null
    if (this.feature_) {
      feature = this.feature_
    } else {
      feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
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
app.Drag.prototype.handleUpEvent = function () {
  this.coordinate_ = null
  this.feature_ = null
  return false
}

export default app
