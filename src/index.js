// polyfill
import 'core-js/modules/es6.object.assign'
import 'core-js/es6/set'
import 'core-js/es6/symbol'
import 'core-js/es6/reflect'
// message
const version = require('../package.json').version
const name = require('../package.json').name
const author = require('../package.json').author
// scss
import './scss/index'
// outer
import ol from 'openlayers'
import mixin from './utils/mixins'
import Observable from 'observable-emit'
// inter
import * as supported from './utils/supported'
import { logo } from './assets/index'
import config from './utils/config'
import _Layer from './layer/Layer'
import _Map from './map/Map'
import _View from './map/View'
import _BaseLayers from './map/BaseLayers'
import _Controls from './map/Controls'
import _Interactions from './map/Interactions'
import _Feature from './feature/feature'
import _Overlay from './feature/overlay'
import { isObject } from './utils/utils'
import { EVENT_TYPE, INTERNAL_KEY } from './constants'
class HMap extends mixin(
  _Map, Observable, _View, _BaseLayers,
  _Controls, _Interactions, _Layer,
  _Feature, _Overlay
) {
  constructor () {
    super()

    /**
     * 当前版本
     */
    this.version_ = version

    /**
     * logo
     * @type {string}
     * @private
     */
    this.logo_ = logo

    /**
     * 当前地图线要素
     * @type {Array}
     */
    this.currentMapLines = []

    /**
     * 当前地图点要素
     * @type {Array}
     */
    this.currentMapPoints = []

    /**
     * 当前地图面要素
     * @type {Array}
     */
    this.currentMapPolygon = []

    /**
     * 当前地图线图层
     * @type {Set}
     */
    this.lineLayers = new Set()

    /**
     * 当前地图点图层
     * @type {Set}
     */
    this.pointLayers = new Set()

    /**
     * 当前地图面图层
     * @type {Set}
     */
    this.polygonLayers = new Set()

    /**
     * 选择交互
     * @type {null}
     */
    this.selectInteraction = null

    /**
     * 移动交互
     * @type {null}
     */
    this.moveInteraction = null

    /**
     * 当前选择要素
     * @type {null}
     */
    this.currentSelectFeature = null

    /**
     * 上一次选择要素
     * @type {null}
     */
    this.lastSelectFeature = null

    /**
     * 当前视图
     * @type {null}
     */
    this.view = null

    /**
     * 定时器
     * @type {null}
     * @private
     */
    this.timer_ = null

    /**
     * map
     * @type {null}
     */
    this.map = null

    /**
     * 如果定义时给参数则直接初始化
     */
    let _arguments = Array.prototype.slice.call(arguments)
    if (_arguments.length === 1 && isObject(_arguments[0])) {
      if (_arguments[0]['target']) {
        this.initMap(_arguments[0]['target'], _arguments[0])
      }
    } else if (_arguments.length === 2 && _arguments[0] && isObject(_arguments[1])) {
      this.initMap(_arguments[0], _arguments[1])
    }

    /**
     * 打印版本信息
     */
    this.showMassages_()

    Observable.call(this)
  }

  /**
   * 初始化当前地图
   * @param mapDiv
   * @param params
   */
  initMap (mapDiv, params = {}) {
    try {
      /**
       * 地图的容器，元素本身或元素的id。如果在构建时未指定，则必须调用ol.Map＃setTarget才能呈现地图
       */
      this.target_ = mapDiv

      /**
       * 地图相关配置
       * @type {{}}
       */
      this.options_ = params

      /**
       * 当前视图
       * @type ol.View
       */
      this.view_ = this._addView(this.options_['view'])
      let logo = this._addCopyRight(this.options_['logo'])
      let layers = this.addBaseLayers(this.options_['baseLayers'])
      let interactions = this._addInteractions(this.options_['interactions'])
      let controls = this._addControls(this.options_['controls'])
      /**
       * 当前地图对象
       * @type {ol.Map}
       */
      this.map = new ol.Map({
        target: this.target_,
        loadTilesWhileAnimating: (typeof this.options_['loadTilesWhileAnimating'] ===
          'boolean' ? this.options_['loadTilesWhileAnimating'] : false),
        loadTilesWhileInteracting: (typeof this.options_['loadTilesWhileInteracting'] ===
          'boolean' ? this.options_['loadTilesWhileInteracting'] : false),
        logo: logo,
        layers: layers,
        view: this.view_,
        interactions: interactions,
        controls: controls
      })

      // 添加事件
      this._addEvent()
      this._addMapInteraction()

      /**
       * 加载成功事件
       */
      this.dispatch(EVENT_TYPE.LOAD_MAP_SUCCESS, true)
    } catch (error) {
      this.dispatch(EVENT_TYPE.LOAD_MAP_SUCCESS, error)
    }
  }

  /**
   * 添加事件
   * @private
   */
  _addEvent () {
    /**
     * 监听点击事件
     */
    this.map.on(EVENT_TYPE.CLICK, event => {
      this.dispatch(EVENT_TYPE.CLICK, event)
    })

    /**
     * 监听双击事件
     */
    this.map.on(EVENT_TYPE.DBCLICK, event => {
      this.dispatch(EVENT_TYPE.DBCLICK, event)
    })

    /**
     * 监听单击事件
     */
    this.map.on(EVENT_TYPE.SINGLECLICK, event => {
      this.dispatch(EVENT_TYPE.SINGLECLICK, event)
    })

    /**
     * 监听地图移动开始事件
     */
    this.map.on(EVENT_TYPE.MOVESTART, event => {
      this.dispatch(EVENT_TYPE.MOVESTART, event)
    })

    /**
     * 监听地图移动结束事件
     */
    this.map.on(EVENT_TYPE.MOVEEND, event => {
      this.dispatch(EVENT_TYPE.MOVEEND, event)
    })

    /**
     * 监听拖拽事件
     */
    this.map.on(EVENT_TYPE.POINTERDRAG, event => {
      this.dispatch(EVENT_TYPE.POINTERDRAG, event)
    })

    /**
     * 监听移动事件
     */
    this.map.on(EVENT_TYPE.POINTERMOVE, event => {
      this.dispatch(EVENT_TYPE.POINTERMOVE, event)
    })

    /**
     * 监听渲染完成事件
     */
    this.map.on(EVENT_TYPE.POSTCOMPOSE, event => {
      this.dispatch(EVENT_TYPE.POSTCOMPOSE, event)
    })

    /**
     * 监听开始渲染事件
     */
    this.map.on(EVENT_TYPE.POSTRENDER, event => {
      this.dispatch(EVENT_TYPE.POSTRENDER, event)
    })

    /**
     * 监听开始渲染之前
     */
    this.map.on(EVENT_TYPE.PRECOMPOSE, event => {
      this.dispatch(EVENT_TYPE.PRECOMPOSE, event)
    })

    /**
     * 监听属性变化事件
     */
    this.map.on(EVENT_TYPE.PROPERTYCHANGE, event => {
      this.dispatch(EVENT_TYPE.PROPERTYCHANGE, event)
    })

    /**
     * 监听change事件
     */
    this.map.on(EVENT_TYPE.CHANGE, event => {
      this.dispatch(EVENT_TYPE.CHANGE, event)
    })

    /**
     * 监听图层组变化事件
     */
    this.map.on(EVENT_TYPE.CHANGELAYERGROUP, event => {
      this.dispatch(EVENT_TYPE.CHANGELAYERGROUP, event)
    })

    /**
     * 监听大小变化事件
     */
    this.map.on(EVENT_TYPE.CHANGESIZE, event => {
      this.dispatch(EVENT_TYPE.CHANGESIZE, event)
    })

    /**
     * 监听target变化事件
     */
    this.map.on(EVENT_TYPE.CHANGETARGET, event => {
      this.dispatch(EVENT_TYPE.CHANGETARGET, event)
    })

    /**
     * 监听视图变化事件
     */
    this.map.on(EVENT_TYPE.CHANGEVIEW, event => {
      this.dispatch(EVENT_TYPE.CHANGEVIEW, event)
    })
  }

  /**
   * 添加地图交互
   * @private
   */
  _addMapInteraction () {
    // 添加选中交互
    this.selectInteraction = new ol.interaction.Select({
      condition: ol.events.condition.click,
      style: function (feature, resolution) {
        return [
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#D97363',
              width: 10
            })
          })
        ]
      },
      layers: function (layer) {
        return (layer.get(INTERNAL_KEY.SELECTABLE) === true)
      }
    })
    // 添加鼠标移动交互
    this.moveInteraction = new ol.interaction.Select({
      condition: ol.events.condition.pointerMove,
      style: function (feature, resolution) {
        return [
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#D97363',
              width: 10
            })
          })
        ]
      },
      layers: function (layer) {
        return (layer.get(INTERNAL_KEY.SELECTABLE) === true)
      },
      filter: function (feat, layer) {
        if (feat.get('features')) {
          return feat.get('features').length <= 1
        }
        return true
      }
    })
    this.moveInteraction.on('select', event => {
      let [selected, feature] = [event.selected, null]
      if (selected.length === 0) {
        let deselected = event.deselected
        if (deselected.length > 0) {
          feature = deselected[0]
          this.unHighLightFeature('', feature, '')
          if (feature && feature instanceof ol.Feature) {
            this.dispatch(EVENT_TYPE.FEATUREONMOUSEOUT, {
              type: EVENT_TYPE.FEATUREONMOUSEOUT,
              originEvent: event,
              value: feature
            })
          }
        }
      } else {
        feature = selected[0]
        // 如果两个要素距离太近，会连续选中，而无法得到上一个选中的要素，所以在此保留起来
        if (this.lastSelectFeature && this.lastSelectFeature instanceof ol.Feature) {
          this.unHighLightFeature('', this.lastSelectFeature, '')
          this.lastSelectFeature = null
        }
        this.lastSelectFeature = feature
        this.highLightFeature('', feature, '')
        if (feature && feature instanceof ol.Feature) {
          this.dispatch(EVENT_TYPE.FEATUREONMOUSEOVER, {
            type: EVENT_TYPE.FEATUREONMOUSEOVER,
            originEvent: event,
            value: feature
          })
        }
      }
    })
    this.selectInteraction.on('select', event => {
      let [selected, feature] = [event.selected, null]
      if (selected.length === 0) {
        let deselected = event.deselected
        if (deselected.length > 0) {
          feature = deselected[0]
          this.unHighLightFeature('', feature, '')
          if (feature && feature instanceof ol.Feature) {
            this.dispatch(EVENT_TYPE.FEATUREONDISSELECT, {
              type: EVENT_TYPE.FEATUREONDISSELECT,
              originEvent: event,
              value: feature
            })
          }
        }
      } else {
        feature = selected[0]
        // 如果两个要素距离太近，会连续选中，而无法得到上一个选中的要素，所以在此保留起来
        if (this.lastSelectFeature && this.lastSelectFeature instanceof ol.Feature) {
          this.unHighLightFeature('', this.lastSelectFeature, '')
          this.lastSelectFeature = null
        }
        this.lastSelectFeature = feature
        this.highLightFeature('', feature, '')
        if (feature && feature instanceof ol.Feature) {
          this.dispatch(EVENT_TYPE.FEATUREONSELECT, {
            type: EVENT_TYPE.FEATUREONSELECT,
            originEvent: event,
            value: feature
          })
        }
      }
    })
    this.map.addInteraction(this.moveInteraction)
    this.map.addInteraction(this.selectInteraction)
  }

  /**
   * 添加要素选择事件
   * @param event
   * @private
   */
  _addFeatureSelectEvent (event) {
    let feature = this.map.forEachFeatureAtPixel(event.pixel, function (feature) {
      return feature
    })
    if (feature && feature instanceof ol.Feature) {
      this.dispatch(EVENT_TYPE.FEATUREONMOUSEOVER, {
        type: EVENT_TYPE.FEATUREONMOUSEOVER,
        originEvent: event,
        value: feature
      })
    }
  }

  /**
   * 添加版权信息
   * @returns {boolean}
   * @private
   */
  _addCopyRight (params) {
    let logo = false
    if (params === true) {
      logo = {
        href: config.INDEX_URL,
        src: this.logo_
      }
    } else if (isObject(params)) {
      logo = params
    } else {
      logo = false
    }
    return logo
  }

  /**
   * 显示相关信息
   * @private
   */
  showMassages_ () {
    console.log('%c            ', "font-size:16px; padding:18px 24px;line-height:48px;background:url('" + this.logo_ + "') no-repeat;background-size: 48px;")
    console.log(name, version, '©', author)
  }
  static supported = supported
  static layer = _Layer
  static get accessToken () {
    return config.ACCESS_TOKEN
  }
  static set accessToken (token) {
    config.ACCESS_TOKEN = token
  }
}
export default HMap

export {
  _Layer,
  _Map,
  _View,
  _BaseLayers,
  _Controls,
  _Interactions,
  _Feature,
  _Overlay,
  Observable
}
