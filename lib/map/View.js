import { ol, proj4 } from '../constants'
class View {
  getView () {
    return new ol.View({
      center: [0, 0],
      zoom: 2
    })
  }
}

export default View