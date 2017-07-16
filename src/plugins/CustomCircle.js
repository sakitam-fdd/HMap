/**
 * Created by FDD on 2017/5/10.
 * @desc 可拖拽圆创建
 */
import {ol} from '../constants'
import mix from '../utils/mixin'
import Layer from '../layer/Layer'
import Style from '../style/Style'
import {getuuid} from '../utils/utils'
import * as DomUtils from '../dom/domUtil'

class CustomCircle extends mix(Layer, Style) {
  constructor (params) {
    super()

    /**
     * 参数配置
     * @type {*}
     */
    this.options = params || {}

    if (!this.options['mapInstence'] || !this.options['mapInstence']['map'] || !(this.options['mapInstence']['map'] instanceof ol.Map)) {
      throw new Error('缺少底图对象！')
    } else {
      this.mapInstence = this.options['mapInstence']
      this.map = this.options['mapInstence']['map']
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
      showPolygonFeature: true,
      showCenterFeature: true,
      zoomToExtent: true,
      style: {
        stroke: {
          strokeColor: 'rgba(71, 129, 217, 1)',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          strokeLineDash: undefined,
          strokeLineDashOffset: '0',
          strokeMiterLimit: 10,
          strokeWidth: 1
        },
        fill: {
          fillColor: 'rgba(255, 255, 255, 0)'
        }
      }
    }
    // 部分配置未传时使用默认
    for (let key in this.defaultConfig) {
      if (!this.options.hasOwnProperty(key)) {
        this.options[key] = this.defaultConfig[key]
      }
    }

    /**
     * 如果当前坐标不是米制单位需要计算获取长度
     * @type {ol.Sphere}
     */
    this.sphare = new ol.Sphere(6378137)

    /**
     * 鼠标是否按下
     * @type {boolean}
     */
    this.isMouseDown = false
    /**
     * 是否正在移动
     * @type {boolean}
     */
    this.isMoving = false
    /**
     * 默认半径
     */
    this.radius = this.options['radius']
    /**
     * 半径显示DOM
     * @type {null}
     */
    this.handleLabel = null
    /**
     * 自动创建
     */
    this.createCircle(this.options['center'])
  }

  /**
   * 创建要素
   */
  createCircle (center) {
    try {
      /**
       * 投影后的坐标
       * @type {ol.Coordinate}
       */
      this.center = center
      this.centerCopy = ol.proj.transform(center, this._getProjectionCode(), 'EPSG:4326')
      this.geom = this._getCircleGeom()
      if (this.geom && this.options['zoomToExtent']) {
        let extent = this.geom.getExtent()
        this.zoomToExtent(extent, true)
      }
      this.circleFeature = new ol.Feature({
        geometry: this.geom
      })
      /**
       * 所在图层
       * @type {*}
       */
      let layer = this.createVectorLayer(this.options['layerName'], {
        create: true
      })
      this.mapInstence.polygonLayers.add(this.options['layerName'])
      this.mapInstence.orderLayerZindex()
      /**
       * 当前要素样式
       * @type {ol.style.Style}
       */
      let style = this.getStyleByPolygon(this.options['style'])
      layer.setStyle(style)
      layer.getSource().addFeature(this.circleFeature)
      if (this.options['showCenterFeature']) {
        this.addCenterPoint(layer)
      }
      this.addEditor()
      this.dispachChange()
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 销毁要素
   */
  destroyCircle () {
    if (this.options['layerName']) {
      this.removeLayerByLayerName(this.options['layerName'])
      this.isMouseDown = false
      this.isMoving = false
      this.handleLabel = null
    }
    if (this.overlay && this.overlay instanceof ol.Overlay) {
      this.map.removeOverlay(this.overlay)
      this.overlay = null
    }
  }

  /**
   * 获取要素空间信息
   * @returns {ol.geom.Geometry|*}
   * @private
   */
  _getCircleGeom () {
    let sourceGeom = new ol.geom.Circle(this.centerCopy, (this.transformRadius(this.centerCopy, this.radius)))
    let geom = sourceGeom.transform('EPSG:4326', this._getProjectionCode())
    return geom
  }

  /**
   * 添加中心点
   */
  addCenterPoint (layer) {
    this.centerPoint = new ol.Feature({
      geometry: new ol.geom.Point(this.center)
    })
    let centerStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(71, 129, 217, 1)',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,255,255,0.5)'
        })
      })
    })
    this.centerPoint.setStyle(centerStyle)
    layer.getSource().addFeature(this.centerPoint)
  }

  /**
   * 添加编辑按钮
   * @returns {Overlay|ol.Overlay}
   */
  addEditor () {
    let editor = DomUtils.create('div', 'custom-circle', document.body)
    let button = DomUtils.create('span', 'custom-circle-button', editor, ('editor_' + getuuid()))
    this.handleLabel = DomUtils.create('span', 'custom-circle-handleLabel', editor)
    this.handleLabel.innerHTML = this.radius + 'm'
    this.addEventHandle(button, this.handleLabel)
    this.overlay = new ol.Overlay({
      element: editor,
      position: this.geom.getLastCoordinate(),
      positioning: 'left-center',
      offset: [-18, -10]
    })
    this.map.addOverlay(this.overlay)
  }

  /**
   * 添加事件处理机
   * @param button
   */
  addEventHandle (button) {
    if (button && button instanceof Element) {
      button.addEventListener('mousedown', event => {
        if (event.preventDefault) {
          event.preventDefault()
        } else {
          event.returnValue = false
        }
        this.isMouseDown = true
        this.map.on('pointermove', this.onMouseMove, this)
      })
      button.addEventListener('mouseup', event => {
        if (event.preventDefault) {
          event.preventDefault()
        } else {
          event.returnValue = false
        }
        if (this.isMouseDown && this.isMoving) {
          this.dispachChange()
        }
        this.isMouseDown = false
        this.isMoving = false
        this.map.un('pointermove', this.onMouseMove, this)
      })
      document.addEventListener('mouseup', event => {
        if (event.preventDefault) {
          event.preventDefault()
        } else {
          event.returnValue = false
        }
        if (this.isMouseDown && this.isMoving) {
          this.dispachChange()
        }
        this.isMouseDown = false
        this.isMoving = false
        this.map.un('pointermove', this.onMouseMove, this)
      })
    }
  }

  /**
   * 计算半径
   * @param coords
   */
  mathRadius (coords) {
    this.isMoving = true
    if (this.center && coords) {
      let c1 = ol.proj.transform(this.center, this._getProjectionCode(), 'EPSG:4326')
      let c2 = ol.proj.transform(coords, this._getProjectionCode(), 'EPSG:4326')
      let radius = this.sphare.haversineDistance(c1, c2)
      if (radius > this.options['maxRadius']) {
        this.radius = this.options['maxRadius'] - 1
        this.isMouseDown = false
        this.map.un('pointermove', this.onMouseMove, this)
      } else if (radius < this.options['minRadius']) {
        this.radius = this.options['minRadius'] - 1
        this.isMouseDown = false
        this.map.un('pointermove', this.onMouseMove, this)
      } else {
        this.radius = radius
      }
      this.handleLabel.innerHTML = Math.floor(this.radius) + 1 + 'm'
      this.geom = this._getCircleGeom()
      this.circleFeature.setGeometry(this.geom)
      this.overlay.setPosition(this.geom.getLastCoordinate())
    }
  }

  /**
   * 处理鼠标移动事件
   * @param event
   */
  onMouseMove (event) {
    if (this.isMouseDown) {
      this.mathRadius(event.coordinate)
    }
  }

  /**
   * 获取当前投影
   * @returns {string}
   * @private
   */
  _getProjectionCode () {
    let code = ''
    if (this.map) {
      code = this.map.getView().getProjection().getCode()
    } else {
      code = 'EPSG:3857'
    }
    return code
  }

  /**
   * 半径和坐标间的转换
   * @param center
   * @param meterRadius
   * @returns {number}
   */
  transformRadius (center, meterRadius) {
    try {
      let lastCoords = this.sphare.offset(center, meterRadius, (270 / 360) * 2 * Math.PI) // 计算偏移量
      let [ptx, pty] = [(center[0] - lastCoords[0]), (center[1] - lastCoords[1])]
      let transformRadiu = (Math.sqrt(Math.pow(ptx, 2) + Math.pow(pty, 2)))
      return transformRadiu
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取圆的geometry
   * @private
   */
  getGeometry () {
    if (this.geom) {
      return this.geom
    } else {
      console.info('未创建空间几何！')
    }
  }

  /**
   * 获取圆的中心点
   * @returns {ol.Coordinate|ol.Coordinate|undefined|*}
   * @private
   */
  getCenter () {
    return this.geom.getCenter()
  }

  /**
   * 获取圆的半径
   * @returns {number|*}
   * @private
   */
  getRadius () {
    return this.geom.getRadius()
  }

  /**
   * 获取圆的线上的坐标
   * @private
   */
  getCoordinates () {
    return this.geom.getCoordinates()
  }

  /**
   * 获取圆的第一个坐标
   * @returns {*}
   * @private
   */
  getFirstCoordinate () {
    return this.geom.getFirstCoordinate()
  }

  /**
   * 获取圆的最后一个坐标
   * @returns {*}
   * @private
   */
  getLastCoordinate () {
    return this.geom.getLastCoordinate()
  }

  /**
   * 设置圆的半径
   * @param radius 半径长度
   * @private
   */
  setRadius (radius) {
    this.radius = radius
    this.geom = this._getCircleGeom()
    this.circleFeature.setGeometry(this.geom)
    this.dispachChange()
  }

  /**
   * 设置圆的圆心
   * @param center 圆心坐标[x,y]
   * @private
   */
  setCenter (center) {
    this.center = center
    this.centerCopy = ol.proj.transform(center, this._getProjectionCode(), 'EPSG:4326')
    this.geom.setCenter(center)
    this.dispachChange()
  }

  /**
   * 半径中心变化触发事件
   */
  dispachChange () {
    if (this.options['onRadiusChangeEnd'] && typeof this.options['onRadiusChangeEnd'] === 'function') {
      this.options['onRadiusChangeEnd'](this)
    }
  }
}

export default CustomCircle
