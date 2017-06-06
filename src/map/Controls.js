import { ol } from '../constants'
class Controls {
  _addControls (params) {
    let options = params || {}
    /* eslint new-cap: ["error", { "newIsCap": false }] */
    return new ol.control.defaults({
      attribution: (options['attribution'] === false ? options['attribution'] : true),
      rotate: (options['rotate'] === false ? options['rotate'] : true),
      zoom: (options['zoom'] === false ? options['zoom'] : true)
    })
  }

  _addScaleLine () {
    let control = this.map.getControls()
    control.extend([
      new ol.control.ScaleLine() // 比例尺控件
    ])
  }

  /**
   * 放大
   */
  zoomOut (duration) {
    let zoom = this.map.getView().getZoom()
    this.map.getView().animate({
      zoom: (zoom + 1),
      duration: 300
    })
  }
  /**
   * 缩小
   */
  zoomIn (duration) {
    let zoom = this.map.getView().getZoom()
    this.map.getView().animate({
      zoom: (zoom - 1),
      duration: 300
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
