/**
 * Created by FDD on 2017/2/22.
 * @desc 要素相关处理
 */

import { ol } from '../constants'
class Feature {
  constructor (map) {
    this.map = map;
    if (!this.map) {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 通过id获取Feature
   * @param id
   * @returns {*}
   */
  getFeatureById (id) {
    return this.map.getFeatureById(id)
  }
}

export default Feature