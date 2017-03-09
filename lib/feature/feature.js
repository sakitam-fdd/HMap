/**
 * Created by FDD on 2017/2/22.
 * @desc 要素相关处理
 */
import mix from '../utils/mixin'
import Style from '../style/Style'
import Layer from '../layer/Layer'

class Feature extends mix(Style, Layer) {
  constructor (map) {
    super();
    this.map = map;
  }

  addPoint (point) {
    return point;
  }

  getMap () {
    return this.map
  }
}

export default Feature