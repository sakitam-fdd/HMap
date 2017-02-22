/**
 * Created by FDD on 2017/2/21.
 * @desc 类库首文件
 */
import * as constants from  './constants'
let ol = require('../node_modules/openlayers')
class HMap {
  constructor () {
    /**
     * 地图工具
     * @type {{addPoint: boolean, ljQuery: boolean, iQuery: boolean, drawPlot: boolean, toolsType: {addPoint: string, ljQuery: string, iQuery: string, drawPlot: string}}}
     */
    this.mapTools = {
      addPoint: false, ljQuery: false,
      iQuery: false, drawPlot: false,
      addTextArea: false,
      toolsType: {
        addPoint: 'addPoint',
        ljQuery: 'ljQuery',
        iQuery: 'iQuery',
        drawPlot: 'drawPlot',
        addTextArea: 'addTextArea'
      }
    };
    this.addPointHandlerClick = null;
    this.plotDraw = null;//标绘工具
    this.plotEdit = null;
    this._lastDrawInteractionGeometry = null;
    this.wgs84Sphere = new ol.Sphere(6378137);
    window.ObservableObj = new ol.Object();
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
    this.projection = ol.proj.get('EPSG:' + options.projection);
    /**
     * 显示范围
     */
    this.fullExtent = options.fullExtent;
    /**
     * 投影范围
     */
    this.projection.setExtent(this.fullExtent);
    /**
     * 瓦片原点
     */
    this.origin = options.origin;
    /**
     * 瓦片大小
     */
    this.tileSize = options.tileSize;
    /**
     * 定义渲染参数
     */
    let size = ol.extent.getWidth(this.projection.getExtent()) / 256;
    /**
     * 渲染分辨率
     * @type {Array}
     * @private
     */
    this._resolutions = new Array(19);
    /**
     * 层级
     * @type {Array}
     */
    this.matrixIds = new Array(19);
    for (let z = 0; z < 19; ++z) {
      this._resolutions[z] = size / Math.pow(2, z);
      this.matrixIds[z] = z
    }
    this.map = new ol.Map({
      target: mapDiv,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      interactions: ol.interaction.defaults({
        doubleClickZoom: true,
        keyboard: false
      }),
      layers: this.getBaseLayerGroup(),
      view: new ol.View({
        center: ol.proj.fromLonLat(options.center, this.projection),
        zoom: options.zoom ? options.zoom : 0
      })
    })

    if (this.projection) {
      this.map.getView().set('projection', this.projection);
    }
    if (options['maxResolution']) {
      this.map.getView().set('maxResolution', options['maxResolution'])
    }
    if (options['minResolution']) {
      this.map.getView().set('minResolution', options['minResolution'])
    }
  }

  getBaseLayerGroup () {
    let baseLayers = new ol.layer.Group({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Tile({
          source: new ol.source.TileJSON({
            url: 'https://api.tiles.mapbox.com/v3/mapbox.20110804-hoa-foodinsecurity-3month.json?secure',
            crossOrigin: 'anonymous'
          })
        }),
        new ol.layer.Tile({
          source: new ol.source.TileJSON({
            url: 'https://api.tiles.mapbox.com/v3/mapbox.world-borders-light.json?secure',
            crossOrigin: 'anonymous'
          })
        })
      ]
    })
    return baseLayers;
  }

  getMap () {
    return this.map;
  }
}

export default HMap