import { ol } from '../constants'
class Controls {
  _addControls (params) {
    let options = params || {}
    /* eslint new-cap: ["error", { "newIsCap": false }] */
    let control = new ol.control.defaults({
      attribution: (options['attribution'] === false ? options['attribution'] : true),
      rotate: (options['rotate'] === false ? options['rotate'] : true),
      zoom: (options['zoom'] === false ? options['zoom'] : true)
    })
    // 添加比例尺
    if (options['scaleLine']) {
      this._addScaleLine(options['scaleLine'], control)
    }
    return control
  }

  /**
   * 添加比例尺
   * @param options
   * @param control
   * @private
   */
  _addScaleLine (options, control) {
    if (!control) {
      control = this.map.getControls()
    }
    control.extend([
      new ol.control.ScaleLine({
        className: (options['className'] ? options['className'] : 'ol-scale-line'),
        minWidth: (options['minWidth'] && typeof options['minWidth'] === 'number' ? options['minWidth'] : 64),
        render: (options['render'] && typeof options['render'] === 'function' ? options['render'] : undefined),
        target: (options['target'] ? options['target'] : undefined),
        units: (options['units'] ? options['units'] : 'metric')
      }) // 比例尺控件
    ])
  }

  /**
   * 放大
   */
  zoomIn (duration) {
    let zoom = this.map.getView().getZoom()
    this.map.getView().animate({
      zoom: (zoom + 1),
      duration: ((duration && typeof duration === 'number') ? duration : 300)
    })
  }
  /**
   * 缩小
   */
  zoomOut (duration) {
    let zoom = this.map.getView().getZoom()
    this.map.getView().animate({
      zoom: (zoom - 1),
      duration: ((duration && typeof duration === 'number') ? duration : 300)
    })
  }

  zoomByDelta (delta, duration) {
    let view = this.map.getView()
    if (!view || !(view instanceof ol.View)) {
      return false
    } else {
      let currentResolution = view.getResolution()
      if (currentResolution) {
        let newResolution = view.constrainResolution(currentResolution, delta)
        if (duration > 0) {
          if (view.getAnimating()) {
            view.cancelAnimations()
          }
          view.animate({
            resolution: newResolution,
            duration: duration,
            easing: ol.easing.easeOut
          })
        } else {
          view.setResolution(newResolution)
        }
      }
    }
  }
}

export default Controls
