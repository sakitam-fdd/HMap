import { ol, proj4 } from '../constants'
class Controls {
  _addControls () {
    return this.getDefaultControls()
  }

  getDefaultControls () {
    return new ol.control.defaults({
      attribution: true,
      rotate: true,
      zoom: true
    })
  }
}

export default Controls