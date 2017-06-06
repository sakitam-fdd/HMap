/**
 * Created by FDD on 2017/6/6.
 * @desc 用于图层比较
 */
import {ol} from '../constants'
import {DomUtil} from '../dom'
const CompareLayer = function (beforeMap, afterMap, params) {
  this.options = params || {}
  let className = (this.options.className !== undefined ? this.options.className : 'hmap-compare')

  /**
   * @private
   * @type {Element}
   */
  this.element_ = DomUtil.create('div', (className + ' ' + ol.css.CLASS_UNSELECTABLE))

  /**
   * @private
   * @type {Element}
   */
  this.innerElement_ = DomUtil.create('div', className + '-inner', this.element_)

  this._onDown = this._onDown.bind(this)
  this._onMove = this._onMove.bind(this)
  this._onMouseUp = this._onMouseUp.bind(this)
  this._onTouchEnd = this._onTouchEnd.bind(this)

  this._clippedMap = beforeMap
  this._bounds = beforeMap.getContainer().getBoundingClientRect()
  this._setPosition(this._bounds.width / 2)

  beforeMap.on('resize', function () {
    this._bounds = beforeMap.getContainer().getBoundingClientRect()
    if (this._x) this._setPosition(this._x)
  }.bind(this))

  if (this.options && this.options.mousemove) {
    afterMap.getContainer().addEventListener('mousemove', this._onMove)
    beforeMap.getContainer().addEventListener('mousemove', this._onMove)
  }

  /**
   * 渲染器
   */
  let render = this.options['render'] ? this.options['render'] : ol.control.ScaleLine.render
  ol.control.Control.call(this, {
    element: this.element_,
    render: render,
    target: this.options['target']
  })
}

ol.inherits(CompareLayer, ol.control.Control)

/**
 * 通过canvas切割视图
 * @param beforeMap
 * @param swipe
 */
CompareLayer.prototype.clipLayer = function (beforeMap, swipe) {
  beforeMap.on('precompose', event => {
    let ctx = event.context
    let width = ctx.canvas.width * (swipe.value / 100)
    ctx.save()
    ctx.beginPath()
    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height)
    ctx.clip()
  })

  beforeMap.on('postcompose', event => {
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

CompareLayer.prototype.handleDragEvent = function () {

}

CompareLayer.prototype._setPointerEvents = function (v) {
  this._container.style.pointerEvents = v
  this._swiper.style.pointerEvents = v
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
CompareLayer.prototype._setPosition = function (x) {
  var pos = 'translate(' + x + 'px, 0)'
  this._container.style.transform = pos
  this._container.style.WebkitTransform = pos
  this._clippedMap.getContainer().style.clip = 'rect(0, 999em, ' + this._bounds.height + 'px,' + x + 'px)'
  this._x = x
}

CompareLayer.prototype._onMove = function (e) {
  if (this.options && this.options.mousemove) {
    this._setPointerEvents(e.touches ? 'auto' : 'none')
  }
  this._setPosition(this._getX(e))
}

CompareLayer.prototype._onMouseUp = function () {
  document.removeEventListener('mousemove', this._onMove)
  document.removeEventListener('mouseup', this._onMouseUp)
}

CompareLayer.prototype._onTouchEnd = function () {
  document.removeEventListener('touchmove', this._onMove)
  document.removeEventListener('touchend', this._onTouchEnd)
}

CompareLayer.prototype._getX = function (e) {
  e = e.touches ? e.touches[0] : e
  var x = e.clientX - this._bounds.left
  if (x < 0) x = 0
  if (x > this._bounds.width) x = this._bounds.width
  return x
}

export default CompareLayer
