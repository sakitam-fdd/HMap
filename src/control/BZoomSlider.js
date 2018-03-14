/**
 * Created by FDD on 2017/7/28.
 * @desc 定制缩放控制条(仿百度)
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
ol.control.BZoomSlider = function (params) {
  this.options = params || {}

  /**
   * 当前分辨率
   * @type {undefined}
   * @private
   */
  this.currentResolution_ = undefined

  /**
   * 滑块默认方向（默认竖向）
   * @type {number}
   * @private
   */
  this.direction_ = ol.control.BZoomSlider.Direction_.VERTICAL

  /**
   * 是否正在拖拽
   * @type {boolean}
   * @private
   */
  this.dragging_ = false

  /**
   * 高度限制
   * @type {number}
   * @private
   */
  this.heightLimit_ = 0

  /**
   * 宽度限制
   * @type {number}
   * @private
   */
  this.widthLimit_ = 0

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
   * 计算出的视图大小（边框加边距）
   * @type {null}
   * @private
   */
  this.thumbSize_ = null

  /**
   * 滑块是否被初始化
   * @type {boolean}
   * @private
   */
  this.sliderInitialized_ = false

  /**
   * 动画过渡时延
   * @type {number}
   * @private
   */
  this.duration_ = this.options['duration'] !== undefined ? this.options['duration'] : 200
  /**
   * 视图限制
   * @type {{ANIMATING: number, INTERACTING: number}}
   */
  this.viewHint = {
    ANIMATING: 0,
    INTERACTING: 1
  }

  /**
   * @private
   * @type {number}
   */
  this.pixelDelta_ = this.options['pixelDelta'] !== undefined ? this.options['pixelDelta'] : 128

  let className = (this.options.className !== undefined ? this.options.className : 'hmap-zoom-slider')
  /**
   * @private
   * @type {Element}
   */
  this.element = htmlUtils.create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))

  let translateContent = htmlUtils.create('div', ('hmap-zoom-slider-translate-content' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), this.element)

  let silderContent = htmlUtils.create('div', ('hmap-zoom-slider-content' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), this.element)

  let translateN = htmlUtils.create('div', ('hmap-zoom-slider-button hmap-zoom-slider-translate-n' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent)
  translateN.setAttribute('title', '向上平移')
  Events.listen(translateN, 'click',
    ol.control.BZoomSlider.prototype.handletranslateClick_.bind(this, 'translateN'))
  let translateS = htmlUtils.create('div', ('hmap-zoom-slider-button hmap-zoom-slider-translate-s' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent)
  translateS.setAttribute('title', '向下平移')
  Events.listen(translateS, 'click',
    ol.control.BZoomSlider.prototype.handletranslateClick_.bind(this, 'translateS'))
  let translateW = htmlUtils.create('div', ('hmap-zoom-slider-button hmap-zoom-slider-translate-w' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent)
  translateW.setAttribute('title', '向左平移')
  Events.listen(translateW, 'click',
    ol.control.BZoomSlider.prototype.handletranslateClick_.bind(this, 'translateW'))
  let translateE = htmlUtils.create('div', ('hmap-zoom-slider-button hmap-zoom-slider-translate-e' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent)
  translateE.setAttribute('title', '向右平移')
  Events.listen(translateE, 'click',
    ol.control.BZoomSlider.prototype.handletranslateClick_.bind(this, 'translateE'))
  let zoomIn = htmlUtils.create('div', ('hmap-zoom-slider-zoom-in' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), silderContent)
  zoomIn.setAttribute('title', '放大')
  Events.listen(zoomIn, 'click',
    ol.control.BZoomSlider.prototype.handleZoomClick_.bind(this, 1))

  let zoomOut = htmlUtils.create('div', ('hmap-zoom-slider-zoom-out' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), silderContent)
  zoomOut.setAttribute('title', '缩小')
  Events.listen(zoomOut, 'click',
    ol.control.BZoomSlider.prototype.handleZoomClick_.bind(this, -1))

  let slider = htmlUtils.create('div', ('hmap-zoom-slider-zoom-slider' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), silderContent)
  this.sliderBackgroundTop = htmlUtils.create('div', ('slider-background-top' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider)
  this.sliderBackgroundBottom = htmlUtils.create('div', ('slider-background-bottom' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider)
  let sliderBackgroundMask = htmlUtils.create('div', ('slider-background-mask' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider)
  sliderBackgroundMask.setAttribute('title', '缩放到此级别')
  this.sliderBar = htmlUtils.create('div', ('slider-bar' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider)
  this.sliderBar.setAttribute('title', '滑动缩放地图')
  /**
   * 滑块容器
   * @type {Element}
   */
  this.silderContent = silderContent

  Events.listen(this.silderContent, 'pointerdown', this.handleDraggerStart_, this)
  Events.listen(this.silderContent, 'pointermove', this.handleDraggerDrag_, this)
  Events.listen(this.silderContent, 'pointerup', this.handleDraggerEnd_, this)
  Events.listen(this.silderContent, 'click', this.handleContainerClick_, this)
  Events.listen(this.sliderBar, 'click', function (event) {
    event.stopPropagation()
  })
  let render = this.options['render'] ? this.options['render'] : ol.control.BZoomSlider.render
  ol.control.Control.call(this, {
    element: this.element,
    render: render,
    target: this.options['target']
  })
}

ol.inherits(ol.control.BZoomSlider, ol.control.Control)

/**
 * 处理缩放点击
 * @param delta
 * @param event
 * @private
 */
ol.control.BZoomSlider.prototype.handleZoomClick_ = function (delta, event) {
  event.preventDefault()
  this.zoomByDelta_(delta)
}

/**
 * 处理平移点击事件
 * @param type
 * @param event
 * @private
 */
ol.control.BZoomSlider.prototype.handletranslateClick_ = function (type, event) {
  event.preventDefault()
  let view = this.getMap().getView()
  let mapUnitsDelta = view.getResolution() * this.pixelDelta_
  let [deltaX, deltaY] = [0, 0]
  switch (type) {
    case 'translateN':
      deltaY = mapUnitsDelta
      break
    case 'translateS':
      deltaY = -mapUnitsDelta
      break
    case 'translateW':
      deltaX = mapUnitsDelta
      break
    case 'translateE':
      deltaX = -mapUnitsDelta
      break
  }
  let delta = [deltaX, deltaY]
  ol.coordinate.rotate(delta, view.getRotation())
  this.pan(view, delta, this.duration_)
}

/**
 * 平移地图
 * @param view
 * @param delta
 * @param optDuration
 */
ol.control.BZoomSlider.prototype.pan = function (view, delta, optDuration) {
  let currentCenter = view.getCenter()
  if (currentCenter) {
    let center = view.constrainCenter(
      [currentCenter[0] + delta[0], currentCenter[1] + delta[1]])
    if (optDuration) {
      view.animate({
        duration: optDuration,
        easing: ol.easing.linear,
        center: center
      })
    } else {
      view.setCenter(center)
    }
  }
}

/**
 * @param {number} delta Zoom delta.
 * @private
 */
ol.control.BZoomSlider.prototype.zoomByDelta_ = function (delta) {
  let view = this.getMap().getView()
  if (view && view instanceof ol.View) {
    let currentResolution = view.getResolution()
    if (currentResolution) {
      let newResolution = view.constrainResolution(currentResolution, delta)
      if (this.duration_ > 0) {
        if (view.getAnimating()) {
          view.cancelAnimations()
        }
        view.animate({
          resolution: newResolution,
          duration: this.duration_,
          easing: ol.easing.easeOut
        })
      } else {
        view.setResolution(newResolution)
      }
    }
  }
}

/**
 * 更新控制条element
 * @param {ol.MapEvent} mapEvent Map event.
 * @this {ol.control.BZoomSlider}
 * @api
 */
ol.control.BZoomSlider.render = function (mapEvent) {
  if (!mapEvent.frameState) {
    return
  }
  if (!this.sliderInitialized_) {
    this.initSlider_()
  }
  let res = mapEvent.frameState.viewState.resolution
  if (res !== this.currentResolution_) {
    this.currentResolution_ = res
    this.setThumbPosition_(res)
  }
}

/**
 * 允许的方向值
 * @type {{VERTICAL: number, HORIZONTAL: number}}
 * @private
 */
ol.control.BZoomSlider.Direction_ = {
  VERTICAL: 0,
  HORIZONTAL: 1
}

/**
 * 设置地图
 * @param map
 */
ol.control.BZoomSlider.prototype.setMap = function (map) {
  if (map && map instanceof ol.Map) {
    ol.control.Control.prototype.setMap.call(this, map)
    if (map) {
      map.render()
    }
  } else {
    throw Error('传入的不是地图对象！')
  }
}

/**
 * @inheritDoc
 */
ol.control.BZoomSlider.prototype.disposeInternal = function () {
  Events.listen(this.silderContent, 'pointercancel', function (event) {
  }, this)
  ol.control.Control.prototype.disposeInternal.call(this)
}

/**
 * 初始化滑块元素
 * @private
 */
ol.control.BZoomSlider.prototype.initSlider_ = function () {
  let container = this.silderContent
  let containerSize = {
    width: container.offsetWidth, height: container.offsetHeight
  }
  let thumb = htmlUtils.getElement('.slider-bar', container)[0]
  let computedStyle = getComputedStyle(thumb)
  let thumbWidth = thumb.offsetWidth +
    parseFloat(computedStyle['marginRight']) +
    parseFloat(computedStyle['marginLeft'])
  let thumbHeight = thumb.offsetHeight +
    parseFloat(computedStyle['marginTop']) +
    parseFloat(computedStyle['marginBottom'])
  this.thumbSize_ = [thumbWidth, thumbHeight]
  if (containerSize.width > containerSize.height) {
    this.direction_ = ol.control.BZoomSlider.Direction_.HORIZONTAL
    this.widthLimit_ = containerSize.width - thumbWidth
  } else {
    this.direction_ = ol.control.BZoomSlider.Direction_.VERTICAL
    this.heightLimit_ = containerSize.height - thumbHeight
  }
  this.sliderInitialized_ = true
}

/**
 * 容器点击事件处理
 * @param event
 * @private
 */
ol.control.BZoomSlider.prototype.handleContainerClick_ = function (event) {
  let view = this.getMap().getView()
  let relativePosition = this.getRelativePosition_(event.offsetX - this.thumbSize_[0] / 2, event.offsetY - this.thumbSize_[1] / 2)
  let resolution = this.getResolutionForPosition_(relativePosition)
  view.animate({
    resolution: view.constrainResolution(resolution),
    duration: this.duration_,
    easing: ol.easing.easeOut
  })
}

/**
 * 处理拖拽
 * @param event
 * @private
 */
ol.control.BZoomSlider.prototype.handleDraggerStart_ = function (event) {
  if (!this.dragging_ && event.target === htmlUtils.getElement('.slider-bar', this.silderContent)) {
    // this.getMap().getView().setHint(this.viewHint.INTERACTING, 1)
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
ol.control.BZoomSlider.prototype.handleDraggerDrag_ = function (event) {
  if (this.dragging_) {
    let element = htmlUtils.getElement('.slider-bar', this.silderContent)[0]
    let deltaX = event.clientX - this.previousX_ + parseInt(element.style.left, 10)
    let deltaY = event.clientY - this.previousY_ + parseInt(element.style.top, 10)
    let relativePosition = this.getRelativePosition_(deltaX, deltaY)
    this.currentResolution_ = this.getResolutionForPosition_(relativePosition)
    this.getMap().getView().setResolution(this.currentResolution_)
    this.setThumbPosition_(this.currentResolution_)
    this.previousX_ = event.clientX
    this.previousY_ = event.clientY
  }
}

/**
 * 处理拖拽结束事件
 * @param event
 * @private
 */
ol.control.BZoomSlider.prototype.handleDraggerEnd_ = function (event) {
  if (this.dragging_) {
    let view = this.getMap().getView()
    // view.setHint(ol.ViewHint.INTERACTING, -1)
    view.animate({
      resolution: view.constrainResolution(this.currentResolution_),
      duration: this.duration_,
      easing: ol.easing.easeOut
    })
    this.dragging_ = false
    this.previousX_ = undefined
    this.previousY_ = undefined
  }
}

/**
 * 计算指针位置（相对于父容器）
 * @param res
 * @private
 */
ol.control.BZoomSlider.prototype.setThumbPosition_ = function (res) {
  let position = this.getPositionForResolution_(res)
  let thumb = htmlUtils.getElement('.slider-bar', this.silderContent)[0]
  if (this.direction_ === ol.control.BZoomSlider.Direction_.HORIZONTAL) {
    thumb.style.left = this.widthLimit_ * position + 'px'
    this.sliderBackgroundBottom.style.width = this.widthLimit_ - (this.widthLimit_ * position - 5) + 'px'
  } else {
    thumb.style.top = this.heightLimit_ * position + 'px'
    this.sliderBackgroundBottom.style.height = this.heightLimit_ - (this.heightLimit_ * position - 5) + 'px'
  }
}

/**
 * 给出x和y偏移量的指针的相对位置
 * @param x
 * @param y
 * @returns {number}
 * @private
 */
ol.control.BZoomSlider.prototype.getRelativePosition_ = function (x, y) {
  let amount
  if (this.direction_ === ol.control.BZoomSlider.Direction_.HORIZONTAL) {
    amount = x / this.widthLimit_
  } else {
    amount = y / this.heightLimit_
  }
  return Math.min(Math.max(amount, 0), 1)
}

/**
 * 计算相关分辨率
 * @param position
 * @returns {number}
 * @private
 */
ol.control.BZoomSlider.prototype.getResolutionForPosition_ = function (position) {
  let view = this.getMap().getView()
  if (view && view instanceof ol.View) {
    return this.getResolutionForValueFunction(1 - position)
  }
}

/**
 * 获取值
 * @param resolution
 * @param optPower
 * @returns {number}
 */
ol.control.BZoomSlider.prototype.getValueForResolutionFunction = function (resolution, optPower) {
  let power = optPower || 2
  let view = this.getMap().getView()
  let maxResolution = view.getMaxResolution()
  let minResolution = view.getMinResolution()
  let max = Math.log(maxResolution / minResolution) / Math.log(power)
  return ((Math.log(maxResolution / resolution) / Math.log(power)) / max)
}

/**
 * 获取分辨率
 * @param value
 * @param optPower
 * @returns {number}
 */
ol.control.BZoomSlider.prototype.getResolutionForValueFunction = function (value, optPower) {
  let power = optPower || 2
  let view = this.getMap().getView()
  let maxResolution = view.getMaxResolution()
  let minResolution = view.getMinResolution()
  let max = Math.log(maxResolution / minResolution) / Math.log(power)
  return (maxResolution / Math.pow(power, value * max))
}

/**
 * 计算相关位置
 * @param res
 * @returns {number}
 * @private
 */
ol.control.BZoomSlider.prototype.getPositionForResolution_ = function (res) {
  let view = this.getMap().getView()
  if (view && view instanceof ol.View) {
    return (1 - this.getValueForResolutionFunction(res))
  }
}

let olControlBZoomSlider = ol.control.BZoomSlider

export default olControlBZoomSlider
