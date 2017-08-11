/**
 * Created by FDD on 2017/6/11.
 * @desc 用于定位功能
 */
import {ol} from '../constants'
import {DomUtil, css} from '../dom'
ol.control.Geolocation = function (params) {
  this.options = params || {}
  let className = (this.options.className !== undefined ? this.options.className : 'hmap-geolocation')
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
  this.element_.addEventListener('click', event => {
    this.clickHandle(event)
  })
  ol.control.Control.call(this, {
    element: this.element_,
    target: this.options['target']
  })
}

ol.inherits(ol.control.Geolocation, ol.control.Control)

/**
 * 处理事件
 */
ol.control.Geolocation.prototype.clickHandle = function () {
  if (!this.geolocation) {
    /**
     * 定位
     * @type {ol.Geolocation}
     */
    this.geolocation = new ol.Geolocation({
      projection: this.getMap().getView().getProjection(),
      tracking: ((typeof this.options['tracking'] === 'boolean') ? this.options['tracking'] : false)
    })
    /**
     * 是否开启跟踪模式
     */
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
      window.alert(coordinates)
    })
  }
  let coordinates = this.geolocation.getPosition()
  let accuracy = this.geolocation.getAccuracy()
  let altitude = this.geolocation.getAltitude()
  let altitudeAccuracy = this.geolocation.getAltitudeAccuracy()
  let heading = this.geolocation.getHeading()
  let speed = this.geolocation.getSpeed()
  console.log(coordinates, altitudeAccuracy, altitude, accuracy, heading, speed)
}

/**
 * 设置地图
 * @param map
 */
ol.control.Geolocation.prototype.setMap = function (map) {
  if (map && map instanceof ol.Map) {
    ol.control.Control.prototype.setMap.call(this, map)
  }
}
