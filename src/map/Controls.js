/**
 * Created by FDD on 2017/9/18.
 * @desc 控件相关
 */
import ol from 'openlayers'
import * as utils from '../utils/utils'
import '../control/BZoomSlider'
import '../control/Loading'
import '../control/RotateControl'
import '../control/zoom'
import '../control/FullScreen'
import '../control/LayerSwitcher'
import '../control/contextMenu'
import '../control/compareLayer'
import '../control/ScaleLineH'
import '../control/MousePosition'
import '../control/OverviewMap'
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
    controls.push(new ol.control.ScaleLineH({
      units: (options['units'] ? options['units'] : 'metric_cn')
    }))
  }

  /**
   * 添加全屏控件
   * @param options
   * @param controls
   */
  addFullScreen (options = {}, controls) {
    controls = controls || this.map.getControls()
    controls.push(new ol.control.FullScreenMenu(options))
  }

  /**
   * 添加鼠标位置控件
   * @param options
   * @param controls
   */
  addMousePosition (options, controls) {
    controls = controls || this.map.getControls()
    if (!options['projection']) options['projection'] = this.view.getProjection()
    controls.push(new ol.control.MousePositionH(options))
  }

  /**
   * 添加缩放条控件
   * @param options
   * @param controls
   */
  addZoomSlider (options, controls) {
    controls = controls || this.map.getControls()
    let zoomSlider = new ol.control.BZoomSlider(options)
    controls.push(zoomSlider)
  }

  /**
   * 添加定位控件
   * @param options
   * @param controls
   * @private
   */
  addGeolocation (options, controls) {
    controls = controls || this.map.getControls()
    controls.push(new ol.control.Geolocation(options))
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

  /**
   * 添加鹰眼控件
   * @param options
   * @param controls
   */
  addOverviewMap (options = {}, controls) {
    controls = controls || this.map.getControls()
    let Switcher = new ol.control.OverviewMapH(options)
    controls.push(Switcher)
  }
}
export default _Controls
