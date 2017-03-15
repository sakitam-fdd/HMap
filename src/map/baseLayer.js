import {ol} from '../constants'
class BaseLayers {
  addBaseLayers (params, view) {
    let options = params || [];
    let _view = view || {};
    if (_view) {
      /**
       * 投影
       * @type {ol.proj.Projection}
       */
      this.projection = ol.proj.get((_view['projection'] ? _view.projection : 'EPSG:3857'));
      /**
       * 显示范围
       */
      this.fullExtent = _view['fullExtent'] ? _view.fullExtent : [-180, -90, 180, 90];
      /**
       * 投影范围
       */
      this.projection.setExtent(this.fullExtent);
      /**
       * 瓦片原点
       * @desc 设置瓦片原点的目的是因为部分地图切图原点不是[0,0]
       * 为保证正确加载，所以必须设置瓦片原点。
       */
      this.origin = _view.origin;
      /**
       * 瓦片大小
       * @desc 切片大小，典型值有256， 512.
       * 默认256
       */
      this.tileSize = _view.tileSize;
      /**
       * 分辨率
       * @type Array
       */
      this.resolutions = _view['resolutions'];
    }

    if (!options || !Array.isArray(options) || options.length <= 0) {
      return [new ol.layer.Group({
        layers: [new ol.layer.Tile({
          source: new ol.source.OSM()
        })],
        isBaseLayer: true
      })]
    } else {
      return [new ol.layer.Group({
        layers: this._getBaseLayerGroup(params),
        isBaseLayer: true
      })]
    }
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
            case 'OSM':
              layer = this._getOSMLayer(config)
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
      // crossOrigin: 'Anonymous',
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
   * 加载开源OSM图层
   * @param config
   * @returns {ol.layer.Tile}
   * @private
   */
  _getOSMLayer (config) {
    let baseLayer = new ol.layer.Tile({
      isBaseLayer: true,
      alias: config['alias'] ? config['alias'] : '',
      isDefault: (config['isDefault'] === true) ? true : false,
      visible: (config['isDefault'] === true) ? true : false,
      layerName: config['layerName'] ? config.layerName : '',
      source: new ol.source.OSM({
        wrapX: false,
        opaque: (config['opaque'] === true) ? true : false, // 图层是否不透明（主题相关）
        url: config['layerUrl'] ? config['layerUrl'] : 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        crossOrigin: 'Anonymous'
      })
    });
    return baseLayer;
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
          origin: ol.extent.getTopLeft(projection.getExtent()),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: 'default',
        wrapX: false
      })
    });
    return layer;
  }
}

export default BaseLayers