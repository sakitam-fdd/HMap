/**
 * Created by FDD on 2017/9/18.
 * @desc 底图相关处理
 */
import ol from 'openlayers'
import config from '../utils/config'
import Layer from '../layer/Layer'
import {toConsumableArray} from '../utils'
class BaseLayers extends Layer {
  /**
   * 添加底图
   * @param params
   * @returns {[*]}
   */
  addBaseLayers (params = []) {
    if (!params || !Array.isArray(params) || params.length <= 0) {
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
  _getBaseLayerGroup (layerConfigs) {
    let [layers, labelLayers, _layers, labelLayersConfig] = [[], [], [], []]
    if (layerConfigs && Array.isArray(layerConfigs) && layerConfigs.length > 0) {
      layerConfigs.forEach(_config => {
        if (_config['layerName'] && _config['layerUrl'] && _config['layerType']) {
          let layer = this._getLayer(_config)
          if (layer) layers.push(layer)
          if (_config['label'] && Array.isArray(_config['label'])) {
            _config['label'].forEach(_label => {
              if (_label['layerName'] && _label['layerUrl'] && _label['layerType']) {
                labelLayersConfig.push(_label)
              }
            })
          } else if (typeof _config['label'] === 'object') { // 处理多个标注层的情况
            labelLayersConfig.push(_config['label'])
          }
        }
      })
    }
    labelLayers = this._getBaseLayerLabel(labelLayersConfig)
    _layers = layers.concat(labelLayers)
    return _layers
  }

  /**
   * 主要处理标注层
   * @param labelLayersConfig
   * @returns {null}
   * @private
   */
  _getBaseLayerLabel (labelLayersConfig) {
    let [labelLayers, _labelLayersLayerNames] = [[], (new Set())]
    if (labelLayersConfig && Array.isArray(labelLayersConfig) && labelLayersConfig.length > 0) {
      labelLayersConfig.forEach(config => {
        if (config['layerName'] && config['layerUrl'] && config['layerType']) {
          _labelLayersLayerNames.add(config['layerName'])
        }
      })
      const layers = [...(toConsumableArray(_labelLayersLayerNames))]
      layers.forEach(layerName => {
        labelLayersConfig.every(configM => {
          if (configM && configM['layerName'] === layerName) {
            let labelLayer = this._getLayer(configM)
            if (labelLayer) labelLayers.push(labelLayer)
            return false
          }
          return true
        })
      })
    }
    return labelLayers
  }

  /**
   * 获取图层
   * @param layerConfig
   * @returns {*}
   * @private
   */
  _getLayer (layerConfig) {
    switch (layerConfig['layerType']) {
      case 'TileXYZ':
        return (this._getXYZLayer(layerConfig))
      case 'TileWMTS':
        return (this._getWMTSLayer(layerConfig))
      case 'OSM':
        return (this._getOSMLayer(layerConfig))
      case 'ImageWMS':
        return (this._getImageWMSLayer(layerConfig))
      case 'TileWMS':
        return (this._getTileWMSLayer(layerConfig))
      case 'MapboxVectorTile':
        return (this._getMapboxVectorTileLayer(layerConfig))
      case 'TileArcGISRest':
        return (this._getTileArcGISRestLayer(layerConfig))
      case 'BaiDu':
        return (this._getBaiDuLayer(layerConfig))
      case 'GaoDe':
        return (this._getGaoDeLayer(layerConfig))
      case 'Google':
        return (this._getGoogleLayer(layerConfig))
      default:
        throw new Error('不支持的图层类型！')
    }
  }

  /**
   * 获取标准XYZ图层
   * @param layerConfig
   * @returns {ol.layer.Tile}
   * @private
   */
  _getXYZLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    if (!layerConfig.hasOwnProperty('tileGrid')) {
      layerConfig['tileGrid'] = {}
    }
    let layer = this.createXYZLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 加载开源OSM图层
   * @param layerConfig
   * @returns {ol.layer.Tile}
   * @private
   */
  _getOSMLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createOSMLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 加载百度图层
   * @param layerConfig
   * @returns {*}
   * @private
   */
  _getBaiDuLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createBaiDuLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 加载高德图层
   * @param layerConfig
   * @returns {*}
   * @private
   */
  _getGaoDeLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createGaoDeLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 加载高德图层
   * @param layerConfig
   * @returns {*}
   * @private
   */
  _getGoogleLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createGoogleLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 获取标准WMTS图层
   * @param layerConfig
   * @returns {ol.layer.Tile}
   * @private
   */
  _getWMTSLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createWMTSLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * Images WMS 方式加载
   * @param layerConfig
   * @private
   */
  _getImageWMSLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createImageWMSLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * Title WMS 方式加载
   * @param layerConfig
   * @returns {ol.layer.Tile}
   * @private
   */
  _getTileWMSLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createTileWMSLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 添加MapBox的矢量图层
   * @param layerConfig
   * @returns {*}
   * @private
   */
  _getMapboxVectorTileLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createMapboxVectorTileLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 创建arcgis矢量渲染图层
   * @param layerConfig
   * @returns {*}
   * @private
   */
  _getTileArcGISRestLayer (layerConfig) {
    let layerName = layerConfig['layerName'] || ''
    layerConfig['addLayer'] = false
    layerConfig['create'] = true
    let layer = this.createTitleLayer(layerName, layerConfig)
    layer = this._addLayerAlias(layer, layerConfig)
    return layer
  }

  /**
   * 添加底图标识
   * @param layer
   * @param layerConfig
   * @returns {*}
   * @private
   */
  _addLayerAlias (layer, layerConfig) {
    const isDefault = (layerConfig['isDefault'] === true) ? layerConfig['isDefault'] : false
    layer.set('isDefault', isDefault)
    layer.set('isBaseLayer', true)
    layer.setVisible(isDefault)
    layer.set('alias', (layerConfig['alias'] ? layerConfig['alias'] : ''))
    layer.getSource().setAttributions(this._getAttribution(layerConfig['attribution']))
    return layer
  }

  /**
   * 获取版权信息
   * @returns {Xr.Attribution|Jr.Attribution|Wr.Attribution|*|ol.Attribution|ol.control.Attribution}
   * @private
   */
  _getAttribution (params) {
    let attribution
    if (params === true) {
      params = {}
      params['url'] = config.INDEX_URL
      params['messages'] = 'contributors.'
      params['title'] = 'HMap'
      attribution = new ol.Attribution({
        html: '&copy; ' + '<a href="' + params['url'] + '">' + params['title'] + '</a> ' + params['messages']
      })
    } else if (typeof params === 'object') {
      attribution = new ol.Attribution({
        html: '&copy; ' + '<a href="' + params['url'] + '">' + params['title'] + '</a> ' + params['messages']
      })
    }
    return attribution
  }
}

export default BaseLayers
