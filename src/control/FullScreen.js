/**
 * Created by FDD on 2017/9/19.
 * @desc 全屏控制
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
import screenfull from 'screenfull'
ol.control.FullScreenMenu = function (params = {}) {
  let options = params

  /**
   * 基础类名
   * @type {string}
   */
  let className = options.className !== undefined ? options.className : 'hmap-control-full-screen'

  this.label = options.label !== undefined ? options.label : '\u2922'

  this.labelActive = options.labelActive !== undefined ? options.labelActive : '\u00d7'

  /**
   * 快捷键
   * @private
   * @type {boolean}
   */
  this.keys_ = options.keys !== undefined ? options.keys : false

  /**
   * 图标大小
   * @type {[*]}
   * @private
   */
  this.size_ = options.size !== undefined ? options.size : [16, 16]

  /**
   * 要放大的容器
   */
  this.source_ = options.source

  /**
   * delta
   */
  this.element_ = this.initDomInternal_(className)

  ol.control.Control.call(this, {
    element: this.element_,
    target: options.target
  })
}
ol.inherits(ol.control.FullScreenMenu, ol.control.Control)

/**
 * 处理点击事件
 * @param event
 * @private
 */
ol.control.FullScreenMenu.prototype.handleClick_ = function (event) {
  event.preventDefault()
  let map = this.getMap()
  if (map) {
    let element = null
    if (this.source_) {
      element = typeof this.source_ === 'string'
        ? document.getElementById(this.source_) : this.source_
    } else {
      element = this.getMap().getTargetElement()
    }
    if (screenfull.enabled) {
      screenfull.toggle(element)
      screenfull.on('change', () => {
        if (screenfull.isFullscreen) {
          this.element_.firstElementChild.innerHTML = this.labelActive
        } else {
          this.element_.firstElementChild.innerHTML = this.label
        }
      })
    }
  }
}

/**
 * 初始化相关dom
 * @param className
 * @param delta
 * @returns {Element}
 * @private
 */
ol.control.FullScreenMenu.prototype.initDomInternal_ = function (className) {
  let element = htmlUtils.create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))
  let inner = htmlUtils.create('span', className + '-inner', element)
  inner.setAttribute('title', '放大')
  inner.innerHTML = this.label
  Events.listen(element, 'click', this.handleClick_, this)
  return element
}

let olControlFullScreenMenu = ol.control.FullScreenMenu
export default olControlFullScreenMenu
