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
}

export default Controls