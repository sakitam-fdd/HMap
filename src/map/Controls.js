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
}

export default Controls
