/**
 * Created by FDD on 2017/7/28.
 * @desc 图层滤镜
 */
import ol from 'openlayers'
import * as Events from '../utils/events'
ol.interaction.LayerMagnify = function (params) {
  this.options = params || {}
  if (this.options['magnifyLayer']) {
    this.magnifyLayer = this.options['magnifyLayer']
  } else {
    throw new Error('图层必须传入！')
  }

  /**
   * 当前图层所在位置
   * @type {null}
   * @private
   */
  this._currentLayerIndex = null

  /**
   * 默认滤镜半径
   * @type {number}
   */
  this.radius = (typeof this.options['radius'] === 'number') ? this.options['radius'] : 75

  /**
   * 滤镜最大半径
   * @type {number}
   */
  this.minRadius = (typeof this.options['minRadius'] === 'number') ? this.options['minRadius'] : 150

  /**
   * 滤镜最小半径
   * @type {number}
   */
  this.maxRadius = (typeof this.options['maxRadius'] === 'number') ? this.options['maxRadius'] : 25

  /**
   * 滤镜边框宽度
   * @type {number}
   */
  this.lineWidth = (typeof this.options['lineWidth'] === 'number') ? this.options['lineWidth'] : 2

  /**
   * 滤镜边线颜色
   * @type {number}
   */
  this.strokeStyle = (this.options['strokeStyle'] ? this.options['strokeStyle'] : 'rgba(0, 0, 0, 0.5)')

  /**
   * 滤镜放大对应键值
   * @type {number}
   */
  this.zoomInKeyCode = this.options['zoomInKeyCode'] !== undefined ? this.options['zoomInKeyCode'] : 38

  /**
   * 滤镜缩小对应键值
   * @type {number}
   */
  this.zoomOutKeyCode = this.options['zoomOutKeyCode'] !== undefined ? this.options['zoomOutKeyCode'] : 40
  /**
   * 当前鼠标位置
   * @type {null}
   */
  this.mousePosition = null
  ol.interaction.Pointer.call(this, {
    handleEvent: ol.interaction.LayerMagnify.handleEvent_,
    handleMoveEvent: ol.interaction.LayerMagnify.handleMoveEvent_
  })
}

ol.inherits(ol.interaction.LayerMagnify, ol.interaction.Pointer)

/**
 * 处理移动事件
 * @param mapBrowserEvent
 */
ol.interaction.LayerMagnify.handleMoveEvent_ = function (mapBrowserEvent) {
  this.mousePosition = mapBrowserEvent['pixel']
  this.getMap().render()
}
/**
 * 初始化事件处理机
 * @param evt
 * @returns {*}
 * @private
 */
ol.interaction.LayerMagnify.handleEvent_ = function (evt) {
  return ol.interaction.Pointer.handleEvent.call(this, evt)
}
/**
 * 初始化渲染事件
 * @private
 */
ol.interaction.LayerMagnify.prototype.initEvents_ = function () {
  if (this.getMap()) {
    Events.listen(this.getMap().getTargetElement(), 'mouseout', this.handleMouseOut_, this)
    Events.listen(document, 'keydown', this.handleKeyDown_, this)
    // before rendering the layer, do some clipping
    this.magnifyLayer.on('postcompose', this.handlePostcompose_, this)
  }
}

/**
 * 处理鼠标移除事件
 * @param event
 * @private
 */
ol.interaction.LayerMagnify.prototype.handleMouseOut_ = function (event) {
  this.mousePosition = null
  this.getMap().render()
}

/**
 * 处理键盘事件
 * @param event
 * @private
 */
ol.interaction.LayerMagnify.prototype.handleKeyDown_ = function (event) {
  if (event.which === this.zoomInKeyCode) {
    this.radius = Math.min(this.radius + 5, 150)
    this.getMap().render()
    event.preventDefault()
  } else if (event.which === this.zoomOutKeyCode) {
    this.radius = Math.max(this.radius - 5, 25)
    this.getMap().render()
    event.preventDefault()
  }
}

/**
 * 图层开始渲染之前事件处理
 * @param event
 * @private
 */
ol.interaction.LayerMagnify.prototype.handlePostcompose_ = function (event) {
  if (this.mousePosition) {
    let [context, pixelRatio] = [event.context, event.frameState.pixelRatio]
    let half = this.radius * pixelRatio
    let [centerX, centerY] = [this.mousePosition[0] * pixelRatio, this.mousePosition[1] * pixelRatio]
    let [originX, originY, size] = [centerX - half, centerY - half, (2 * half + 1)]
    let sourceData = context.getImageData(originX, originY, size, size).data
    let dest = context.createImageData(size, size)
    let destData = dest.data
    for (let j = 0; j < size; ++j) {
      for (let i = 0; i < size; ++i) {
        let dI = i - half
        let dJ = j - half
        let dist = Math.sqrt(dI * dI + dJ * dJ)
        let sourceI = i
        let sourceJ = j
        if (dist < half) {
          sourceI = Math.round(half + dI / 2)
          sourceJ = Math.round(half + dJ / 2)
        }
        let destOffset = (j * size + i) * 4
        let sourceOffset = (sourceJ * size + sourceI) * 4
        destData[destOffset] = sourceData[sourceOffset]
        destData[destOffset + 1] = sourceData[sourceOffset + 1]
        destData[destOffset + 2] = sourceData[sourceOffset + 2]
        destData[destOffset + 3] = sourceData[sourceOffset + 3]
      }
    }
    context.beginPath()
    context.arc(centerX, centerY, half, 0, 2 * Math.PI, false)
    context.lineWidth = this.lineWidth * pixelRatio
    context.strokeStyle = this.strokeStyle
    context.putImageData(dest, originX, originY)
    context.stroke()
    context.restore()
  }
}

/**
 * 设置地图对象
 * @param map
 */
ol.interaction.LayerMagnify.prototype.setMap = function (map) {
  if (map && map instanceof ol.Map) {
    ol.interaction.Interaction.prototype.setMap.call(this, map)
    this.initEvents_()
  } else {
    Events.unListen(this.getMap().getTargetElement(), 'mouseout', this.handleMouseOut_, this)
    Events.unListen(document, 'keydown', this.handleKeyDown_, this)
    // after rendering the layer, restore the canvas context
    this.magnifyLayer.un('postcompose', this.handlePostcompose_, this)
    ol.interaction.Interaction.prototype.setMap.call(this, map)
  }
}

let olInteractionLayerMagnify = ol.interaction.LayerMagnify

export default olInteractionLayerMagnify
