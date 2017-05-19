import { splitWords, stamp } from '../utils/utils'

/**
 * 通过id获取dom
 * @param id
 * @returns {Element}
 */
export const get = (id) => {
  return typeof id === 'string' ? document.getElementById(id) : id
}

/**
 * 获取父节点下指定的子节点
 * @param str
 * @param container
 * @returns {NodeList|*}
 */
export const getChildByTagName = (str, container) => {
  return container.getElementsByTagName(str)
}

/**
 * 通过类名获取元素
 * @param str
 * @param container
 * @param root
 * @returns {HTMLElement}
 */
export const getElementsByClassName = (str, container, root) => {
  let _root = root || window
  let $ = _root.document.querySelector.bind(_root.document)
  // let $$ = _root.document.querySelectorAll.bind(_root.document)
  let target = $(str)
  return target
}

/**
 * 获取dom class
 * @param elem
 * @returns {*|getAttribute|string|string}
 */
export const getClass = (elem) => {
  return elem.getAttribute && elem.getAttribute('class') || ''
}

/**
 * 获取dom样式列表（）
 * @param el
 * @param style
 * @returns {*}
 */
export const getStyle = (el, style) => {
  let value = el.style[style] || (el.currentStyle && el.currentStyle[style])
  if ((!value || value === 'auto') && document.defaultView) {
    let css = document.defaultView.getComputedStyle(el, null)
    value = css ? css[style] : null
  }
  return value === 'auto' ? null : value
}

/**
 * 创建dom
 * @param tagName (标签名)
 * @param className (类名)
 * @param container (容器)
 * @param id (唯一标识)
 * @returns {Element}
 */
export const create = (tagName, className, container, id) => {
  let el = document.createElement(tagName)
  el.className = className || ''
  if (id) {
    el.id = id
  }
  if (container) {
    container.appendChild(el)
  }
  return el
}

/**
 * 移除当前dom
 * @param el
 */
export const remove = (el) => {
  let parent = el.parentNode
  if (parent) {
    parent.removeChild(el)
  }
}

/**
 * 将dom致空
 * @param el
 */
export const empty = (el) => {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}

/**
 * 添加到容器前方
 * @param el
 */
export const toFront = (el) => {
  el.parentNode.appendChild(el)
}

/**
 * 添加到容器后放
 * @param el
 */
export const toBack = (el) => {
  let parent = el.parentNode
  parent.insertBefore(el, parent.firstChild)
}

/**
 * 判断DOM对象是否有此类名
 * @param el
 * @param name
 * @returns {boolean}
 */
export const hasClass = (el, name) => {
  if (el.classList !== undefined) {
    return el.classList.contains(name)
  }
  let className = getClass(el)
  return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className)
}

/**
 * 添加类名
 * @param el
 * @param name
 */
export const addClass = (el, name) => {
  if (el.classList !== undefined) {
    let classes = splitWords(name)
    for (let i = 0, len = classes.length; i < len; i++) {
      el.classList.add(classes[i])
    }
  } else if (!hasClass(el, name)) {
    let className = getClass(el)
    setClass(el, (className ? className + ' ' : '') + name)
  }
}

/**
 * 移除类名
 * @param el
 * @param name
 */
export const removeClass = (el, name) => {
  if (el.classList !== undefined) {
    el.classList.remove(name)
  } else {
    setClass(el, String.trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')))
  }
}

/**
 * 设置class
 * @param el
 * @param name
 */
export const setClass = (el, name) => {
  if (el.className.baseVal === undefined) {
    el.className = name
  } else {
    el.className.baseVal = name
  }
}

/**
 * 创建一个隐藏的元素
 * @param tagName
 * @param parent
 * @param id
 * @returns {Element}
 */
export const createHidden = (tagName, parent, id) => {
  let element = document.createElement(tagName)
  element.style.display = 'none'
  if (id) {
    element.id = id
  }
  if (parent) {
    parent.appendChild(element)
  }
  return element
}

/**
 * 获取事件唯一标识
 * @param type
 * @param fn
 * @param context
 * @returns {string}
 */
export const getDomEventKey = (type, fn, context) => {
  return '_p_dom_event_' + type + '_' + stamp(fn) + (context ? '_' + stamp(context) : '')
}

/**
 * 对DOM对象添加事件监听
 * @param element
 * @param type
 * @param fn
 * @param context
 * @returns {*}
 */
export const addListener = function (element, type, fn, context) {
  let eventKey = getDomEventKey(type, fn, context)
  let handler = element[eventKey]
  if (handler) {
    return this
  }
  handler = function (e) {
    return fn.call(context || element, e)
  }
  if ('addEventListener' in element) {
    element.addEventListener(type, handler, false)
  } else if ('attachEvent' in element) {
    element.attachEvent('on' + type, handler)
  }
  element[eventKey] = handler
  return this
}

/**
 * 移除DOM对象监听事件
 * @param element
 * @param type
 * @param fn
 * @param context
 * @returns {removeListener}
 */
export const removeListener = function (element, type, fn, context) {
  let eventKey = getDomEventKey(type, fn, context)
  let handler = element[eventKey]
  if (!handler) {
    return this
  }
  if ('removeEventListener' in element) {
    element.removeEventListener(type, handler, false)
  } else if ('detachEvent' in element) {
    element.detachEvent('on' + type, handler)
  }
  element[eventKey] = null
  return this
}
