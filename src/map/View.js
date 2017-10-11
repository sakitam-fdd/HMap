/**
 * Created by FDD on 2017/9/18.
 * @desc 视图相关处理
 */
import ol from 'openlayers'
class _View {
  /**
   * 添加视图
   * @param params
   * @returns {ol.View}
   * @private
   */
  _addView (params) {
    let option = params || {}

    /**
     * 投影
     * @type {ol.proj.Projection}
     */
    this.projection = ol.proj.get((option['projection'] || 'EPSG:3857'))

    /**
     * 显示范围
     * @type {Array}
     */
    this.fullExtent = option['extent']

    /**
     * 投影范围
     */
    if (this.fullExtent) {
      this.projection.setExtent(this.fullExtent)
    }

    return new ol.View({
      center: ((option['center'] && Array.isArray(option['center'])) ? option['center'] : [0, 0]),
      zoom: ((option['zoom'] && (typeof option['zoom'] === 'number')) ? option['zoom'] : 0),
      minZoom: ((option['minZoom'] && (typeof option['minZoom'] === 'number')) ? option['minZoom'] : undefined),
      maxZoom: ((option['maxZoom'] && (typeof option['maxZoom'] === 'number')) ? option['maxZoom'] : undefined),
      zoomFactor: ((option['zoomFactor'] && (typeof option['zoomFactor'] === 'number')) ? option['zoomFactor'] : 2),
      rotation: ((option['rotation'] && (typeof option['rotation'] === 'number')) ? option['rotation'] : 0),
      enableRotation: (option['enableRotation'] === false ? option['enableRotation'] : true),
      projection: (option['projection'] ? option['projection'] : 'EPSG:3857'),
      extent: ((option['extent'] && Array.isArray(option['extent']) && option['extent'].length === 4) ? option['extent'] : undefined),
      resolutions: ((option['resolutions'] && Array.isArray(option['resolutions']) && option['resolutions'].length > 0) ? option['resolutions'] : undefined)
    })
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

  /**
   * zoomByDelta
   * @param delta
   * @param duration
   * @returns {boolean}
   */
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
export default _View
