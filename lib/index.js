/**
 * Created by FDD on 2017/3/8.
 */

// function mix(...mixins) {
//   class Mix {}
//   // 以编程方式给Mix类添加
//   // mixins的所有方法和访问器
//   for (let mixin of mixins) {
//     copyProperties(Mix, mixin);
//     copyProperties(Mix.prototype, mixin.prototype);
//   }
//   return Mix;
// }
//
// function copyProperties(target, source) {
//   for (let key of Reflect.ownKeys(source)) {
//     if (key !== "constructor" && key !== "prototype" && key !== "name") {
//       let desc = Object.getOwnPropertyDescriptor(source, key);
//       Object.defineProperty(target, key, desc);
//     }
//   }
// }

import mix from './mixin'

import Loggable from './Loggable'
import Test from './Test'

class DistributedEdit extends mix(Loggable, Test) {
  // 事件方法
  constructor () {
    super();
    this.map = 'DistributedEdit';
  }

  getModel () {
    return this.model;
  }

}

export default DistributedEdit