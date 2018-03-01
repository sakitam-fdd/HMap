/**
 * Created by FDD on 2016/11/7.
 * @desc 右键功能(迁移自项目扩展)
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
import Observable from '../utils/Observable'
import mixin from '../utils/mixin'
import cloneDeep from 'lodash/cloneDeep'
ol.control.ContextMenu = function (params = {}) {
  this.options = params

  /**
   * 地图容器
   * @type {null}
   */
  this.mapContent = null

  /**
   * 鼠标右键的位置
   * @type {Array}
   */
  this.pixel = []

  /**
   * width
   * @type {number}
   */
  this.itemWidth = (typeof this.options['itemWidth'] === 'number' ? this.options['itemWidth'] : 160)

  /**
   * height
   * @type {number}
   */
  this.itemHeight = (typeof this.options['itemHeight'] === 'number' ? this.options['itemHeight'] : 30)

  /**
   * className
   * @type {string}
   */
  this.className_ = (this.options.className !== undefined ? this.options.className : 'hmap-context-menu-content')

  /**
   * @private
   * @type {Element}
   */
  this.element_ = htmlUtils.create('div', (this.className_ + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))
  this.element_.style.display = 'none'
  ol.control.Control.call(this, {
    element: this.element_,
    target: this.options['target']
  })
  Observable.call(this)
}

ol.inherits(ol.control.ContextMenu, ol.control.Control)
mixin(ol.control.ContextMenu, Observable)

/**
 * 初始化dom
 * @param items
 */
ol.control.ContextMenu.prototype.initDomInternal = function (items) {
  this.htmlUtils(items, '', this.element_)
  if (this.getMap()) {
    this.mapContent = this.getMap().getViewport()
    Events.listen(this.mapContent, 'contextmenu', this.mouseDownHandle_, this)
  }
}

/**
 * 初始化事件
 * @param event
 * @private
 */
ol.control.ContextMenu.prototype.mouseDownHandle_ = function (event) {
  let that = this
  event.stopPropagation()
  event.preventDefault()
  if (event.button === 2) {
    that.pixel = this.getMap().getEventPixel(event)
    this.dispatch('before-show', event)
    window.setTimeout(() => {
      that.show(that.pixel)
      that.dispatch('show', event)
    }, 50)
  }
  Events.listen(event.target, 'mousedown', function () {
    that.hide()
    that.dispatch('hide', event)
  }, this, true)
}

/**
 * showMenu
 * @param position
 */
ol.control.ContextMenu.prototype.show = function (position) {
  this.element_.style.display = 'block'
  this.element_.style.top = position[1] + 'px'
  this.element_.style.left = position[0] + 'px'
  let aDoc = this.getMap().getSize()
  let maxWidth = aDoc[0] - this.element_.offsetWidth
  let maxHeight = aDoc[1] - this.element_.offsetHeight
  if (this.element_.offsetTop > maxHeight) {
    this.element_.style.top = maxHeight + 'px'
  }
  if (this.element_.offsetLeft > maxWidth) {
    this.element_.style.left = maxWidth + 'px'
  }
}

/**
 * hideMenu
 */
ol.control.ContextMenu.prototype.hide = function () {
  this.element_.style.display = 'none'
  this.pixel = []
}

/**
 * html处理工具
 * @param items
 * @param index
 * @param content
 * @param isOffset
 * @returns {*}
 */
ol.control.ContextMenu.prototype.htmlUtils = function (items, index, content, isOffset) {
  let ulList = null
  if (items && Array.isArray(items) && items.length > 0) {
    ulList = htmlUtils.create('ul', this.className_ + '-ul' + index + '-inner', content, this.className_ + '-ul' + index + '-inner')
    if (isOffset) {
      ulList.style.position = 'absolute'
      ulList.style.top = '0px'
      ulList.style.left = this.itemWidth + 20 + 'px'
    }
    items.forEach((item, index_) => {
      if (item && item['name'] && item['alias']) {
        let numList = index + '-' + index_
        let li_ = htmlUtils.create('li', this.className_ + '-li-' + numList + '-inner', ulList, this.className_ + '-li-' + numList + '-inner')
        li_.style.width = this.itemWidth + 'px'
        li_.style.height = this.itemHeight + 'px'
        li_.style.lineHeight = this.itemHeight + 'px'
        li_.setAttribute('data-name', item['alias'])
        Events.listen(li_, 'click', this.handleItemClick_.bind(this, item))
        if (item['icon']) {
          let span_ = htmlUtils.create('span', 'li-icon-content', li_)
          if (item['iconType'] === 'iconfont') {
            let fontName = item['fontName'] ? item['fontName'] : 'iconfont'
            htmlUtils.addClass(span_, fontName + ' ' + item['icon'])
            if (item['iconColor']) {
              span_.style.color = item['iconColor']
            }
          } else {
            span_.style.background = 'url(' + item['icon'] + ') 0px 0px no-repeat'
          }
        }
        let name_ = htmlUtils.create('span', 'li-name-content', li_)
        name_.innerHTML = item['name']
        if (item['showLine']) {
          li_.style.borderBottom = '1px solid #CCCCCC'
        }
        if (item['items']) {
          this.htmlUtils(item['items'], numList, li_, true)
          Events.listen(li_, 'mouseenter', this.handleItemMouseOver_, this)
          Events.listen(li_, 'mouseleave', this.handleItemMouseOut_, this)
        }
      }
    })
  }
  return ulList
}

/**
 * 更新面板元素
 * @param type
 * @param item
 * @param items
 * @private
 */
ol.control.ContextMenu.prototype.updateElement_ = function (type, item, items) {
  let child_ = htmlUtils.getTarget(this.className_ + '-ul' + '-inner')
  let cloneItems = cloneDeep(this.options['items'])
  let afterItems = null
  switch (type) {
    case 'pop': // 移除最后一个
      this.element_.removeChild(child_)
      afterItems = cloneItems.pop()
      this.htmlUtils(cloneItems, '', this.element_)
      break
    case 'push': // 数组的末尾添加新的元素
      this.element_.removeChild(child_)
      afterItems = cloneItems = cloneItems.push(item)
      this.htmlUtils(cloneItems, '', this.element_)
      break
    case 'shift': // 删除数组的第一个元素
      this.element_.removeChild(child_)
      afterItems = cloneItems.shift()
      this.htmlUtils(cloneItems, '', this.element_)
      break
    case 'unshift': // 在数组的开头添加新元素
      this.element_.removeChild(child_)
      afterItems = cloneItems = cloneItems.unshift(item)
      this.htmlUtils(cloneItems, '', this.element_)
      break
    case 'reverse':
      this.element_.removeChild(child_)
      afterItems = cloneItems.reverse()
      this.htmlUtils(cloneItems, '', this.element_)
      break
    default:
      this.element_.removeChild(child_)
      afterItems = items
      this.htmlUtils(items, '', this.element_)
  }
  return afterItems
}

/**
 * 获取鼠标右键位置的像素坐标
 * @returns {ol.Pixel|*|Array}
 */
ol.control.ContextMenu.prototype.getCurrentPixel = function () {
  return this.pixel
}

/**
 * 获取鼠标点击位置的地图坐标
 * @returns {ol.Coordinate}
 */
ol.control.ContextMenu.prototype.getCurrentCoordinates = function () {
  return (this.getMap().getCoordinateFromPixel(this.getCurrentPixel()))
}

/**
 * 处理列表点击事件
 * @param item
 * @param event
 * @private
 */
ol.control.ContextMenu.prototype.handleItemClick_ = function (item, event) {
  Events.stopPropagation(event)
  if (item && item['callback'] && typeof item['callback'] === 'function') {
    item['callback'](event, {
      source: item,
      pixel: this.getCurrentPixel(),
      coordinates: this.getCurrentCoordinates()
    })
  }
  this.dispatch('item-click', event, {
    source: item,
    pixel: this.getCurrentPixel(),
    coordinates: this.getCurrentCoordinates()
  })
  window.setTimeout(() => {
    this.hide()
  }, 50)
}

/**
 * 处理鼠标移入事件
 * @param event
 * @private
 */
ol.control.ContextMenu.prototype.handleItemMouseOver_ = function (event) {
  Events.stopPropagation(event)
  if (event.target && event.target.childNodes) {
    let elements = Array.prototype.slice.call(event.target.childNodes, 0)
    if (elements && elements.length > 0) {
      elements.every(ele => {
        if (ele && ele.nodeName.toLowerCase() === 'ul') {
          ele.style.display = 'block'
          return false
        } else {
          return true
        }
      })
    }
  }
}

/**
 * 处理鼠标移出事件
 * @param event
 * @private
 */
ol.control.ContextMenu.prototype.handleItemMouseOut_ = function (event) {
  Events.stopPropagation(event)
  if (event.target && event.target.childNodes) {
    let elements = Array.prototype.slice.call(event.target.childNodes, 0)
    if (elements && elements.length > 0) {
      elements.every(ele => {
        if (ele && ele.nodeName.toLowerCase() === 'ul') {
          ele.style.display = 'none'
          return false
        } else {
          return true
        }
      })
    }
  }
}

/**
 * setMap
 * @param map
 */
ol.control.ContextMenu.prototype.setMap = function (map) {
  ol.control.Control.prototype.setMap.call(this, map)
  if (map && map instanceof ol.Map) {
    this.initDomInternal(this.options['items'])
  }
}

/**
 * 移除菜单最后一项
 */
ol.control.ContextMenu.prototype.pop = function () {
  return this.updateElement_('pop')
}

/**
 * 向菜单末尾添加一项
 * @param item
 */
ol.control.ContextMenu.prototype.push = function (item) {
  if (item && typeof item === 'object') {
    return this.updateElement_('push', item)
  } else {
    throw new Error('传入的不是对象')
  }
}

/**
 * 移除菜单第一项
 */
ol.control.ContextMenu.prototype.shift = function () {
  return this.updateElement_('shift')
}

/**
 * 倒叙菜单
 */
ol.control.ContextMenu.prototype.reverse = function () {
  return this.updateElement_('reverse')
}

/**
 * 向菜单开头添加一项
 * @param item
 */
ol.control.ContextMenu.prototype.unshift = function (item) {
  if (item && typeof item === 'object') {
    return this.updateElement_('unshift', item)
  } else {
    throw new Error('传入的不是对象')
  }
}

/**
 * 更新菜单
 * @param items
 */
ol.control.ContextMenu.prototype.update = function (items) {
  if (items && Array.isArray(items) && items.length > 0) {
    this.updateElement_('', '', items)
  } else {
    throw new Error('传入的数组有误！')
  }
}

/**
 * 更新内置配置
 * @param items
 */
ol.control.ContextMenu.prototype.updateOption = function (items) {
  if (items && Array.isArray(items) && items.length > 0) {
    this.options['items'] = items
    this.updateElement_('', '', items)
  } else {
    throw new Error('传入的数组有误！')
  }
}

let olControlContextMenu = ol.control.ContextMenu
export default olControlContextMenu
