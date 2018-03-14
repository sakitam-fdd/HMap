/**
 * Created by FDD on 2016/11/5.
 * @desc 动态圆，主要用于周边搜索功能
 */
import ol from 'openlayers'
import olStyleFactory from '../style/factory'
import {createVectorLayer} from '../layer/LayerUtils'
import Observable from '../utils/Observable'
import {getuuid} from '../utils/utils'
import mixin from '../utils/mixin'
ol.interaction.FreeHandCircle = function (params) {
  this.options = params || {}

  /**
   * 计算工具
   * @type {ol.Sphere}
   */
  this.wgs84Sphere = new ol.Sphere(typeof this.options['sphere'] === 'number' ? this.options['sphere'] : 6378137)

  /**
   * 当前图层layerName
   * @type {*}
   */
  this.layerName = this.options['layerName'] || 'FREE_HAND_CIRCLE'

  /**
   * 中心点样式
   * @type {*}
   */
  this.centerStyle = this.options['centerStyle'] || null

  /**
   * 当前图层
   * @type {null}
   */
  this.layer = null

  /**
   * 当前半径
   * @type {number}
   */
  this.radius = ''

  /**
   * 中心点坐标
   * @type {Array}
   * @private
   */
  this.center_ = []

  /**
   * 当前鼠标是否按下
   * @type {boolean}
   */
  this.isMouseDown = false

  /**
   * 是否为拖拽状态
   * @type {boolean}
   */
  this.isDraging = false

  /**
   * cursor
   * @type {string}
   * @private
   */
  this.cursor_ = 'pointer'

  /**
   * isDrawStart
   * @type {boolean}
   * @private
   */
  this.drawStart_ = false

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined

  /**
   * coordinate
   * @type {null}
   * @private
   */
  this.coordinate_ = null

  /**
   * feature
   * @type {null}
   * @private
   */
  this.feature_ = null

  /**
   * 文本要素
   * @type {null}
   */
  this.textOverlay = null

  /**
   * 当前圆
   * @type {null}
   */
  this.circleFeature = null

  /**
   * 中心点要素
   * @type {null}
   */
  this.centerFeature = null

  /**
   * labelFeature
   * @type {null}
   */
  this.labelFeature = null

  /**
   * drawStyle
   * @type {{}}
   */
  this.style_ = {
    fill: {
      fillColor: 'rgba(67, 110, 238, 0)'
    },
    stroke: {
      strokeColor: 'rgba(249, 185, 154, 1)',
      strokeWidth: 2.5
    },
    image: {
      type: '',
      image: {
        fill: {
          fillColor: 'rgba(255, 255, 255, 0.8)'
        },
        points: Infinity,
        radius: 4,
        stroke: {
          strokeColor: 'rgba(255, 0, 0, 1)',
          strokeWidth: 1.5
        }
      }
    }
  }
  if (this.options['style'] && typeof this.options['style'] === 'object') {
    this.style_ = this.options['style']
  }

  ol.interaction.Pointer.call(this, {
    handleMoveEvent: ol.interaction.FreeHandCircle.handleMoveEvent_,
    handleDownEvent: ol.interaction.FreeHandCircle.handleDownEvent_,
    handleUpEvent: ol.interaction.FreeHandCircle.handleUpEvent_,
    handleDragEvent: ol.interaction.FreeHandCircle.handleDragEvent_
  })

  Observable.call(this)
}

ol.inherits(ol.interaction.FreeHandCircle, ol.interaction.Pointer)
mixin(ol.interaction.FreeHandCircle, Observable)

/**
 * 处理移动事件
 * @param mapBrowserEvent
 */
ol.interaction.FreeHandCircle.handleMoveEvent_ = function (mapBrowserEvent) {
  if (this.cursor_) {
    let map = mapBrowserEvent.map
    let feature = map.forEachFeatureAtPixel(mapBrowserEvent.pixel, function (feature) {
      return feature
    })
    let element = map.getTargetElement()
    if (feature && feature.get('free-hand-circle-lable')) {
      if (element.style.cursor !== this.cursor_) {
        this.previousCursor_ = element.style.cursor
        element.style.cursor = this.cursor_
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_
      this.previousCursor_ = undefined
    }
  }
}

/**
 * 鼠标按下事件
 * @param mapBrowserEvent
 * @private
 */
ol.interaction.FreeHandCircle.handleDownEvent_ = function (mapBrowserEvent) {
  this.isMouseDown = true
  if (!this.drawStart_ && mapBrowserEvent.originalEvent.button === 0) {
    let map = mapBrowserEvent.map
    let feature = map.forEachFeatureAtPixel(mapBrowserEvent.pixel, function (feature) {
      return feature
    })
    if (feature && feature.get('free-hand-circle-lable')) {
      this.coordinate_ = mapBrowserEvent.coordinate
      this.feature_ = feature
    }
    return !!this.feature_
  }
}

/**
 * 处理鼠标抬起事件
 * @param mapBrowserEvent
 * @private
 */
ol.interaction.FreeHandCircle.handleUpEvent_ = function (mapBrowserEvent) {
  if (this.feature_ && this.coordinate_ && this.isDraging) {
    this.dispatch('changeend', this.circleFeature.getGeometry())
  }
  this.coordinate_ = null
  this.feature_ = null
  this.isMouseDown = false
  this.isDraging = false
  return false
}

/**
 * 处理拖拽事件
 * @param mapBrowserEvent
 * @private
 */
ol.interaction.FreeHandCircle.handleDragEvent_ = function (mapBrowserEvent) {
  if (!this.coordinate_ || !this.feature_) {
    return
  }
  this.isDraging = true
  let deltaX = mapBrowserEvent.coordinate[0] - this.coordinate_[0]
  let deltaY = 0
  let geometry = /** @type {ol.geom.SimpleGeometry} */
    (this.feature_.getGeometry())
  geometry.translate(deltaX, deltaY)
  this.coordinate_[0] = mapBrowserEvent.coordinate[0]
  this.coordinate_[1] = mapBrowserEvent.coordinate[1]
  this.createCircle(this.center_, this.mathRadius(this.center_, geometry.getCoordinates()))
}

/**
 * 初始化interaction工具
 * @private
 */
ol.interaction.FreeHandCircle.prototype.initDrawInteraction = function () {
  if (!this.getMap()) return
  let style_ = new olStyleFactory(this.style_)
  this.draw = new ol.interaction.Draw({
    type: 'Circle',
    style: style_
  })
  this.draw.set('uuid', getuuid())
  this.getMap().addInteraction(this.draw)
  this.draw.on('drawstart', this.drawStartHandle_, this)
  this.draw.on('drawend', this.drawEndHandle_, this)
}

/**
 * 移除上一次交互工具
 * @private
 */
ol.interaction.FreeHandCircle.prototype.removeLastInteraction_ = function () {
  if (!this.getMap()) return
  this.draw.un('drawstart', this.drawStartHandle_, this)
  this.draw.un('drawend', this.drawEndHandle_, this)
  this.getMap().removeInteraction(this.draw)
}

/**
 * drawStart
 * @param event
 * @private
 */
ol.interaction.FreeHandCircle.prototype.drawStartHandle_ = function (event) {
  this.drawStart_ = true
}

/**
 * drawEnd
 * @param event
 * @private
 */
ol.interaction.FreeHandCircle.prototype.drawEndHandle_ = function (event) {
  if (event && event.feature) {
    let geom_ = event.feature.getGeometry()
    this.center_ = geom_.getCenter()
    let coordinates = geom_.getLastCoordinate()
    this.radius = this.mathRadius(this.center_, coordinates)
    this.createCircle(this.center_, this.radius)
  }
  this.removeLastInteraction_()
  this.drawStart_ = false
}

/**
 * 创建圆
 * @param center
 * @param radius
 */
ol.interaction.FreeHandCircle.prototype.createCircle = function (center, radius) {
  if (!this.getMap()) return
  let style_ = new olStyleFactory(this.style_)
  if (!this.layer) {
    this.layer = createVectorLayer(this.getMap(), this.layerName, {
      create: true
    })
    this.layer.setStyle(style_)
  }
  let params = this.transformCenterAndRadius_(center, radius)
  if (!this.circleFeature) {
    this.circleFeature = new ol.Feature({
      geometry: new ol.geom.Circle(params['center'], params['radius'])
    })
    let uuid = (this.draw && this.draw.get('uuid')) ? this.draw.get('uuid') : getuuid()
    this.circleFeature.set('uuid', uuid)
    this.layer.getSource().addFeature(this.circleFeature)
    this.circleFeature.getGeometry().on('change', evt => {
      let geom = evt.target
      let coordinates = geom.getLastCoordinate()
      this.center_ = geom.getCenter()
      this.radius = this.mathRadius(this.center_, coordinates)
      this.addLabelFeature_(this.center_, 'center')
      this.addLabelFeature_(coordinates, 'endLabel')
      this.drawTextLabel_(this.radius + ' m', coordinates)
      if (this.drawStart_ || !(this.isMouseDown && this.isDraging)) {
        this.dispatch('changeend', geom)
      }
    })
    this.circleFeature.getGeometry().dispatchEvent('change')
  } else {
    this.circleFeature.getGeometry().setCenterAndRadius(params['center'], params['radius'])
  }
}

/**
 * 获取要素空间信息
 * @param center
 * @param radius
 * @returns {ol.geom.Geometry}
 * @private
 */
ol.interaction.FreeHandCircle.prototype.transformCenterAndRadius_ = function (center, radius) {
  let center_ = ol.proj.transform(center, this._getProjectionCode(), 'EPSG:4326')
  let sourceGeom = new ol.geom.Circle(center_, (this.transformRadius(center_, radius)))
  let trans_ = sourceGeom.transform('EPSG:4326', this._getProjectionCode())
  return {
    center: trans_.getCenter(),
    radius: trans_.getRadius()
  }
}

/**
 * 添加中心点和label要素
 * @param coordinates
 * @param type
 * @private
 */
ol.interaction.FreeHandCircle.prototype.addLabelFeature_ = function (coordinates, type) {
  if (type === 'center') {
    if (!this.centerFeature) {
      this.centerFeature = new ol.Feature({
        uuid: this.circleFeature.get('uuid'),
        geometry: new ol.geom.Point(coordinates)
      })
      if (this.centerStyle) {
        let _style = new olStyleFactory(this.centerStyle)
        this.centerFeature.setStyle(_style)
      }
      this.layer.getSource().addFeature(this.centerFeature)
    } else {
      this.centerFeature.setGeometry(new ol.geom.Point(coordinates))
    }
  } else {
    if (!this.labelFeature) {
      this.labelFeature = new ol.Feature({
        uuid: this.circleFeature.get('uuid'),
        geometry: new ol.geom.Point(coordinates)
      })
      let _style = new olStyleFactory({
        image: {
          type: 'icon',
          image: {
            imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAATCAYAAAGCZu9cAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTAyQjQ0OTk5MUZGMTFFN0JCMzdENDYyNTY0RDI4MzAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTAyQjQ0OUE5MUZGMTFFN0JCMzdENDYyNTY0RDI4MzAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMDJCNDQ5NzkxRkYxMUU3QkIzN0Q0NjI1NjREMjgzMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMDJCNDQ5ODkxRkYxMUU3QkIzN0Q0NjI1NjREMjgzMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Poms414AAAUoSURBVHjaYmxqamJg+PTJn+H//0gGBoYVtT09G1iADMm86uoNDBAQDsSMTEDi+bPHj9/9//eP4dWzZx9AMgABxAjW/vHjCrA6fv4Ixo8fPvwHAgYYYObi4rpnZmoaCLSAYfKUKSIAAcQA0nJkz54nP3/8+I+OTx858hykG2SZiJ6JifS7N28YXEqvMCDTqlpaEiCjAQIIYjkDAwvQAd0gJ0OtfAl0SD5EgoFBubys7A4DJsjr7OoC+unjxyXfv38HGw2ikdmcv36dZ2Lg4Dj5/etXhlXlEgwgGoX948cMJgZ29obZEybs5+TmZuDg5ARjEHt2f/8+Bj6+mQABBHMkI8PPn8YO9vbrbZydZZADCB0wMjIynDx06NnuLVscgR65VVtbCw4ODoYvX+aU1tScNraykgG578ePHwwOhRfANAzD+CB5PVNTqdLm5psMHz70gQwGGSLG8O+fyvcvX+B+8ai8AbYVxgdhEACJw/jfgOqBwAoW5sxA2gdoalVmebnZD6BNhAA7BwfDjK6uMwwCApZA7/wBxctfIN4IFNg9feZMTSBbCYi5cej/BsQPgPgaUP0XmCBAAMECFhK437+LMvz6lQtkq2JoB4U2IyPIn1OBAfoGJgwKWBYomxOYEFaVtbR4srKxMTPgih1gzABBfWtp6XagS7xhwqCAZWP4/HlGZUeHDzD6mP/8/s3w588f7Bgk9/s3I1CtFzAM5yEbouYTHOz+6+dPuGJQUgRhXPxfv34xRKWmBiIbog7MHiK/gbaAMCx6NzcpM8DEQGxYFMPEpBUUBIBBwAszhPPHt29//gBNB+H1NbJgDTA+DIMASA7G//v7939gAH+FGfLm6L59T0DOhNkCyjiBLY/hfBAbJAbjg9SePnr0CVDvP5ghVy5dv77q65cvH/8Cix2Yv5cVi2Bl//37F4S/Hd6/vxAWJqAofsbAyrp26ZIlDDrq6mFmtrZS3Dw8nNhiGJiaf549fvzZuXPnmhl4eDYgGwJy0nmgQS+v3Lt3EIjFQKUbFjNA6l4D8VUGTk64V0AAIMCQUywk1YIM/vVLDJhlE4EZ09vAzExMUU2ND5hfmAUEBdkZiASfP3369e3r1z9PHz78curwYZDlG4CJdQYwMt4hqwOleJhvYA7gBAacBsPXrx2egYG6RhYWEv/+/WMgFwgKC3OBaA0dHRFnb28FRiYm02sXLhRsWLbsEtBBsUAHPUdWzwKNZBFgKHjKiImVx9bWav6FJmxswK38Gpje1alFkhwIqGpriwJznfPmVasOXzl/PgXomAPIDuEHYh1gVMT5hIUp/gQWa9hKaa+a23D2thZVcHZGByBxkDqYg0B8dPAXWJa4BwQoXgElNAYGW+QczAuuy/794+Hm5maD5Q1kjOyIjfUKDNjUwDBIHtnx6PKgkAaWWUx8AgJ8wHaAKHKIgMroXwwsLM8e3b//QUxKSgjdt2uqpMF0SNtTBv/GByhiyAAkj67nN5pZzMzMDO/fvv326ePHG8jFNMgh74H4HjA/7li9aBF/YESErpS8vAiwvYARRStKxeBsbFGDTx5U8QKLf4aP799/XDpr1hlg1Z8Hqj2QHQKqia6DQ4WP79v69etNgBWPRUBUlJKMggLYQaASCJSD8NXw2OoVJiBmZmEBtibYGd69fv1h+Zw5d4BlzWJgSMwHqviCnmtg1SIohT0G6roAxPs2bNsmAWxmqAPDVhHoCn4g5iM5DzMyfmZgYnoLjPZLQDN3ACu6u0DRD9DkgAIAomQEZFjvy7gAAAAASUVORK5CYII='
          }
        }
      })
      this.labelFeature.set('free-hand-circle-lable', true)
      this.labelFeature.setStyle(_style)
      this.layer.getSource().addFeature(this.labelFeature)
    } else {
      this.labelFeature.setGeometry(new ol.geom.Point(coordinates))
    }
  }
}

/**
 * 半径变化的实时显示
 * @param text
 * @param coordinates
 * @private
 */
ol.interaction.FreeHandCircle.prototype.drawTextLabel_ = function (text, coordinates) {
  if (!this.textOverlay) {
    let editor = document.createElement('span')
    editor.className = 'free-hand-circle-label'
    editor.innerHTML = text
    this.textOverlay = new ol.Overlay({
      element: editor,
      position: coordinates,
      positioning: 'center-left',
      offset: [20, 0]
    })
    this.getMap().addOverlay(this.textOverlay)
  } else {
    let element = this.textOverlay.getElement()
    element.innerHTML = text
    this.textOverlay.setPosition(coordinates)
    this.getMap().render()
  }
}

/**
 * 获取更新后的icon
 * @param text
 * @returns {string}
 * @private
 */
ol.interaction.FreeHandCircle.prototype.getImageSrc_ = function (text) {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  ctx.font = '30px Arial'
  ctx.textAlign = 'center'
  let width = ctx.measureText(text).width
  let height = 20
  canvas.width = width + 8
  canvas.height = height + 4
  ctx.fillText(text, 2, 10)
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
  let image = canvas.toDataURL('image/.png', 1)
  return image
}

/**
 * 转换半径
 * @param center
 * @param meterRadius
 * @returns {number}
 */
ol.interaction.FreeHandCircle.prototype.transformRadius = function (center, meterRadius) {
  try {
    let lastCoords = this.wgs84Sphere.offset(center, meterRadius, (270 / 360) * 2 * Math.PI) // 计算偏移量
    let [ptx, pty] = [(center[0] - lastCoords[0]), (center[1] - lastCoords[1])]
    let transformRadiu = (Math.sqrt(Math.pow(ptx, 2) + Math.pow(pty, 2)))
    return transformRadiu
  } catch (e) {
    console.log(e)
  }
}

/**
 * 计算圆的半径
 * @param center
 * @param coords
 * @returns {string}
 */
ol.interaction.FreeHandCircle.prototype.mathRadius = function (center, coords) {
  let radius_ = ''
  if (center && coords) {
    let c1 = ol.proj.transform(this.center_, this._getProjectionCode(), 'EPSG:4326')
    let c2 = ol.proj.transform(coords, this._getProjectionCode(), 'EPSG:4326')
    let radius = this.wgs84Sphere.haversineDistance(c1, c2)
    if (this.options['maxRadius'] && radius > this.options['maxRadius']) {
      radius_ = this.options['maxRadius'] - 1
    } else if (this.options['minRadius'] && radius < this.options['minRadius']) {
      radius_ = this.options['minRadius'] - 1
    } else {
      radius_ = radius
    }
    radius_ = Math.floor(radius_) + 1
  }
  return radius_
}

/**
 * 获取当前视图投影
 * @returns {string}
 * @private
 */
ol.interaction.FreeHandCircle.prototype._getProjectionCode = function () {
  let code = ''
  if (this.getMap()) {
    code = this.getMap().getView().getProjection().getCode()
  } else {
    code = 'EPSG:3857'
  }
  return code
}

/**
 * 重新设置半径
 * @param radius
 */
ol.interaction.FreeHandCircle.prototype.setRadius = function (radius) {
  if (this.circleFeature && this.circleFeature.getGeometry()) {
    let geom = this.circleFeature.getGeometry()
    let params = this.transformCenterAndRadius_(this.center_, radius)
    geom.setCenterAndRadius(params['center'], params['radius'])
    geom.dispatchEvent('change')
  } else {
    throw new Error('未创建Circle实例。')
  }
}

/**
 * 重新设置中心点
 * @param center
 */
ol.interaction.FreeHandCircle.prototype.setCenter = function (center) {
  if (this.circleFeature && this.circleFeature.getGeometry()) {
    let geom = this.circleFeature.getGeometry()
    let params = this.transformCenterAndRadius_(center, this.radius)
    geom.setCenterAndRadius(params['center'], params['radius'])
    geom.dispatchEvent('change')
  } else {
    throw new Error('未创建Circle实例。')
  }
}

/**
 * 重新设置半径和中心点
 * @param center
 * @param radius
 */
ol.interaction.FreeHandCircle.prototype.setCenterRadius = function (center, radius) {
  if (this.circleFeature && this.circleFeature.getGeometry()) {
    let geom = this.circleFeature.getGeometry()
    let params = this.transformCenterAndRadius_(center, radius)
    geom.setCenterAndRadius(params['center'], params['radius'])
    geom.dispatchEvent('change')
  } else {
    throw new Error('未创建Circle实例。')
  }
}

/**
 * 设置激活状态
 * @param active
 */
ol.interaction.FreeHandCircle.prototype.setActive = function (active) {
  ol.interaction.Pointer.prototype.setActive.call(this, active)
}

/**
 * 销毁
 */
ol.interaction.FreeHandCircle.prototype.destroy = function () {
  if (this.draw) {
    this.removeLastInteraction_()
  }
  if (this.textOverlay && this.textOverlay instanceof ol.Overlay) {
    this.getMap().removeOverlay(this.textOverlay)
    this.textOverlay = null
  }
  if (this.layer) {
    this.layer.getSource().clear()
    this.circleFeature = null
    this.centerFeature = null
    this.labelFeature = null
  }
  this.coordinate_ = null
  this.feature_ = null
  this.drawStart_ = false
  this.center_ = []
  this.radius = ''
  this.isDraging = false
  this.isMouseDown = false
}

let olInteractionFreeHandCircle = ol.interaction.FreeHandCircle
export default olInteractionFreeHandCircle
