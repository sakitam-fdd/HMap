import {ol} from '../constants'
import * as utils from '../utils/utils'
class _Controls {

  /**
   * 添加控件
   * @param params
   * @returns {Array}
   * @private
   */
  _addControls (params) {
    let options = params || {}
    let controls = []
    // 添加缩放
    if (!options.hasOwnProperty('zoom')) {
      this.addZoom({}, controls)
    }
    // 添加旋转
    if (!options.hasOwnProperty('rotate')) {
      this.addRotate({}, controls)
    }
    // 添加版权
    if (!options.hasOwnProperty('attribution')) {
      this.addAttribution({}, controls)
    }
    if (options) {
      for (let key in options) {
        if (key && options[key]) {
          this['add' + (utils.upperFirstChart(key))](options[key], controls)
        }
      }
    }
    return controls
  }

  /**
   * 添加缩放按钮
   * @param options
   * @param controls
   * @private
   */
  addZoom (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.Zoom({
      className: (options['className'] ? options['className'] : 'ol-zoom'),
      duration: (options['duration'] && typeof options['duration'] === 'number' ? options['duration'] : 250),
      zoomInLabel: (options['zoomInLabel'] ? options['zoomInLabel'] : undefined),
      zoomOutLabel: (options['zoomOutLabel'] ? options['zoomOutLabel'] : undefined),
      zoomInTipLabel: (options['zoomInTipLabel'] && typeof options['zoomInTipLabel'] === 'string' ? options['zoomInTipLabel'] : '放大'),
      zoomOutTipLabel: (options['zoomOutTipLabel'] && typeof options['zoomOutTipLabel'] === 'string' ? options['zoomOutTipLabel'] : '缩小'),
      target: (options['target'] ? options['target'] : undefined),
      delta: (options['delta'] ? options['delta'] : undefined)
    }))
  }

  /**
   * 添加旋转控件
   * @param options
   * @param controls
   * @private
   */
  addRotate (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.Rotate({
      className: (options['className'] ? options['className'] : 'ol-rotate'),
      duration: (options['duration'] && typeof options['duration'] === 'number' ? options['duration'] : 250),
      label: (options['label'] ? options['label'] : '⇧'),
      tipLabel: (options['tipLabel'] && typeof options['tipLabel'] === 'string' ? options['tipLabel'] : '重置旋转方向'),
      autoHide: (options['autoHide'] === false ? options['autoHide'] : true),
      target: (options['target'] ? options['target'] : undefined)
    }))
  }

  /**
   * 版权
   * @param options
   * @param controls
   * @private
   */
  addAttribution (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.Attribution({
      className: (options['className'] ? options['className'] : 'ol-attribution'),
      label: (options['label'] ? options['label'] : 'i'),
      tipLabel: (options['tipLabel'] && typeof options['tipLabel'] === 'string' ? options['tipLabel'] : '版权'),
      collapsible: (options['collapsible'] === false ? options['collapsible'] : true),
      collapsed: (options['collapsed'] === false ? options['collapsed'] : true),
      collapseLabel: (options['collapseLabel'] ? options['collapseLabel'] : '»'),
      target: (options['target'] ? options['target'] : undefined)
    }))
  }

  /**
   * 添加比例尺
   * @param options
   * @param controls
   * @private
   */
  addScaleLine (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.ScaleLine({
      className: (options['className'] ? options['className'] : 'ol-scale-line'),
      minWidth: (options['minWidth'] && typeof options['minWidth'] === 'number' ? options['minWidth'] : 64),
      render: (options['render'] && typeof options['render'] === 'function' ? options['render'] : undefined),
      target: (options['target'] ? options['target'] : undefined),
      units: (options['units'] ? options['units'] : 'metric')
    }))
  }

  /**
   * 添加全屏控件
   * @param options
   * @param controls
   */
  addFullScreen (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.FullScreen({
      className: (options['className'] ? options['className'] : 'ol-full-screen'),
      label: (options['label'] ? options['label'] : '\u2922'),
      tipLabel: (options['tipLabel'] && typeof options['tipLabel'] === 'string' ? options['tipLabel'] : '切换全屏'),
      labelActive: (options['labelActive'] ? options['labelActive'] : '\u00d7'),
      keys: (options['keys'] && typeof options['keys'] === 'boolean' ? options['keys'] : undefined),
      target: (options['target'] ? options['target'] : undefined),
      source: (options['source'] ? options['source'] : undefined)
    }))
  }

  /**
   * 添加鼠标位置控件
   * @param options
   * @param controls
   */
  addMousePosition (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.MousePosition({
      className: (options['className'] ? options['className'] : 'ol-mouse-position'),
      coordinateFormat: (options['coordinateFormat'] ? options['coordinateFormat'] : undefined),
      projection: (options['projection'] ? options['projection'] : this.view.getProjection()),
      undefinedHTML: (options['undefinedHTML'] && typeof options['undefinedHTML'] === 'string' ? options['undefinedHTML'] : '无坐标'),
      target: (options['target'] ? options['target'] : undefined)
    }))
  }

  /**
   * 添加缩放条控件
   * @param options
   * @param controls
   */
  addZoomSlider (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.ZoomSlider({
      className: (options['className'] ? options['className'] : 'ol-zoomslider'),
      duration: (options['duration'] && typeof options['duration'] === 'number' ? options['duration'] : 200),
      maxResolution: (options['maxResolution'] && typeof options['maxResolution'] === 'number' ? options['maxResolution'] : undefined),
      minResolution: (options['minResolution'] && typeof options['minResolution'] === 'number' ? options['minResolution'] : undefined)
    }))
  }

  /**
   * 添加缩放范围控件
   * @param options
   * @param controls
   */
  addZoomToExtent (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.ZoomToExtent({
      className: (options['className'] ? options['className'] : 'ol-zoom-extent'),
      label: (options['label'] ? options['label'] : 'E'),
      tipLabel: (options['tipLabel'] && typeof options['tipLabel'] === 'string' ? options['tipLabel'] : '缩放到范围'),
      extent: (options['extent'] ? options['extent'] : undefined)
    }))
  }

  /**
   * 添加定位控件
   * @param options
   * @param controls
   * @private
   */
  addGeolocation (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.Geolocation({
      className: (options['className'] ? options['className'] : 'hmap-geolocation'),
      target: (options['target'] ? options['target'] : undefined)
    }))
  }

  /**
   * 添加loading控件
   * @param options
   * @param controls
   * @private
   */
  addLoading (options, controls) {
    if (!controls) {
      controls = this.map.getControls()
    }
    controls.push(new ol.control.Loading({
      className: (options['className'] ? options['className'] : 'hmap-loading-panel'),
      widget: (options['widget'] ? options['widget'] : 'animatedGif'),
      target: (options['target'] ? options['target'] : undefined)
    }))
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

export default _Controls
