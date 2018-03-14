/**
 * Created by FDD on 2017/9/20.
 * @desc 视图旋转控制器
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
ol.control.RotateControl = function (params = {}) {
  this.className = params.className !== undefined ? params.className : 'hmap-rotate-control'

  let render = params.render ? params.render : ol.control.RotateControl.render

  /**
   * 重置回调
   */
  this.callResetNorth_ = params.resetNorth ? params.resetNorth : undefined

  /**
   * 动画时延
   * @type {number}
   * @private
   */
  this.duration_ = params.duration !== undefined ? params.duration : 250

  /**
   * 是否自动隐藏
   */
  this.autoHide_ = params.autoHide !== undefined ? params.autoHide : true

  /**
   * element
   */
  let element = this.initDomInternal_(this.className)

  /**
   * 旋转角度
   * @type {undefined}
   * @private
   */
  this.rotation_ = undefined

  ol.control.Control.call(this, {
    element: element,
    render: render,
    target: params.target
  })
}

ol.inherits(ol.control.RotateControl, ol.control.Control)

/**
 * 初始化dom
 * @private
 */
ol.control.RotateControl.prototype.initDomInternal_ = function (className) {
  let element = htmlUtils.create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))
  let rButton = htmlUtils.create('button', className + '-inner right-button', element)
  let cButton = htmlUtils.create('button', className + '-inner center-button', element, className + '-inner-center')
  this.label_ = cButton
  let lButton = htmlUtils.create('button', className + '-inner left-button', element)
  Events.listen(rButton, 'click', ol.control.RotateControl.prototype.handleClick_.bind(this, 'right'))
  Events.listen(cButton, 'click', ol.control.RotateControl.prototype.handleClick_.bind(this, 'center'))
  Events.listen(lButton, 'click', ol.control.RotateControl.prototype.handleClick_.bind(this, 'left'))
  return element
}

/**
 * 处理点击事件
 * @param type
 * @param event
 * @private
 */
ol.control.RotateControl.prototype.handleClick_ = function (type, event) {
  event.preventDefault()
  this.resetNorth_(type)
}

/**
 * 恢复正北方向
 * @private
 */
ol.control.RotateControl.prototype.resetNorth_ = function (type) {
  let rotation = 0
  if (type === 'center') {
    rotation = 0
    if (this.callResetNorth_ !== undefined) {
      this.callResetNorth_()
    } else {
      this.rotationView_(rotation, type)
    }
  } else if (type === 'left') {
    rotation = -90
    this.rotationView_(rotation)
  } else {
    rotation = 90
    this.rotationView_(rotation)
  }
}

/**
 * 旋转视图
 * @param rotation
 * @param type
 * @private
 */
ol.control.RotateControl.prototype.rotationView_ = function (rotation, type) {
  let map = this.getMap()
  let view = map.getView()
  let r = type === 'center' ? 0 : view.getRotation() + (rotation / 180 * Math.PI)
  if (view && view instanceof ol.View) {
    if (view.getRotation() !== undefined) {
      if (this.duration_ > 0) {
        view.animate({
          rotation: r,
          duration: this.duration_,
          easing: ol.easing.easeOut
        })
      } else {
        view.setRotation(0)
      }
    }
  } else {
    throw new Error('未获取到视图！')
  }
}

/**
 * 根据视图更新dom
 * @param mapEvent
 */
ol.control.RotateControl.render = function (mapEvent) {
  let frameState = mapEvent.frameState
  if (!frameState) {
    return
  }
  let rotation = frameState.viewState.rotation
  if (rotation !== this.rotation_) {
    let transform = 'rotate(' + rotation + 'rad)'
    if (this.autoHide_) {
      let contains = this.element.classList.contains(BASE_CLASS_NAME.CLASS_HIDDEN)
      if (!contains && rotation === 0) {
        this.element.classList.add(BASE_CLASS_NAME.CLASS_HIDDEN)
      } else if (contains && rotation !== 0) {
        this.element.classList.remove(BASE_CLASS_NAME.CLASS_HIDDEN)
      }
    }
    this.label_.style.msTransform = transform
    this.label_.style.webkitTransform = transform
    this.label_.style.transform = transform
  }
  this.rotation_ = rotation
}

let olControlRotate = ol.control.RotateControl
export default olControlRotate
