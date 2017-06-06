/**
 * Created by FDD on 2017/5/14.
 * @desc 用于地图弹出气泡
 */
import { ol } from '../constants'
import { DomUtil } from '../dom'
import { getuuid } from '../utils/utils'
let Popover = function (map, params) {
  if (map && map instanceof ol.Map) {
    /**
     * 地图对象
     * @type {ol.Map}
     */
    this.map = map
  } else {
    throw new Error('传入的不是地图对象或者地图对象为空！')
  }

  /**
   * 当前气泡配置项
   * @type {*}
   */
  this.options = params || {}

  /**
   * 是否自动平移（不传时默认自动平移）
   */
  if (this.options['autoPan'] === undefined) {
    this.options['autoPan'] = true
  }

  /**
   * 气泡偏移量
   */
  if (!this.options['offset']) {
    this.options.offset = [0, 0]
  }

  /**
   * 平移时是否有动画效果
   */
  if (this.options['autoPanAnimation'] === undefined) {
    this.options['autoPanAnimation'] = {
      duration: 250
    }
  }

  /**
   * 气泡类名
   */
  if (!this.options['className']) {
    this.options['className'] = 'ol-popup'
  }

  /**
   * 气泡透明度
   */
  if (this.options['opacity'] === undefined) {
    this.options['opacity'] = 1
  }

  /**
   * 获取id
   */
  if (this.options['id'] === undefined || this.options['id'] === null) {
    this.options['id'] = getuuid()
  }

  this.container = DomUtil.create('div', this.options['className'])
  this.content = document.createElement('div')
  this.content.className = 'ol-popup-content'
  this.container.appendChild(this.content)

  this.enableTouchScroll_(this.content)
  this.options.element = this.container
  ol.Overlay.call(this, {
    element: this.container,
    stopEvent: true,
    offset: this.options['offset'],
    id: this.options['id'],
    insertFirst: ((this.options.hasOwnProperty('insertFirst')) ? this.options.insertFirst : true)
  })
}
ol.inherits(Popover, ol.Overlay)

/**
 * 显示当前气泡
 * @param coord
 * @param html
 * @returns {Popover}
 */
Popover.prototype.show = function (coord, html) {
  if (html instanceof HTMLElement) {
    this.content.innerHTML = ''
    this.content.appendChild(html)
  } else {
    this.content.innerHTML = html
  }
  this.container.style.display = 'block'
  this.content.scrollTop = 0
  this.setPosition(coord)
  this.updateSize()
  return this
}

/**
 * 隐藏当前气泡
 * @returns {Popover}
 */
Popover.prototype.hide = function () {
  this.container.style.display = 'none'
  return this
}

/**
 * 更新气泡大小
 * @returns {Popover}
 */
Popover.prototype.updateSize = function () {
  this.container.style.marginLeft = (-this.container.clientWidth / 2) - 1 + 'px'
  this.container.style.display = 'block'
  this.container.style.opacity = 1
  this.content.scrollTop = 0
  return this
}

/**
 * 返回气泡状态值
 * @returns {boolean}
 */
Popover.prototype.isOpened = function () {
  return (this.container.style.display === 'block')
}

/**
 * 判断是否为移动设备（触摸）
 * @returns {boolean}
 * @private
 */
Popover.prototype.isTouchDevice_ = function () {
  try {
    document.createEvent('TouchEvent')
    return true
  } catch (e) {
    return false
  }
}

/**
 * 允许触摸滚动
 * @param elm
 * @private
 */
Popover.prototype.enableTouchScroll_ = function (elm) {
  if (this.isTouchDevice_()) {
    let scrollStartPos = 0
    elm.addEventListener('touchstart', event => {
      scrollStartPos = this.scrollTop + event.touches[0].pageY
    }, false)
    elm.addEventListener('touchmove', event => {
      this.scrollTop = scrollStartPos - event.touches[0].pageY
    }, false)
  }
}

export default Popover
