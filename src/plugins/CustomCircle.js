/**
 * Created by FDD on 2017/5/10.
 * @desc 可拖拽圆创建
 */
import { ol } from '../constants'
import mix from '../utils/mixin'
import Layer from '../layer/Layer'
import Style from '../style/Style'

class CustomCircle extends mix(Layer, Style) {
  constructor (params) {
    super()
    /**
     * 版本
     * @type {string}
     */
    this.version = '1.0.0'

    /**
     * 参数配置
     * @type {*}
     */
    this.options = params || {}

    if (!this.options['map'] || !(this.options['map'] instanceof ol.Map)) {
      throw new Error('缺少底图对象！')
    } else {
      this.map = this.options['map']
    }
    /**
     * 默认配置
     * @type {{radius: number, minRadius: number, maxRadius: number, layerName: string, showPolygonFeat: boolean}}
     */
    this.defaultConfig = {
      radius: 5000,
      minRadius: 50,
      maxRadius: 50000,
      layerName: 'perimeterSerachLayer',
      showPolygonFeat: false
    }

    /**
     * 如果当前坐标不是米制单位需要计算获取长度
     * @type {ol.Sphere}
     */
    this.sphare = new ol.Sphere(6378137)
  }

  creatCircle () {
    this.circleFeature = new ol.Feature({
      geometry: new ol.geom.Circle({
        center: this.options['center'],
        radius: (this._getRadiusFromOptions())
      })
    })
  }

  _getRadiusFromOptions () {
    try {
      this.sourceProj = this.map.getView().getProjection()
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 半径和坐标间的转换
   * @param center
   * @param meterRadius
   * @returns {number}
   */
  transformRadius(center, meterRadius) {
    let transformRadiu = 0
    switch (this.projection.getCode()) {
      case 'EPSG:4326':
        let lastCoords = new ol.Sphere(6378137).offset(center, meterRadius, (270 / 360) * 2 * Math.PI) // 计算偏移量
        let [dx, dy] = [(center[0] - lastCoords[0]), (center[1] - lastCoords[1])]
        transformRadiu = (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)))
        break
      case 'EPSG:3857':
      case 'EPSG:102100':
        transformRadiu = meterRadius
        break
    }
    return transformRadiu
  }

  /**
   * 获取半径(此半径为米)
   * @param center
   * @param coordinate
   * @returns {number}
   */
  getRadius (center, coordinate) {
    let radius = 0
    switch (this.projection.getCode()) {
      case 'EPSG:4326':
        radius = this.sphere.haversineDistance(center, coordinate)
        break
      case 'EPSG:3857':
      case 'EPSG:102100':
        radius = Math.sqrt(Math.pow(coordinate[0] - this.center[0], 2) + Math.pow(coordinate[1] - this.center[1], 2))
        break
    }
    return radius
  }
}

export default CustomCircle
