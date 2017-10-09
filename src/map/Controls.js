/**
 * Created by FDD on 2017/9/18.
 * @desc 控件相关
 */
import ol from 'openlayers'
import * as utils from '../utils/utils'
import 'ol-extent/src/control/BZoomSlider'
import 'ol-extent/src/control/Loading'
import 'ol-extent/src/control/RotateControl'
import 'ol-extent/src/control/zoom'
import 'ol-extent/src/control/FullScreen'
import 'ol-extent/src/control/LayerSwitcher'
import 'ol-extent/src/control/contextMenu'
import 'ol-extent/src/control/compareLayer'
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
  addZoom (options = {}, controls) {
    controls = controls || this.map.getControls()
    controls.push(new ol.control.ZoomMenu({
      className: options['className'],
      duration: options['duration'],
      target: options['target'],
      delta: options['delta']
    }))
  }

  /**
   * 添加旋转控件
   * @param options
   * @param controls
   * @private
   */
  addRotate (options = {}, controls) {
    controls = controls || this.map.getControls()
    controls.push(new ol.control.RotateControl({
      className: options['className'],
      duration: options['duration'],
      label: options['resetNorth'],
      autoHide: options['autoHide'],
      target: options['target']
    }))
  }

  /**
   * 版权
   * @param options
   * @param controls
   * @private
   */
  addAttribution (options, controls) {
    controls = controls || this.map.getControls()
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
    controls = controls || this.map.getControls()
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
  addFullScreen (options = {}, controls) {
    controls = controls || this.map.getControls()
    controls.push(new ol.control.FullScreenMenu({
      className: options['className'],
      label: options['label'],
      labelActive: options['labelActive'],
      keys: options['keys'],
      target: options['target'],
      source: options['source']
    }))
  }

  /**
   * 添加鼠标位置控件
   * @param options
   * @param controls
   */
  addMousePosition (options, controls) {
    controls = controls || this.map.getControls()
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
    controls = controls || this.map.getControls()
    let zoomSlider = new ol.control.BZoomSlider({
      duration: options['duration'],
      pixelDelta: options['pixelDelta'],
      className: options['className'],
      target: options['target']
    })
    controls.push(zoomSlider)
  }

  /**
   * 添加缩放范围控件
   * @param options
   * @param controls
   */
  addZoomToExtent (options, controls) {
    controls = controls || this.map.getControls()
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
    controls = controls || this.map.getControls()
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
    controls = controls || this.map.getControls()
    let loading_ = new ol.control.Loading({
      className: (options['className'] ? options['className'] : 'hmap-loading-panel'),
      widget: (options['widget'] ? options['widget'] : 'animatedGif'),
      target: (options['target'] ? options['target'] : undefined)
    })
    controls.push(loading_)
  }

  /**
   * 添加CompareLayer控件
   * @param beforeMap
   * @param afterMap
   * @param options
   * @param controls
   * @private
   */
  addCompareLayer (beforeMap, afterMap, options = {}, controls) {
    controls = controls || this.map.getControls()
    let _compareLayer = new ol.control.CompareLayer(beforeMap, afterMap, options)
    controls.push(_compareLayer)
  }

  /**
   * 添加ContextMenu控件
   * @param options
   * @param controls
   * @private
   */
  addContextMenu (options = {}, controls) {
    controls = controls || this.map.getControls()
    let ContextMenu = new ol.control.ContextMenu(options)
    controls.push(ContextMenu)
  }

  /**
   * 添加LayerSwitcher控件
   * @param options
   * @param controls
   * @private
   */
  addLayerSwitcher (options = {}, controls) {
    controls = controls || this.map.getControls()
    let Switcher = new ol.control.LayerSwitcher(options)
    controls.push(Switcher)
  }
}
export default _Controls
