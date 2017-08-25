/**
 * Created by FDD on 2017/6/6.
 * @desc 用于图层比较
 */
import {ol} from '../constants'
import mixin from '../utils/mixins'
import {DomUtil, css} from '../dom'

class CompareLayer extends mixin(ol.control.Control) {
  constructor (beforeMap, afterMap, params) {
    super()
    this.options = params || {}
    let className = (this.options.className !== undefined ? this.options.className : 'hmap-compare')
    this.beforeMap = beforeMap
    this.afterMap = afterMap
    /**
     * 当前截取位置占整个视图宽度的比例
     * @type {number}
     */
    this.value = 0.5

    /**
     * @private
     * @type {Element}
     */
    this.element_ = DomUtil.create('div', (className + ' ' + css.CLASS_UNSELECTABLE))

    /**
     * @private
     * @type {Element}
     */
    this.innerElement_ = DomUtil.create('div', className + '-inner', this.element_)
    ol.control.Control.call(this, {
      element: this.element_,
      target: this.options['target']
    })
  }

  /**
   * setup
   */
  initControl () {
    this._onDown = this._onDown.bind(this)
    this._onMove = this._onMove.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    /**
     * 获取当前视图大小
     * @type {ClientRect}
     * @private
     */
    this._bounds = this.getMap().getTargetElement().getBoundingClientRect()
    this.percent = 0.5
    this._setPosition(this._bounds.width, this._bounds.width / 2)

    if (this.options && this.options.mousemove) {
      this.getMap().getTargetElement().addEventListener('mousemove', event => {
        this._onMove(event)
      })
    }
    this.addEvent()
    this.resize()
    this.clipLayer()
  }

  /**
   * 设置地图
   * @param map
   */
  setMap (map) {
    ol.control.Control.prototype.setMap.call(this, map)
    if (map) {
      this.initControl()
    }
  }

  /**
   * 通过canvas切割视图
   * @param beforeMap
   * @param value
   */
  clipLayer () {
    let that = this
    this.getMap().un('precompose', this.precompose)
    this.getMap().un('postcompose', this.postcompose)
    this.precompose = this.beforeMap.on('precompose', event => {
      let ctx = event.context
      let width = ctx.canvas.width * (that.value)
      ctx.save()
      ctx.beginPath()
      ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height)
      ctx.clip()
      console.log('pre')
    })
    this.postcompose = this.beforeMap.on('postcompose', event => {
      let ctx = event.context
      ctx.restore()
      console.log('post')
    })
  }

  /**
   * 添加事件监听
   */
  addEvent () {
    this.innerElement_.addEventListener('mousedown', event => {
      this._onDown(event)
    })
    this.innerElement_.addEventListener('touchstart', event => {
      this._onDown(event)
    })
  }

  /**
   * 鼠标按下事件处理
   * @param e
   * @private
   */
  _onDown (e) {
    if (e.touches) {
      document.addEventListener('touchmove', event => {
        this._onMove(event)
      })
      document.addEventListener('touchend', event => {
        this._onTouchEnd(event)
      })
    } else {
      document.addEventListener('mousemove', event => {
        console.log('move')
        this._onMove(event)
      })
      document.addEventListener('mouseup', event => {
        console.log('up')
        this._onMouseUp(event)
      })
    }
  }

  /**
   * 设置切割位置
   * @param x
   * @private
   */
  _setPosition (sourceWidth, value) {
    let pos = 'translate(' + value + 'px, 0)'
    this.element_.style.transform = pos
    this.element_.style.WebkitTransform = pos
    this._x = value
    this.percent = value / sourceWidth
    this.value = value / sourceWidth
    this.getMap().render()
    console.log('render')
  }

  /**
   * 窗口变化事件
   */
  resize () {
    let resizeEvt = (('orientationchange' in window) ? 'orientationchange' : 'resize')
    let doc = window.document
    let that = this
    window.addEventListener(resizeEvt, function () {
      setTimeout(function () {
        that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
        that._setPosition(that._bounds.width, that._bounds.width * that.percent)
      }, 50)
    }, false)
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        setTimeout(function () {
          that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
          that._setPosition(that._bounds.width, that._bounds.width * that.percent)
        }, 50)
      }
    }, false)
    if (doc.readyState === 'complete') {
      setTimeout(function () {
        that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
        that._setPosition(that._bounds.width, that._bounds.width * that.percent)
      }, 50)
    } else {
      doc.addEventListener('DOMContentLoaded', function (e) {
        setTimeout(function () {
          that._bounds = that.getMap().getTargetElement().getBoundingClientRect()
          that._setPosition(that._bounds.width, that._bounds.width * that.percent)
        }, 50)
      }, false)
    }
  }

  /**
   * 处理移动事件
   * @param e
   * @private
   */
  _onMove (e) {
    this._bounds = this.getMap().getTargetElement().getBoundingClientRect()
    console.log(e)
    this._setPosition(this._bounds.width, this._getX(e))
  }

  /**
   * 处理按键抬起事件
   * @private
   */
  _onMouseUp () {
    document.removeEventListener('mousemove', event => {
      this._onMove(event)
    })
    document.removeEventListener('mouseup', event => {
      this._onMouseUp(event)
    })
  }

  /**
   * 监听触摸结束事件
   * @private
   */
  _onTouchEnd () {
    document.removeEventListener('touchmove', event => {
      this._onMove(event)
    })
    document.removeEventListener('touchend', event => {
      this._onTouchEnd(event)
    })
  }

  /**
   * 获取当前位置
   * @param e
   * @returns {number}
   * @private
   */
  _getX (e) {
    e = e.touches ? e.touches[0] : e
    let x = e.clientX - this._bounds.left
    if (x < 0) x = 0
    if (x > this._bounds.width) x = this._bounds.width
    return x
  }
}

export default CompareLayer
