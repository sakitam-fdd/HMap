/**
 * Created by FDD on 2017/7/28.
 * @desc 用于图层比较
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
ol.control.CompareLayer = function (beforeMap, afterMap, params) {
  this.options = params || {}
  if (beforeMap && afterMap) {
    this.beforeMap = beforeMap
    this.afterMap = afterMap
  } else {
    throw new Error('图层必须传入！')
  }

  this.orderLayerZindex()

  this.className = (this.options.className !== undefined ? this.options.className : 'hmap-compare')

  /**
   * 当前截取位置占整个视图宽度的比例
   * @type {number}
   */
  this.initPosition = (this.options['initPosition'] !== undefined ? this.options['initPosition'] : 0.5)

  /**
   * 是否正在拖拽
   * @type {boolean}
   * @private
   */
  this.dragging_ = false

  /**
   * 原始X
   * @type {null}
   * @private
   */
  this.previousX_ = null

  /**
   * 原始Y
   * @type {null}
   * @private
   */
  this.previousY_ = null

  /**
   * @private
   * @type {Element}
   */
  this.element_ = htmlUtils.create('div', (this.className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))

  /**
   * @private
   * @type {Element}
   */
  let innerElement_ = htmlUtils.create('div', this.className + '-inner', this.element_)

  Events.listen(innerElement_, 'pointerdown', this.handleDraggerStart_, this)
  Events.listen(innerElement_, 'pointermove', this.handleDraggerDrag_, this)
  Events.listen(innerElement_, 'pointerup', this.handleDraggerEnd_, this)
  Events.listen(window, 'pointerup', this.handleDraggerEnd_, this)

  ol.control.Control.call(this, {
    element: this.element_,
    target: this.options['target']
  })
}

ol.inherits(ol.control.CompareLayer, ol.control.Control)

/**
 * setup
 */
ol.control.CompareLayer.prototype.initControl = function () {
  /**
   * 获取当前视图大小
   * @type {ClientRect}
   * @private
   */
  this._bounds = this.getMap().getTargetElement().getBoundingClientRect()
  this.percent = 0.5
  this._setPosition(this._bounds.width, this._bounds.width / 2)
  this.resize()
  this.clipLayer()
}

/**
 * 处理拖拽
 * @param event
 * @private
 */
ol.control.CompareLayer.prototype.handleDraggerStart_ = function (event) {
  if (!this.dragging_ && event.target === htmlUtils.getElement('.' + this.className + '-inner', this.element_)[0]) {
    this.previousX_ = event.clientX
    this.previousY_ = event.clientY
    this.dragging_ = true
  }
}

/**
 * 处理拖动事件
 * @param event
 * @private
 */
ol.control.CompareLayer.prototype.handleDraggerDrag_ = function (event) {
  if (this.dragging_) {
    this._bounds = this.getMap().getTargetElement().getBoundingClientRect()
    this._setPosition(this._bounds.width, this._getX(event))
    this.previousX_ = event.clientX
    this.previousY_ = event.clientY
  }
}

/**
 * 处理拖拽结束事件
 * @param event
 * @private
 */
ol.control.CompareLayer.prototype.handleDraggerEnd_ = function (event) {
  if (this.dragging_) {
    this.dragging_ = false
    this.previousX_ = undefined
    this.previousY_ = undefined
  }
}

/**
 * 通过canvas切割视图
 */
ol.control.CompareLayer.prototype.clipLayer = function () {
  let that = this
  this.getMap().un('precompose', this.precompose)
  this.getMap().un('postcompose', this.postcompose)
  this.precompose = this.beforeMap.on('precompose', event => {
    let ctx = event.context
    let width = ctx.canvas.width * (that.initPosition)
    ctx.save()
    ctx.beginPath()
    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height)
    ctx.clip()
  })
  this.postcompose = this.beforeMap.on('postcompose', event => {
    let ctx = event.context
    ctx.restore()
  })
}

/**
 * 设置切割位置
 * @param sourceWidth
 * @param value
 * @private
 */
ol.control.CompareLayer.prototype._setPosition = function (sourceWidth, value) {
  let pos = 'translate(' + value + 'px, 0)'
  this.element_.style.transform = pos
  this.element_.style.WebkitTransform = pos
  this._x = value
  this.percent = value / sourceWidth
  this.initPosition = value / sourceWidth
  this.getMap().render()
}

/**
 * 窗口变化事件
 */
ol.control.CompareLayer.prototype.resize = function () {
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
 * 获取当前位置
 * @param e
 * @returns {number}
 * @private
 */
ol.control.CompareLayer.prototype._getX = function (e) {
  e = e.touches ? e.touches[0] : e
  let x = e.clientX - this._bounds.left
  if (x < 0) x = 0
  if (x > this._bounds.width) x = this._bounds.width
  return x
}

/**
 * 设置地图
 * @param map
 */
ol.control.CompareLayer.prototype.setMap = function (map) {
  if (map && map instanceof ol.Map) {
    ol.control.Control.prototype.setMap.call(this, map)
    if (map) {
      map.render()
      this.initControl()
    }
  } else {
    throw Error('传入的不是地图对象！')
  }
}

/**
 * 设置上一级图层
 * @param beforeMap
 */
ol.control.CompareLayer.prototype.setBeforeLayet = function (beforeMap) {
  if (beforeMap) {
    this.beforeMap = beforeMap
    this.orderLayerZindex()
  } else {
    throw Error('设置图层错误！')
  }
}

/**
 * 设置下一级图层
 * @param afterMap
 */
ol.control.CompareLayer.prototype.setAfterLayer = function (afterMap) {
  if (afterMap) {
    this.afterMap = afterMap
    this.orderLayerZindex()
  } else {
    throw Error('设置图层错误！')
  }
}

/**
 * 调整相关图层层级，避免图层压盖
 */
ol.control.CompareLayer.prototype.orderLayerZindex = function () {
  if (this.afterMap && this.beforeMap) {
    let afterMapIndex = this.afterMap.getZIndex()
    let beforeMapIndex = this.beforeMap.getZIndex()
    let max = Math.max(afterMapIndex, beforeMapIndex)
    let min = Math.min(afterMapIndex, beforeMapIndex)
    if (max === min) {
      max = max + 1
    }
    this.beforeMap.setZIndex(max)
    this.afterMap.setZIndex(min)
  }
}

let olControlCompareLayer = ol.control.CompareLayer
export default olControlCompareLayer
