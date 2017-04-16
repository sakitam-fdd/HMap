import { ol } from '../constants'
import app from './appDrag'
class Interactions {
  _addInteractions (params) {
    let options = params || {};
    return new ol.interaction.defaults({
      altShiftDragRotate: ((options['altShiftDragRotate'] === false) ? false : true),
      doubleClickZoom: ((options['doubleClickZoom'] === false) ? false : true),
      keyboard: ((options['keyboard'] === false) ? false : true),
      mouseWheelZoom: ((options['mouseWheelZoom'] === false) ? false : true),
      shiftDragZoom: ((options['shiftDragZoom'] === false) ? false : true),
      dragPan: ((options['dragPan'] === false) ? false : true),
      pinchRotate: ((options['pinchRotate'] === false) ? false : true),
      pinchZoom: ((options['pinchZoom'] === false) ? false : true),
      zoomDelta: ((options['zoomDelta'] && (typeof (options['zoomDelta'])) === 'number') ? options['zoomDelta'] : 1), // 缩放增量（默认一级）
      zoomDuration: (options['zoomDuration'] && (typeof (options['zoomDelta'])) === 'number') ? options['zoomDuration'] : 300 // 缩放持续时间
    }).extend([new app.Drag()]);
  }
}

export default Interactions