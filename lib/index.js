import mix from './utils/mixin'

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