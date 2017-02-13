import HMap from './index'
class Layers {
  constructor (params) {
    this.option = params || {};
    this._map = this.option.map;
  }
  getMap () {
    return this._map
  }
}
module.exports = Layers;