/**
 * Created by FDD on 2017/2/12.
 * @decs 主文件对象，包含独立命名空间
 */

export default class HMap {
  constructor () {
    this.instances = {};
    this._instanceId = 0;
  }
  getInstanceId () {
    return this._instanceId ++;
  }
}
