import mix from '../utils/mixin'
import Layer from '../layer/Layer'
import Feature from '../feature/feature'

class Map extends mix(Layer, Feature) {
  constructor () {
    super();
    this.model = 'Map';
  }

  initMap (mapDiv, params) {
    this.map = mapDiv;
  }

  getModel () {
    return this.model
  }

  getMap () {
    return this.map
  }
}

export default Map