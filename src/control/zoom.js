/**
 * Created by FDD on 2017/9/19.
 * @desc 缩放按钮
 */
import ol from 'openlayers';
import { BASE_CLASS_NAME } from '../constants';
import * as htmlUtils from '../utils/dom';
import * as Events from '../utils/events';
ol.control.ZoomMenu = function (params = {}) {
  this.options = params;

  /**
   * 基础类名
   * @type {string}
   */
  let className =
    this.options.className !== undefined
      ? this.options.className
      : 'hmap-control-zoom';

  /**
   * delta
   */
  let delta = this.options.delta !== undefined ? this.options.delta : 1;

  let element_ = this.initDomInternal_(className, delta);

  /**
   * 动画时间
   * @type {number}
   * @private
   */
  this.duration_ =
    this.options.duration !== undefined ? this.options.duration : 250;
  ol.control.Control.call(this, {
    element: element_,
    target: this.options.target
  });
};
ol.inherits(ol.control.ZoomMenu, ol.control.Control);

/**
 * 初始化相关dom
 * @param className
 * @param delta
 * @returns {Element}
 * @private
 */
ol.control.ZoomMenu.prototype.initDomInternal_ = function (className, delta) {
  let element = htmlUtils.create(
    'div',
    className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE
  );
  let zoomin = htmlUtils.create('span', 'zoom-in', element);
  zoomin.setAttribute('title', '放大');
  zoomin.innerHTML = '+';
  let zoomout = htmlUtils.create('span', 'zoom-out', element);
  zoomout.setAttribute('title', '缩小');
  zoomout.innerHTML = '\u2212';
  Events.listen(
    zoomin,
    'click',
    ol.control.ZoomMenu.prototype.handleClick_.bind(this, delta)
  );
  Events.listen(
    zoomout,
    'click',
    ol.control.ZoomMenu.prototype.handleClick_.bind(this, -delta)
  );
  return element;
};

/**
 * 处理点击事件
 * @param delta
 * @param event
 * @private
 */
ol.control.ZoomMenu.prototype.handleClick_ = function (delta, event) {
  event.preventDefault();
  this.zoomByDelta_(delta);
};

/**
 * 缩放控制
 * @param delta
 * @private
 */
ol.control.ZoomMenu.prototype.zoomByDelta_ = function (delta) {
  let map = this.getMap();
  let view = map.getView();
  if (!view) {
    throw new Error('未获取到视图！');
  } else {
    let currentResolution = view.getResolution();
    if (currentResolution) {
      let newResolution = view.constrainResolution(currentResolution, delta);
      if (this.duration_ > 0) {
        if (view.getAnimating()) {
          view.cancelAnimations();
        }
        view.animate({
          resolution: newResolution,
          duration: this.duration_,
          easing: ol.easing.easeOut
        });
      } else {
        view.setResolution(newResolution);
      }
    }
  }
};

let olControlZoomMenu = ol.control.ZoomMenu;
export default olControlZoomMenu;
