/**
 * Created by FDD on 2017/8/24.
 */
import 'get-own-property-symbols'
// import mixins from './mixins'
import mixin from './mixin'
// import aggregation from './__'
import MathLine from './mathLine'
import Name from './name'
class obj extends mixin(MathLine, Name) {
  constructor () {
    super()
    this.version = '1.0.0'
    this.desc = 'mathline'
  }
  getVersion () {
    return this.version
  }
}

export default obj
