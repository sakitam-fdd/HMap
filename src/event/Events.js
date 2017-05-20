/**
 * bindListener
 * @param listenerObj
 * @returns {boundListener}
 * @private
 */
export const bindListener_ = function (listenerObj) {
  let boundListener = function (evt) {
    let listener = listenerObj.listener
    let bindTo = listenerObj.bindTo || listenerObj.target
    if (listenerObj.callOnce) {
      unlistenByKey(listenerObj)
    }
    return listener.call(bindTo, evt)
  }
  listenerObj.boundListener = boundListener
  return boundListener
}

/**
 * findListener
 * @param listeners
 * @param listener
 * @param optThis
 * @param optSetDeleteIndex
 * @returns {*}
 * @private
 */
export const findListener_ = function (listeners, listener, optThis, optSetDeleteIndex) {
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
export const getListeners = function (target, type) {
  let listenerMap = target.ol_lm
  return listenerMap ? listenerMap[type] : undefined
}

/**
 * Get the lookup of listeners.  If one does not exist on the target, it is
 * @param target
 * @returns {{}|*}
 * @private
 */
export const getListenerMap_ = function (target) {
  let listenerMap = target.ol_lm
  if (!listenerMap) {
    listenerMap = target.ol_lm = {}
  }
  return listenerMap
}

/**
 * Clean up all listener objects of the given type
 * @param target
 * @param type
 * @private
 */
export const removeListeners_ = function (target, type) {
  let listeners = getListeners(target, type)
  if (listeners) {
    for (let i = 0, ii = listeners.length; i < ii; ++i) {
      target.removeEventListener(type, listeners[i].boundListener)
      clear(listeners[i])
    }
    listeners.length = 0
    let listenerMap = target.ol_lm
    if (listenerMap) {
      delete listenerMap[type]
      if (Object.keys(listenerMap).length === 0) {
        delete target.ol_lm
      }
    }
  }
}

/**
 * Registers an event listener on an event target
 * @param target
 * @param type
 * @param listener
 * @param optThis
 * @param optOnce
 * @returns {*}
 */
export const listen = function (target, type, listener, optThis, optOnce) {
  let listenerMap = getListenerMap_(target)
  let listeners = listenerMap[type]
  if (!listeners) {
    listeners = listenerMap[type] = []
  }
  let listenerObj = findListener_(listeners, listener, optThis, false)
  if (listenerObj) {
    if (!optOnce) {
      // Turn one-off listener into a permanent one.
      listenerObj.callOnce = false
    }
  } else {
    listenerObj = /** @type {ol.EventsKey} */ ({
      bindTo: optThis,
      callOnce: !!optOnce,
      listener: listener,
      target: target,
      type: type
    })
    target.addEventListener(type, bindListener_(listenerObj))
    listeners.push(listenerObj)
  }
  return listenerObj
}

/**
 * Registers a one-off event listener on an event target
 * @param target
 * @param type
 * @param listener
 * @param opt_this
 * @returns {*}
 */
export const listenOnce = function (target, type, listener, optThis) {
  return listen(target, type, listener, optThis, true)
}

/**
 * Unregisters an event listener on an event target
 * @param target
 * @param type
 * @param listener
 * @param optThis
 */
export const unlisten = function (target, type, listener, optThis) {
  let listeners = getListeners(target, type)
  if (listeners) {
    let listenerObj = findListener_(listeners, listener, optThis, true)
    if (listenerObj) {
      unlistenByKey(listenerObj)
    }
  }
}

/**
 * Unregisters event listeners on an event target. The argument passed to this function is the key returned from
 * @param key
 */
export const unlistenByKey = function (key) {
  if (key && key.target) {
    key.target.removeEventListener(key.type, key.boundListener)
    let listeners = getListeners(key.target, key.type)
    if (listeners) {
      let i = 'deleteIndex' in key ? key.deleteIndex : listeners.indexOf(key)
      if (i !== -1) {
        listeners.splice(i, 1)
      }
      if (listeners.length === 0) {
        removeListeners_(key.target, key.type)
      }
    }
    clear(key)
  }
}
/**
 * clear object attr
 * @param object
 */
export const clear = function (object) {
  for (let property in object) {
    delete object[property]
  }
}

/**
 * Unregisters all event listeners on an event target.
 * @param {ol.EventTargetLike} target Target.
 */
export const unlistenAll = function (target) {
  let listenerMap = getListenerMap_(target)
  for (let type in listenerMap) {
    removeListeners_(target, type)
  }
}

