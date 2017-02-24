/**
 * Created by FDD on 2017/2/21.
 * @desc 类库首文件
 */
import * as constants from  './constants'
import proj4 from '../node_modules/proj4'
let ol = require('../node_modules/openlayers')
// modules
import Layer from './layer'
import LayerSwitcher from './LayerSwitcher'
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

    this.resolutions = options.resolutions;

    let _layers = this._getBaseLayerGroup(options['baseLayers']);

    let _interactions = this._addInteractions(options['interactions']);

    let _view = this._addView(options);

    /**
     * 当前地图对象
     * @type {ol.Map}
     */
    this.map = new ol.Map({
      target: mapDiv,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      interactions: _interactions,
      layers: [new ol.layer.Group({
        layers: _layers,
        isBaseLayer: true
      })],
      view: _view
    });

    this._addControls(options['controls']);

    let timer = setInterval(() => {
      if (this.map) {
        this._addModule();
        clearInterval(timer);
      }
    }, 100);
  }

  /**
   * 拆分模块的添加
   * @private
   */
  _addModule () {
    this.layer = new Layer(this.map);
    this.layerSwitcher = new LayerSwitcher(this.map);
  }

  /**
   * 获取图层组
   * @returns {ol.layer.Group}
   */
  _getBaseLayerGroup (layerConfig) {
    let [layers, labelLayers, _layers, labelLayersConfig] = [[], [], [], []];
    if (layerConfig && Array.isArray(layerConfig) && layerConfig.length > 0) {
      layerConfig.forEach(config => {
        if (config['layerName'] && config['layerUrl'] && config['layerType']) {
          let layer = null;
          switch (config['layerType']) {
            case 'TileXYZ':
              layer = this._getXYZLayer(config);
              break;
            case 'TitleWMTS':
              layer = this._getWMTSLayer(config);
              break;
          }
          if (layer) layers.push(layer);
          if (config['label']) {
            labelLayersConfig.push(config['label'])
          }
        }
      })
    }
    labelLayers = this._getBaseLayerLabel(labelLayersConfig);
    _layers = layers.concat(labelLayers);
    return _layers;
  }

  /**
   * 主要处理标注层
   * @param labelLayersConfig
   * @returns {null}
   * @private
   */
  _getBaseLayerLabel (labelLayersConfig) {
    let [labelLayers, _labelLayersLayerNames] = [[], (new Set())];
    if (labelLayersConfig && Array.isArray(labelLayersConfig) && labelLayersConfig.length > 0) {
      labelLayersConfig.forEach(config => {
        if (config['layerName'] && config['layerUrl'] && config['layerType']) {
          _labelLayersLayerNames.add(config['layerName']);
        }
      });
      [...(_labelLayersLayerNames)].forEach(layerName => {
        labelLayersConfig.every(configM => {
          if (configM && configM['layerName'] === layerName) {
            let labelLayer = null;
            switch (configM['layerType']) {
              case 'TileXYZ':
                labelLayer = this._getXYZLayer(configM);
                break;
              case 'TitleWMTS':
                labelLayer = this._getWMTSLayer(configM);
                break;
            }
            if (labelLayer) labelLayers.push(labelLayer);
            return false;
          }
          return true;
        });
      });
    }
    return labelLayers;
  }

  /**
   * 获取标准XYZ图层
   * @param config
   * @returns {ol.layer.Tile}
   * @private
   */
  _getXYZLayer (config) {
    let tileUrl = config['layerUrl'];
    let tileGrid = new ol.tilegrid.TileGrid({
      tileSize: this.tileSize,
      origin: this.origin,
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
      alias: config['alias'] ? config['alias'] : '',
      isDefault: (config['isDefault'] === true) ? true : false,
      visible: (config['isDefault'] === true) ? true : false,
      layerName: config['layerName'] ? config.layerName : '',
      source: tileArcGISXYZ
    });
    return baseLayer
  }

  /**
   * 获取标准WMTS图层
   * @param config
   * @returns {ol.layer.Tile}
   * @private
   */
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
      alias: config['alias'] ? config['alias'] : '',
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
    let projection = '';
    if (options['projection']) {
      if (options['projection'].indexOf('EPSG') > 0) {
        projection = options['projection'];
      } else {
        projection = 'EPSG:' + options['projection'];
      }
    } else {
      projection = 'EPSG:3857';
    }
    return projection;
  }

  /**
   * 添加地图交互
   * @param interactions
   * @returns {*|{concatRepeatedArrays, mergeRepeatedObjects}|Object}
   * @private
   */
  _addInteractions (interactions) {
    let doubleClickZoom = (interactions['doubleClickZoom'] === true || interactions['doubleClickZoom'] === false) ? interactions['doubleClickZoom'] : true;
    let keyboard = (interactions['keyboard'] === true || interactions['keyboard'] === false) ? interactions['keyboard'] : false
    let _interaction = ol.interaction.defaults({
      doubleClickZoom: doubleClickZoom,
      keyboard: keyboard
    });
    return _interaction
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
    if (this.map && _controls && _controls.length > 0) {
      this.map.addControl(_controls)
    }
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