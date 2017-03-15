import mix from '../utils/mixin'
import { ol, proj4 } from '../constants'

import BaseLayers from './baseLayer'
import Controls from './Controls'
import Interactions from './Interactions'
import View from './View'

import Layer from '../layer/Layer'
import Feature from '../feature/feature'
import Style from '../style/Style'

const shapeType = {
  views: Symbol.for('views')
};

class Map extends mix(BaseLayers, Controls, Interactions, View, Style, Layer, Feature) {
  constructor () {
    super();
    this.addPointHandlerClick = null;
    this.plotDraw = null;//标绘工具
    this.plotEdit = null;
    this._lastDrawInteractionGeometry = null;
    window.ObservableObj = new ol.Object();
    proj4.defs('EPSG:4490', '+proj=longlat +ellps=GRS80 +no_defs');
    ol.proj.setProj4(proj4);

    /**
     * 当前地图线要素
     * @type {Array}
     */
    this.currentMapLines = [];
    /**
     * 当前地图点要素
     * @type {Array}
     */
    this.currentMapPoints = [];
    /**
     * 当前地图面要素
     * @type {Array}
     */
    this.currentMapPolygon = [];
    /**
     * 当前地图线图层
     * @type {Array}
     */
    this.lineLayers = new Set();
    /**
     * 当前地图点图层
     * @type {Array}
     */
    this.pointLayers = new Set();
    /**
     * 当前地图面图层
     * @type {Array}
     */
    this.polygonLayers = new Set();
    /**
     * 周边搜索要素
     * @type {null}
     */
    this.circleSerachFeat = null;
    /**
     * 当前地图气泡
     * @type {null}
     */
    this.popupOverlay = null;
  }

  /**
   * 初始化当前地图
   * @param mapDiv
   * @param params
   */
  initMap (mapDiv, params) {
    let options = params || {};
    /**
     * 当前地图对象
     * @type {ol.Map}
     */
    this.map = new ol.Map({
      target: mapDiv,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      logo: this._addCopyRight(options['logo']),
      layers: this.addBaseLayers(options['baseLayers'], options['view']),
      view: this._addView(options['view']),
      interactions: this._addInteractions(options['interactions']),
      controls: this._addControls(options['controls'])
    });

    this.map.on('click', event => {
      console.log(event.coordinate)
    })
  }

  _addCopyRight () {
    return true
  }

  getMap () {
    return this.map
  }
}

export default Map