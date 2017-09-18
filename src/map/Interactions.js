/**
 * Created by FDD on 2017/9/18.
 * @desc 交互工具相关
 */
import PointerEvents from '../interaction/PointerEvents'
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
   * @param interactions
   * @private
   */
  addPointEvents (interactions) {
    if (!interactions) {
      interactions = this.map.getInteractions()
    }
    interactions.push(new PointerEvents())
  }
}

export default _Interactions
