/**
 * Created by FDD on 2017/7/21.
 * @desc 全局地图加载loading
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
ol.control.Loading = function (params) {
  /**
   * 当前配置
   * @type {*}
   */
  this.options = params || {}
  /**
   * 地图事件
   * @type {Array}
   */
  this.mapListeners = []
  /**
   * 切片事件
   * @type {Array}
   */
  this.tileListeners = []
  /**
   * 加载状态
   * @type {boolean}
   * @private
   */
  this.loadStatus_ = false
  /**
   * 是否第一次渲染
   * @type {boolean}
   */
  this.isFirstRander = true
  /**
   * 加载进度
   * @type {[*]}
   * @private
   */
  this.loadProgress_ = [0, 1]
  // 窗口挂件类型（现有支持gif和进度条）
  if (this.options['widget']) {
    if (['animatedGif', 'progressBar'].indexOf(this.options['widget']) === -1) {
      throw Error('不支持的挂件类型')
    } else {
      this.widget = (this.options['widget'] ? this.options['widget'] : 'animatedGif')
    }
  }
  // 进度条模式
  if (this.options['progressMode']) {
    if (['tile', 'layer'].indexOf(this.options['progressMode']) === -1) {
      throw Error('不支持的进度条模式')
    }
    this.loadProgressByTile_ = ((this.options['progressMode'] === 'layer') ? !(this.options['progressMode'] === 'layer') : true)
  }
  // 是否显示loading面板
  this.showPanel = (typeof this.options['showPanel'] === 'boolean') ? this.options['showPanel'] : true
  let className = (this.options.className !== undefined ? this.options.className : 'hmap-loading-panel')
  // DOM
  let elementDom = (this.widget === 'animatedGif') ? 'span' : 'progress'
  let element = htmlUtils.create(elementDom, (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))
  if (this.widget === 'progressBar') {
    // element progress bar for old browsers
    let div = htmlUtils.create('div', 'hmap-progress-bar')
    htmlUtils.create('span', '', div)
  }
  this.onCustomStart = (this.options['onStart'] ? this.options['onStart'] : false)
  this.onCustomProgress = (this.options['onProgress'] ? this.options['onProgress'] : false)
  this.onCustomEnd = (this.options['onEnd'] ? this.options['onEnd'] : false)
  ol.control.Control.call(this, {
    element: element,
    target: this.options['target']
  })
}

ol.inherits(ol.control.Loading, ol.control.Control)

/**
 * 设置
 */
ol.control.Loading.prototype.setup = function () {
  this.setDomPosition()
  this.resize()
  let pointerDown = this.getMap().on('pointerdown', () => {
    this.hide()
  })
  let beforeRander = this.getMap().on('precompose', () => {
    if (this.isFirstRander) {
      this.isFirstRander = false
      this.registerLayersLoadEvents_()
      this.show()
      if (this.onCustomStart) {
        let args = []
        this.onCustomStart.apply(this, args)
      }
    }
  })
  let afterRander = this.getMap().on('postrender', () => {
    this.updateLoadStatus_()
    if (this.loadStatus_) {
      if (this.onCustomEnd) {
        let args = []
        this.onCustomEnd.apply(this, args)
      }
      this.hide()
    }
  })
  this.mapListeners.push(pointerDown)
  this.mapListeners.push(beforeRander)
  this.mapListeners.push(afterRander)
}

/**
 * 设置dom位置
 */
ol.control.Loading.prototype.setDomPosition = function () {
  let size = this.getMap().getSize()
  if (!size) return
  let domSize = [this.element.clientWidth, this.element.clientHeight]
  this.element.style.left = String(Math.round((size[0] - domSize[0]) / 2)) + 'px'
  this.element.style.bottom = String(Math.round((size[1] - domSize[1]) / 2)) + 'px'
}

/**
 * 窗口变化事件
 */
ol.control.Loading.prototype.resize = function () {
  let resizeEvt = (('orientationchange' in window) ? 'orientationchange' : 'resize')
  let doc = window.document
  let that = this
  window.addEventListener(resizeEvt, function () {
    setTimeout(function () {
      that.setDomPosition()
    }, 50)
  }, false)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setTimeout(function () {
        that.setDomPosition()
      }, 50)
    }
  }, false)
  if (doc.readyState === 'complete') {
    setTimeout(function () {
      that.setDomPosition()
    }, 50)
  } else {
    doc.addEventListener('DOMContentLoaded', function (e) {
      setTimeout(function () {
        that.setDomPosition()
      }, 50)
    }, false)
  }
}

/**
 * 获取进度
 * @param source
 * @returns {boolean}
 * @private
 */
ol.control.Loading.prototype.updateSourceLoadStatus_ = function (source) {
  return (Math.round(source.loaded / source.loading * 100) === 100)
}

/**
 * 注册图层事件
 * @param layer
 * @private
 */
ol.control.Loading.prototype.registerLayerLoadEvents_ = function (layer) {
  let that = this
  layer.getSource().on('tileloadstart', function (event) {
    if (that.loadStatus_) {
      that.loadStatus_ = false
      that.loadProgress_ = [0, 1]
      if (that.widget === 'progressBar') {
        that.element.value = that.loadProgress_[0]
        that.element.max = that.loadProgress_[1]
      }
      that.show()
      if (that.onCustomStart) {
        let args = []
        that.onCustomStart.apply(that, args)
      }
    }
    this.loading = (this.loading) ? this.loading + 1 : 1
    this.isLoaded = that.updateSourceLoadStatus_(this)
    if (that.loadProgressByTile_) {
      this.loadProgress_[1] += 1
      if (this.widget === 'progressBar') {
        that.element.max = that.loadProgress_[1]
        let progressBarDiv = that.element.getElementsByClassName('hmap-progress-bar')
        if (progressBarDiv.length > 0) progressBarDiv[0].children()[0].width = String(parseInt(100 * that.progress(), 0)) + '%'
      }
    }
  })
  layer.getSource().on(['tileloadend', 'tileloaderror'], function (e) {
    if (e.tile.getState() === 3) {
      console.warn('Loading tile failed for resource \'' + e.tile.src_ + '\'')
    }
    this.loaded = (this.loaded) ? this.loaded + 1 : 1
    this.isLoaded = that.updateSourceLoadStatus_(this)
    if (that.loadProgressByTile_) {
      that.loadProgress_[0] += 1
      if (that.widget === 'progressBar') {
        that.element.value = that.loadProgress_[0]
        let progressBarDiv = this.element.getElementsByClassName('hmap-progress-bar')
        if (progressBarDiv.length > 0) {
          progressBarDiv[0].children()[0].width = String(parseInt(100 * that.progress(), 0)) + '%'
        }
      }
      if (that.onCustomProgress) {
        that.onCustomProgress.apply(that, that.loadProgress_)
      }
    }
  })
}

/**
 * 注册全局图层事件
 * @private
 */
ol.control.Loading.prototype.registerLayersLoadEvents_ = function () {
  let groups = this.getMap().getLayers().getArray()
  for (let i = 0; i < groups.length; i++) {
    let layer = groups[i]
    if (layer instanceof ol.layer.Group) {
      let layers = layer.getLayers().getArray()
      for (let j = 0; j < layers.length; j++) {
        let l = layers[j]
        if (!(l instanceof ol.layer.Vector)) {
          this.tileListeners.push(this.registerLayerLoadEvents_(l))
        }
      }
    } else if (layer instanceof ol.layer.Layer) {
      if (!(layer instanceof ol.layer.Vector)) {
        this.tileListeners.push(this.registerLayerLoadEvents_(layer))
      }
    }
  }
}

/**
 * 更新加载状态
 * @private
 */
ol.control.Loading.prototype.updateLoadStatus_ = function () {
  let loadStatusArray = []
  let groups = this.getMap().getLayers().getArray()
  for (let i = 0; i < groups.length; i++) {
    let layer = groups[i]
    if (layer) {
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray()
        for (let j = 0; j < layers.length; j++) {
          let l = layers[j]
          if (l && l.getSource() && !(l instanceof ol.layer.Vector) && l.getSource().hasOwnProperty('isLoaded')) {
            loadStatusArray.push(l.getSource().isLoaded)
          }
        }
      } else if (layer.getSource() && layer.getSource().hasOwnProperty('isLoaded')) {
        loadStatusArray.push(layer.getSource().isLoaded)
      }
    }
  }
  this.loadStatus_ = (loadStatusArray.indexOf(false) === -1) && (loadStatusArray.indexOf(true) !== -1)
  if (!this.loadProgressByTile_) {
    // progress
    let count = {}
    loadStatusArray.forEach(function (i) {
      count[i] = (count[i] || 0) + 1
    })
    let loaded = (count[true]) ? count[true] : 0
    // progress events
    if (loaded > this.loadProgress_[0]) {
      this.loadProgress_ = [loaded, loadStatusArray.length]
      if (this.widget === 'progressBar') {
        this.element.max = this.loadProgress_[1]
        this.element.value = this.loadProgress_[0]
      }
      if (this.onCustomProgress) this.onCustomProgress.apply(this, this.loadProgress_)
    }
  }
}

/**
 * show
 */
ol.control.Loading.prototype.show = function () {
  if (this.showPanel) {
    this.element.style.display = 'block'
  }
}

/**
 * hide
 */
ol.control.Loading.prototype.hide = function () {
  if (this.showPanel) {
    this.element.style.display = 'none'
  }
}

/**
 * 显示进度详情
 * @returns {*[]|Array|[*,*]|[number,number]}
 */
ol.control.Loading.prototype.progressDetails = function () {
  return this.loadProgress_
}

/**
 * 显示进度条
 * @returns {number}
 */
ol.control.Loading.prototype.progress = function () {
  return this.loadProgress_[0] / this.loadProgress_[1]
}

/**
 * 设置地图
 * @param map
 */
ol.control.Loading.prototype.setMap = function (map) {
  if (this.mapListeners && this.mapListeners.length > 0) {
    this.mapListeners.forEach(listener => {
      this.getMap().unByKey(listener)
    })
  }
  this.mapListeners.length = 0
  ol.control.Control.prototype.setMap.call(this, map)
  if (map) {
    this.setup()
  }
}

let olControlLoading = ol.control.Loading
export default olControlLoading
