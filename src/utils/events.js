import {getuuid} from './utils'

const stamp = function (obj) {
  let key = '_event_id_'
  obj[key] = obj[key] || (getuuid())
  return obj[key]
}

/**
 * Prevent default behavior of the browser.
 * @param event
 * @returns {preventDefault}
 */
const preventDefault = function (event) {
  if (event.preventDefault) {
    event.preventDefault()
  } else {
    event.returnValue = false
  }
  return this
}

/**
 * Stop browser event propagation
 * @param event
 * @returns {stopPropagation}
 */
const stopPropagation = function (event) {
  if (event.stopPropagation) {
    event.stopPropagation()
  } else {
    event.cancelBubble = true
  }
  return this
}

/**
 * 绑定事件
 * @param listenerObj
 * @returns {boundListener}
 * @private
 */
const bindListener = function (listenerObj) {
  let boundListener = function (evt) {
    let listener = listenerObj.listener
    let bindTo = listenerObj.bindTo || listenerObj.target
    if (listenerObj.callOnce) {
      unListenByKey(listenerObj)
    }
    return listener.call(bindTo, evt)
  }
  listenerObj.boundListener = boundListener
  return boundListener
}

/**
 * 查找监听器
 * @param listeners
 * @param listener
 * @param optThis
 * @param optSetDeleteIndex
 * @returns {*}
 */
const findListener = function (listeners, listener, optThis, optSetDeleteIndex) {
  let listenerObj = null
  for (let i = 0, ii = listeners.length; i < ii; ++i) {
    listenerObj = listeners[i]
    if (listenerObj.listener === listener && listenerObj.bindTo === optThis) {
      if (optSetDeleteIndex) {
        listenerObj.deleteIndex = i
      }
      return listenerObj
    }
  }
  return undefined
}

/**
 * get Listeners
 * @param target
 * @param type
 * @returns {undefined}
 */
const getListeners = function (target, type) {
  let listenerMap = target.vlm
  return listenerMap ? listenerMap[type] : undefined
}

/**
 * Get the lookup of listeners.  If one does not exist on the target, it is
 * @param target
 * @returns {{}|*}
 * @private
 */
const getListenerMap = function (target) {
  let listenerMap = target.vlm
  if (!listenerMap) {
    listenerMap = target.vlm = {}
  }
  return listenerMap
}

/**
 * 清空事件
 * @param target
 * @param type
 */
const removeListeners = function (target, type) {
  let listeners = getListeners(target, type)
  if (listeners) {
    for (let i = 0, ii = listeners.length; i < ii; ++i) {
      target.removeEventListener(type, listeners[i].boundListener)
      clear(listeners[i])
    }
    listeners.length = 0
    let listenerMap = target.vlm
    if (listenerMap) {
      delete listenerMap[type]
      if (Object.keys(listenerMap).length === 0) {
        delete target.vlm
      }
    }
  }
}

/**
 * 注册事件处理
 * @param target
 * @param type
 * @param listener
 * @param optThis
 * @param optOnce
 * @returns {*}
 */
const listen = function (target, type, listener, optThis, optOnce) {
  let listenerMap = getListenerMap(target)
  let listeners = listenerMap[type]
  if (!listeners) {
    listeners = listenerMap[type] = []
  }
  let listenerObj = findListener(listeners, listener, optThis, false)
  if (listenerObj) {
    if (!optOnce) {
      listenerObj.callOnce = false
    }
  } else {
    listenerObj = ({
      bindTo: optThis,
      callOnce: !!optOnce,
      listener: listener,
      target: target,
      type: type
    })
    target.addEventListener(type, bindListener(listenerObj))
    listeners.push(listenerObj)
  }
  return listenerObj
}

/**
 * 注册事件，只触发一次
 * @param target
 * @param type
 * @param listener
 * @param optThis
 * @returns {*}
 */
const listenOnce = function (target, type, listener, optThis) {
  return listen(target, type, listener, optThis, true)
}

/**
 * 取消事件注册
 * @param target
 * @param type
 * @param listener
 * @param optThis
 */
const unListen = function (target, type, listener, optThis) {
  let listeners = getListeners(target, type)
  if (listeners) {
    let listenerObj = findListener(listeners, listener, optThis, true)
    if (listenerObj) {
      unListenByKey(listenerObj)
    }
  }
}

/**
 * 根据事件名移除事件对象
 * @param key
 */
const unListenByKey = function (key) {
  if (key && key.target) {
    key.target.removeEventListener(key.type, key.boundListener)
    let listeners = getListeners(key.target, key.type)
    if (listeners) {
      let i = 'deleteIndex' in key ? key.deleteIndex : listeners.indexOf(key)
      if (i !== -1) {
        listeners.splice(i, 1)
      }
      if (listeners.length === 0) {
        removeListeners(key.target, key.type)
      }
    }
    clear(key)
  }
}

/**
 * 清空当前对象
 * @param object
 */
const clear = function (object) {
  for (let property in object) {
    delete object[property]
  }
}

/**
 * 移除所有事件监听
 * @param target
 */
const unlistenAll = function (target) {
  let listenerMap = getListenerMap(target)
  for (let type in listenerMap) {
    removeListeners(target, type)
  }
}

/**
 * 获取事件唯一标识
 * @param type
 * @param fn
 * @param context
 * @returns {string}
 */
const getDomEventKey = (type, fn, context) => {
  return '_dom_event_' + type + '_' + stamp(fn) + (context ? '_' + stamp(context) : '')
}

/**
 * 对DOM对象添加事件监听
 * @param element
 * @param type
 * @param fn
 * @param context
 * @returns {*}
 */
const addListener = function (element, type, fn, context) {
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
const removeListener = function (element, type, fn, context) {
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

export {
  unListen,
  unlistenAll,
  unListenByKey,
  addListener,
  listen,
  listenOnce,
  removeListener,
  preventDefault,
  stopPropagation
}
