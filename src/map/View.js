import { ol, proj4, config } from '../constants'
class View {
  _addView (params) {
    let option = params || {};
    return new ol.View({
      center: [0, 0],
      zoom: 2
    })
  }
}

export default View