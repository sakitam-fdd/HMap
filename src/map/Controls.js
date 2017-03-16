import { ol } from '../constants'
class Controls {
  _addControls (params) {
    let options = params || {};
    return new ol.control.defaults({
      attribution: (options['attribution'] === false ? false : true),
      rotate: (options['rotate'] === false ? false : true),
      zoom: (options['zoom'] === false ? false : true)
    })
  }

  _addScaleLine () {
    let control = this.map.getControls();
    control.extend([
      new ol.control.ScaleLine() //比例尺控件
    ])
  }
}

export default Controls