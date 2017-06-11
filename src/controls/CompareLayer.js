/**
 * Created by FDD on 2017/6/6.
 * @desc 用于图层比较
 */
import {ol} from '../constants'
import {DomUtil, css} from '../dom'
const CompareLayer = function (beforeMap, afterMap, params) {
  this.options = params || {}
  let className = (this.options.className !== undefined ? this.options.className : 'hmap-compare')

  if (!this.options['map'] || !(this.options['map'] instanceof ol.Map)) {
    throw new Error('缺少底图对象！')
  } else {
    this.map = this.options['map']
  }
  this.beforeMap = beforeMap
  this.afterMap = afterMap

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

  this._onDown = this._onDown.bind(this)
  this._onMove = this._onMove.bind(this)
  this._onMouseUp = this._onMouseUp.bind(this)
  /**
   * 获取当前视图大小
   * @type {ClientRect}
   * @private
   */
  this._bounds = this.getMap().getTargetElement().getBoundingClientRect()
  this.percent = 0.5
  this._setPosition(this._bounds.width, this._bounds.width / 2)

  if (this.options && this.options.mousemove) {
    this.getMap().getTargetElement().addEventListener('mousemove', this._onMove)
  }
  this.addEvent()
  this.resize()
  ol.control.Control.call(this, {
    element: this.element_,
    target: this.options['target']
  })
}

ol.inherits(CompareLayer, ol.control.Control)

/**
 * 获取当前地图对象
 * @returns {*}
 */
CompareLayer.prototype.getMap = function () {
  return this.map
}

/**
 * 通过canvas切割视图
 * @param beforeMap
 * @param value
 */
CompareLayer.prototype.clipLayer = function (beforeMap, value) {
  this.getMap().un('precompose', this.precompose)
  this.getMap().un('postcompose', this.postcompose)
  this.precompose = beforeMap.on('precompose', event => {
    let ctx = event.context
    let width = ctx.canvas.width * (value)
    ctx.save()
    ctx.beginPath()
    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height)
    ctx.clip()
  })
  this.postcompose = beforeMap.on('postcompose', event => {
    let ctx = event.context
    ctx.restore()
  })
}

/**
 * 添加事件监听
 */
CompareLayer.prototype.addEvent = function () {
  this.innerElement_.addEventListener('mousedown', this._onDown)
  this.innerElement_.addEventListener('touchstart', this._onDown)
}

/**
 * 鼠标按下事件处理
 * @param e
 * @private
 */
CompareLayer.prototype._onDown = function (e) {
  if (e.touches) {
    document.addEventListener('touchmove', this._onMove)
    document.addEventListener('touchend', this._onTouchEnd)
  } else {
    document.addEventListener('mousemove', this._onMove)
    document.addEventListener('mouseup', this._onMouseUp)
  }
}

/**
 * 设置切割位置
 * @param x
 * @private
 */
CompareLayer.prototype._setPosition = function (sourceWidth, value) {
  let pos = 'translate(' + value + 'px, 0)'
  this.element_.style.transform = pos
  this.element_.style.WebkitTransform = pos
  this._x = value
  this.percent = value / sourceWidth
  this.clipLayer(this.beforeMap, value / sourceWidth)
}

/**
 * 窗口变化事件
 */
CompareLayer.prototype.resize = function () {
  let resizeEvt = (('orientationchange' in window) ? 'orientationchange' : 'resize')
  let doc = window.document
  let that = this
  window.addEventListener(resizeEvt, function () {
    setTimeout(function () {
      that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
      that._setPosition(that._bounds.width, that._bounds.width * that.percent)
    }, 50)
  }, false)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setTimeout(function () {
        that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
        that._setPosition(that._bounds.width, that._bounds.width * that.percent)
      }, 50)
    }
  }, false)
  if (doc.readyState === 'complete') {
    setTimeout(function () {
      that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
      that._setPosition(that._bounds.width, that._bounds.width * that.percent)
    }, 50)
  } else {
    doc.addEventListener('DOMContentLoaded', function (e) {
      setTimeout(function () {
        that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
        that._setPosition(that._bounds.width, that._bounds.width * that.percent)
      }, 50)
    }, false)
  }
}

/**
 * 处理移动事件
 * @param e
 * @private
 */
CompareLayer.prototype._onMove = function (e) {
  this._bounds = this.getMap().getTargetElement().getBoundingClientRect()
  this._setPosition(this._bounds.width, this._getX(e))
}

/**
 * 处理按键抬起事件
 * @private
 */
CompareLayer.prototype._onMouseUp = function () {
  document.removeEventListener('mousemove', this._onMove)
  document.removeEventListener('mouseup', this._onMouseUp)
}

/**
 * 监听触摸结束事件
 * @private
 */
CompareLayer.prototype._onTouchEnd = function () {
  document.removeEventListener('touchmove', this._onMove)
  document.removeEventListener('touchend', this._onTouchEnd)
}

/**
 * 获取当前位置
 * @param e
 * @returns {number}
 * @private
 */
CompareLayer.prototype._getX = function (e) {
  e = e.touches ? e.touches[0] : e
  let x = e.clientX - this._bounds.left
  if (x < 0) x = 0
  if (x > this._bounds.width) x = this._bounds.width
  return x
}

export default CompareLayer
