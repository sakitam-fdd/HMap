import mix from '../utils/mixin'
import Style from '../style/Style'

class Layer extends mix(Style) {
  constructor () {
    super();
    this.model = 'Layer'
  }

  getModel () {
    return this.model
  }

  setStyle () {
    this.style = this.getStyle();
    return this.style;
  }
}

export default Layer