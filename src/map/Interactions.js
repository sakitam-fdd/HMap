import { ol, proj4, config } from '../constants'
class Interactions {
  _addInteractions (params) {
    let options = params || {};
    return this.getDefaultiInteractions();
  }

  getDefaultiInteractions () {
    return new ol.interaction.defaults({
      altShiftDragRotate: true,
      doubleClickZoom: true,
      keyboard: true,
      mouseWheelZoom: true,
      shiftDragZoom: true,
      dragPan: true,
      pinchRotate: true,
      pinchZoom: true,
      zoomDelta: 5, // 缩放增量（默认一级）
      zoomDuration: 5 // 缩放持续时间
    })
  }
}

export default Interactions