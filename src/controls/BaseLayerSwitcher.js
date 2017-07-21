/**
 * Created by FDD on 2017/6/14.
 * @desc 底图切换控件
 */
import {ol} from '../constants'
import {DomUtil, css} from '../dom'
// import mix from '../utils/mixin'
import LayerSwitcher from '../plugins/LayerSwitcher'
ol.control.BaseLayerSwitcher = function (params) {
  this.options = params || {}
  let className = (this.options.className !== undefined ? this.options.className : 'hmap-baseLayer-switch')
  let mapConfigStr = this.map.getProperties()
  if (mapConfigStr) {
    let mapConfig = JSON.parse(mapConfigStr)
    this.baseLayerConfig = mapConfig['baseLayers']
  }
  /**
   * @private
   * @type {Element}
   */
  this.element_ = DomUtil.create('div', (className + ' ' + css.CLASS_UNSELECTABLE))
  /**
   * @private
   * @type {Element}
   */
  this.innerElement_ = DomUtil.create('ul', className + '-inner', this.element_, className + '-inner')
  this.LayerSwitcher = new LayerSwitcher(this.map)
  this.innerElement_.addEventListener('click', event => {
    let ev = event || window.event
    let target = ev.target || ev.srcElement
    if (target.nodeName.toLowerCase() === 'li') {
      let layerName = 'vector'
      this.LayerSwitcher.switchLayer(layerName)
    }
  })
  ol.control.Control.call(this, {
    element: this.element_,
    target: this.options['target']
  })
}

ol.inherits(ol.control.BaseLayerSwitcher, ol.control.Control)

/**
 * 初始化页面元素
 */
ol.control.BaseLayerSwitcher.prototype.initDom = function () {
  if (this.baseLayerConfig && Array.isArray(this.baseLayerConfig) && this.baseLayerConfig.length > 0) {
    this.baseLayerConfig.forEach(item => {
      if (item && item['layerName']) {
        this.liDom = this.creatDom(['li', 'span'], ['mapTypeCard' + item['layerName'], 'title'], this.innerElement_)
        this.liDom.setAttribute('data-name', item['layerName'])
      }
    })
  }
}

/**
 * 创建页面模板（tagNames，classNames，ids）长度保持唯一
 * @param tagNames
 * @param classNames
 * @param container
 * @param ids
 */
ol.control.BaseLayerSwitcher.prototype.creatDom = function (tagNames, classNames, container, ids) {
  let templates = ''
  if (Array.isArray(tagNames) && Array.isArray(classNames) && Array.isArray(ids) && tagNames.length === classNames.length === ids.length) {
    let els = tagNames.map((tagName, index) => {
      let el = document.createElement(tagName)
      el.className = classNames[index] || ''
      if (ids[index]) {
        el.id = ids[index]
      }
      return el
    })
    if (els && els.length > 0) {
      els.forEach((item, index) => {
        if (index > 0) {
          els[index - 1].appendChild(item)
        }
        templates = els[0]
      })
    }
  }
  if (container) {
    container.appendChild(templates)
  }
  return templates
}

// class BaseLayerSwitcher extends mix(ol.control.Control) {
//   constructor (params) {
//     super()
//     this.options = params || {}
//     let className = (this.options.className !== undefined ? this.options.className : 'hmap-baseLayer-switch')
//     if (!this.map) {
//       if (!this.options['map'] || !(this.options['map'] instanceof ol.Map)) {
//         throw new Error('缺少底图对象！')
//       } else {
//         this.map = this.options['map']
//       }
//     } else if (this.map && !(this.map instanceof ol.Map)) {
//       throw Error('不是地图对象！')
//     }
//     let mapConfigStr = this.map.getProperties()
//     if (mapConfigStr) {
//       let mapConfig = JSON.parse(mapConfigStr)
//       this.baseLayerConfig = mapConfig['baseLayers']
//     }
//     /**
//      * @private
//      * @type {Element}
//      */
//     this.element_ = DomUtil.create('div', (className + ' ' + css.CLASS_UNSELECTABLE))
//     /**
//      * @private
//      * @type {Element}
//      */
//     this.innerElement_ = DomUtil.create('ul', className + '-inner', this.element_, className + '-inner')
//     this.LayerSwitcher = new LayerSwitcher(this.map)
//     this.innerElement_.addEventListener('click', event => {
//       let ev = event || window.event
//       let target = ev.target || ev.srcElement
//       if (target.nodeName.toLowerCase() === 'li') {
//         let layerName = 'vector'
//         this.LayerSwitcher.switchLayer(layerName)
//       }
//     })
//     ol.control.Control.call(this, {
//       element: this.element_,
//       target: this.options['target']
//     })
//   }
//
//   /**
//    * 初始化页面元素
//    */
//   initDom () {
//     if (this.baseLayerConfig && Array.isArray(this.baseLayerConfig) && this.baseLayerConfig.length > 0) {
//       this.baseLayerConfig.forEach(item => {
//         if (item && item['layerName']) {
//           this.liDom = this.creatDom(['li', 'span'], ['mapTypeCard' + item['layerName'], 'title'], this.innerElement_)
//           this.liDom.setAttribute('data-name', item['layerName'])
//         }
//       })
//     }
//   }
//
//   /**
//    * 创建页面模板（tagNames，classNames，ids）长度保持唯一
//    * @param tagNames
//    * @param classNames
//    * @param container
//    * @param ids
//    */
//   creatDom (tagNames, classNames, container, ids) {
//     let templates = ''
//     if (Array.isArray(tagNames) && Array.isArray(classNames) && Array.isArray(ids) && tagNames.length === classNames.length === ids.length) {
//       let els = tagNames.map((tagName, index) => {
//         let el = document.createElement(tagName)
//         el.className = classNames[index] || ''
//         if (ids[index]) {
//           el.id = ids[index]
//         }
//         return el
//       })
//       if (els && els.length > 0) {
//         els.forEach((item, index) => {
//           if (index > 0) {
//             els[index - 1].appendChild(item)
//           }
//           templates = els[0]
//         })
//       }
//     }
//     if (container) {
//       container.appendChild(templates)
//     }
//     return templates
//   }
// }
//
// export default BaseLayerSwitcher
