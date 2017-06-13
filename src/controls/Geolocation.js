/**
 * Created by FDD on 2017/6/11.
 * @desc 用于定位功能
 */
import {ol} from '../constants'
import {DomUtil, css} from '../dom'
const Geolocation = function (params) {
  this.options = params || {}
  let className = (this.options.className !== undefined ? this.options.className : 'hmap-geolocation')
  if (!this.options['map'] || !(this.options['map'] instanceof ol.Map)) {
    throw new Error('缺少底图对象！')
  } else {
    this.map = this.options['map']
  }
  /**
   * @private
   * @type {Element}
   */
  this.element_ = DomUtil.create('div', (className + ' ' + css.CLASS_UNSELECTABLE))

  /**
   * @private
   * @type {Element}
   */
  this.innerElement_ = DomUtil.create('div', className + '-inner', this.element_)
  this.element_.addEventListener('click', this.clickHandle)
  this.initControl()
  ol.control.Control.call(this, {
    element: this.element_,
    target: this.options['target']
  })
}

ol.inherits(Geolocation, ol.control.Control)

/**
 * 设置当前地图对象
 * @param map
 */
Geolocation.prototype.setMap = function (map) {
  if (map && map instanceof ol.Map) {
    this.map = map
  }
}

/**
 * 获取当前地图对象
 * @returns {*|ol.Map}
 */
Geolocation.prototype.getMap = function () {
  return this.map
}

/**
 * 初始化
 */
Geolocation.prototype.initControl = function () {
  /**
   * 定位
   * @type {ol.Geolocation}
   */
  this.geolocation = new ol.Geolocation({
    projection: this.map.getView().getProjection()
  })
  /**
   * 是否开启跟踪模式
   */
  this.geolocation.setTracking((typeof this.options['track'] === 'boolean') ? this.options['track'] : false)
  this.geolocation.on('change', () => {
    let accuracy = this.geolocation.getAccuracy()
    let altitude = this.geolocation.getAltitude()
    let altitudeAccuracy = this.geolocation.getAltitudeAccuracy()
    let heading = this.geolocation.getHeading()
    let speed = this.geolocation.getSpeed()
    console.log(accuracy, altitude, altitudeAccuracy, heading, speed)
  })
  this.geolocation.on('error', (error) => {
    let info = document.getElementById('info')
    info.innerHTML = error.message
    info.style.display = ''
  })
  this.geolocation.on('change:accuracyGeometry', () => {
    console.log(this.geolocation.getAccuracyGeometry())
  })
  this.geolocation.on('change:position', () => {
    let coordinates = this.geolocation.getPosition()
    console.log(coordinates)
  })
}

/**
 * 处理事件
 */
Geolocation.prototype.clickHandle = function () {
  let coordinates = this.geolocation.getPosition()
  console.log(coordinates)
}

export default Geolocation
