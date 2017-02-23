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
    this.projection = ol.proj.get(this._addProjection(options));
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
     * 当前地图对象
     * @type {ol.Map}
     */
    this.map = new ol.Map({
      target: mapDiv,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      controls: this._addControls(options['controls']),
      interactions: this._addInteractions(options['interactions']),
      layers: this._getBaseLayerGroup(options['baseLayers']),
      view: this._addView(options)
    })
  }

  /**
   * 获取图层组
   * @returns {ol.layer.Group}
   */
  _getBaseLayerGroup (layerConfig) {
    try {
      let layers = [];
      if (layerConfig && Array.isArray(layerConfig) && layerConfig.length > 0) {
        layers.push(new ol.layer.Tile({
          source: new ol.source.OSM()
        }))
      }
      let baseLayers = new ol.layer.Group({
        layers: layers
      });
      return baseLayers;
    } catch (e) {
      console.log(e)
    } finally { // 如果错误了，返回osm图层，避免地图容器空白
      return new ol.layer.Group({
        layers: new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      })
    }
  }

  _getXYZLayer (config) {
    let tileUrl = config['tileUrl'];
    let tileGrid = new ol.tilegrid.TileGrid({
      tileSize: this.tileSize,
      origin: ol.extent.getTopLeft(this.projection.getExtent()),
      extent: this.fullExtent,
      resolutions: this.resolutions
    });
    let tileArcGISXYZ = new ol.source.XYZ({
      wrapX: false,
      tileGrid: tileGrid,
      tileSize: this.tileSize,
      opaque: (config['opaque'] === true) ? true : false, // 图层是否不透明（主题相关）
      tilePixelRatio: 1, //todo 对于高分辨率设备，例如苹果等可能2、3（移动端开发需要注意）
      projection: this.projection,
      crossOrigin: 'Anonymous',
      tileUrlFunction: function (tileCoord) {
        let url = (tileUrl + '/tile/{z}/{y}/{x}').replace('{z}',
          (tileCoord[0]).toString()).replace('{x}',
          tileCoord[1].toString()).replace('{y}',
          (-tileCoord[2] - 1).toString());
        return url
      }
    });
    let baseLayer = new ol.layer.Tile({
      isBaseLayer: true,
      isDefault: (config['isDefault'] === true) ? true : false,
      visible: (config['isDefault'] === true) ? true : false,
      layerName: config['layerName'] ? config.layerName : '',
      source: tileArcGISXYZ
    });
    return baseLayer
  }

  _getWMTSLayer (config) {
    let projection = ol.proj.get('EPSG:4326');
    let size = ol.extent.getWidth(projection.getExtent()) / 256;
    let resolutions = new Array(19);
    let matrixIds = new Array(19);
    for (let z = 0; z < 19; ++z) {
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = z;
    }
    let layer = new ol.layer.Tile({
      isBaseLayer: true,
      isDefault: (config['isDefault'] === true) ? true : false,
      layerName: config['layerName'] ? config.layerName : '',
      visible: (config['isDefault'] === true) ? true : false,
      source: new ol.source.WMTS({
        url: config['layerUrl'],
        layer: config['layer'],
        matrixSet: 'c',
        format: 'tiles',
        crossOrigin: 'Anonymous',
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
          origin: ol.extent.getTopLeft(this.projection.getExtent()),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: 'default',
        wrapX: false
      })
    });
    return layer;
  }

  /**
   * 当前视图
   * @type {ol.View}
   */
  _addView (options) {
    let view = new ol.View({
      center: ol.proj.fromLonLat(options['center'], this.projection),
      zoom: options['zoom'] ? options.zoom : 0
    });
    if (this.projection) {
      view.set('projection', this.projection);
    }
    if (options['maxResolution']) {
      view.set('maxResolution', options['maxResolution'])
    }
    if (options['minResolution']) {
      view.set('minResolution', options['minResolution'])
    }
    return view;
  }

  /**
   * 若传入了投影坐标系需要处理
   * @param options
   * @returns {*}
   * @private
   */
  _addProjection (options) {
    if (options['projection']) {
      if (options['projection'].indexOf('EPSG') > 0) {
        options['projection'] = options['projection'];
      } else {
        options['projection'] = 'EPSG: ' + options['projection'];
      }
    } else {
      options['projection'] = 'EPSG: 3857';
    }
    return options['projection'];
  }

  /**
   * 添加地图交互
   * @param interactions
   * @returns {*|{concatRepeatedArrays, mergeRepeatedObjects}|Object}
   * @private
   */
  _addInteractions (interactions) {
    return ol.interaction.defaults({
      doubleClickZoom: (interactions['doubleClickZoom'] === true || interactions['doubleClickZoom'] === false) ? interactions['doubleClickZoom'] : true,
      keyboard: (interactions['keyboard'] === true || interactions['keyboard'] === false) ? interactions['keyboard'] : false
    })
  }

  /**
   * 添加地图控制器
   * @param controls
   * @returns {Array}
   * @private
   */
  _addControls (controls) {
    let _controls = [];
    if (controls['addScaleLine']) {
      _controls.push(new ol.control.ScaleLine({
        target: 'hdscalebar'
      }))
    }
    if (controls['addLoading']) {
      _controls.push(new ol.control.Loading())
    }
    return _controls
  }

  /**
   * 获取当前地图对象
   * @returns {ol.Map}
   */
  getMap () {
    return this.map;
  }

  /**
   * 获取当前视图
   * @returns {*}
   */
  getView () {
    return this.map.getView();
  }
}

export default HMap