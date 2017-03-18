import { ol } from '../constants'
class MeasureTool {
  constructor (map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
      this.wgs84Sphere = new ol.Sphere(6378137);
    } else {
      throw new Error('传入的不是地图对象或者地图对象为空！')
    }
  }
  setUp () {

  }
}