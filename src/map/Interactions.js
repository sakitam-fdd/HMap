/**
 * Created by FDD on 2017/9/18.
 * @desc 交互工具相关
 */
import ol from 'openlayers'
class _Interactions {
  _addInteractions (params) {
    let options = params || {}
    /* eslint new-cap: ["error", { "newIsCap": false }] */
    return new ol.interaction.defaults({
      altShiftDragRotate: ((options['altShiftDragRotate'] === false) ? options['altShiftDragRotate'] : true),
      doubleClickZoom: ((options['doubleClickZoom'] === false) ? options['doubleClickZoom'] : true),
      keyboard: ((options['keyboard'] === false) ? options['keyboard'] : true),
      mouseWheelZoom: ((options['mouseWheelZoom'] === false) ? options['mouseWheelZoom'] : true),
      shiftDragZoom: ((options['shiftDragZoom'] === false) ? options['shiftDragZoom'] : true),
      dragPan: ((options['dragPan'] === false) ? options['dragPan'] : true),
      pinchRotate: ((options['pinchRotate'] === false) ? options['pinchRotate'] : true),
      pinchZoom: ((options['pinchZoom'] === false) ? options['pinchZoom'] : true),
      zoomDelta: ((options['zoomDelta'] && (typeof (options['zoomDelta'])) === 'number') ? options['zoomDelta'] : 1), // 缩放增量（默认一级）
      zoomDuration: (options['zoomDuration'] && (typeof (options['zoomDelta'])) === 'number') ? options['zoomDuration'] : 300 // 缩放持续时间
    })
  }

  /**
   * 添加缩放按钮
   * @param options
   * @param controls
   * @private
   */
  addPointEvents (controls) {
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
}

export default _Interactions
