const Observable = function () {
  this.Events = {};
  this.__cnt = 0;
};

Observable.hasOwnKey = Function.call.bind(Object.hasOwnProperty);

Observable.slice = Function.call.bind(Array.prototype.slice);

/**
 * 事件分发
 * @param eventName
 * @param callback
 * @param context
 * @returns {(*|*)[]}
 */
Observable.prototype.on = function (eventName, callback, context) {
  return this.bindEvent(eventName, callback, 0, context);
};

/**
 * 取消监听
 * @param event
 * @returns {boolean}
 */
Observable.prototype.un = function (event) {
  var eventName = '';
  var key = '';
  var r = false;
  var type = typeof event;
  var that = this;
  if (type === 'string') {
    if (Observable.hasOwnKey(this.Events, event)) {
      delete this.Events[event];
      return true;
    }
    return false;
  } else if (type === 'object') {
    eventName = event[0];
    key = event[1];
    if (
      Observable.hasOwnKey(this.Events, eventName) &&
      Observable.hasOwnKey(this.Events[eventName], key)
    ) {
      delete this.Events[eventName][key];
      return true;
    }
    return false;
  } else if (type === 'function') {
    that.eachEvent(that.Events, function (keyA, itemA) {
      that.eachEvent(itemA, function (keyB, itemB) {
        if (itemB[0] === event) {
          delete that.Events[keyA][keyB];
          r = true;
        }
      });
    });
    return r;
  }
  return true;
};

/**
 * 事件监听（只触发一次）
 * @param eventName
 * @param callback
 * @param context
 * @returns {(*|*)[]}
 */
Observable.prototype.once = function (eventName, callback, context) {
  return this.bindEvent(eventName, callback, 1, context);
};

/**
 * 响应事件
 * @param eventName
 * @param args
 */
Observable.prototype.action = function (eventName, args) {
  if (Observable.hasOwnKey(this.Events, eventName)) {
    this.eachEvent(this.Events[eventName], function (key, item) {
      item[0].apply(item[2], args);
      if (item[1]) {
        delete this.Events[eventName][key];
      }
    });
  }
};

/**
 * 实时触发响应
 * @param eventName
 */
Observable.prototype.dispatch = function (eventName) {
  var that = this;
  var args = Observable.slice(arguments, 1);
  setTimeout(function () {
    that.action(eventName, args);
  });
};

/**
 * 延后触发响应
 * @param eventName
 */
Observable.prototype.dispatchSync = function (eventName) {
  this.action(eventName, Observable.slice(arguments, 1));
};

/**
 * 清空发布中心
 */
Observable.prototype.clear = function () {
  this.Events = {};
};

/**
 * 绑定事件
 * @param eventName
 * @param callback
 * @param isOne
 * @param context
 * @returns {[*,*]}
 */
Observable.prototype.bindEvent = function (eventName, callback, isOne, context) {
  if (typeof eventName !== 'string' || typeof callback !== 'function') {
    throw new Error('传入的事件名称和回调函数有误！');
  }
  if (!Observable.hasOwnKey(this.Events, eventName)) {
    this.Events[eventName] = {};
  }
  this.Events[eventName][++this.__cnt] = [callback, isOne, context];
  return [eventName, this.__cnt];
};

/**
 * 循环触发事件
 * @param obj
 * @param callback
 */
Observable.prototype.eachEvent = function (obj, callback) {
  for (var key in obj) {
    if (Observable.hasOwnKey(obj, key)) {
      callback(key, obj[key]);
    }
  }
};

export default Observable;
