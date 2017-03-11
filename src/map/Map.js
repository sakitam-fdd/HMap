import mix from '../utils/mixin'
import { ol, proj4 } from '../constants'

import BaseLayer from './baseLayer'
import Controls from './Controls'
import Interactions from './Interactions'
import View from './View'

import Layer from '../layer/Layer'
import Feature from '../feature/feature'

class Map extends mix(BaseLayer, Controls, Interactions, View, Layer, Feature) {
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
     * 投影
     * @type {ol.proj.Projection}
     */
    this.projection = ol.proj.get('EPSG:4326');
    /**
     * 显示范围
     */
    this.fullExtent = options['fullExtent'] ? options.fullExtent : [-180, -90, 180, 90];
    /**
     * 投影范围
     */
    this.projection.setExtent(this.fullExtent);
    /**
     * 瓦片原点
     * @desc 设置瓦片原点的目的是因为部分地图切图原点不是[0,0]
     * 为保证正确加载，所以必须设置瓦片原点。
     */
    this.origin = options.origin;
    /**
     * 瓦片大小
     * @desc 切片大小，典型值有256， 512.
     * 默认256
     */
    this.tileSize = options.tileSize;
    /**
     * 分辨率
     * @type Array
     */
    this.resolutions = options.resolutions;

    /**
     * 当前地图对象
     * @type {ol.Map}
     */
    this.map = new ol.Map({
      target: mapDiv,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      layers: [new ol.layer.Tile({
        source: new ol.source.OSM()
      })],
      view: this.getView()
    });

    this.map.on('click', event => {
      console.log(event.coordinate)
    })
  }

  getMap () {
    return this.map
  }
}

export default Map