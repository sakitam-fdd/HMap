import LayerGroup from 'ol/layer/group'
import LayerTitle from 'ol/layer/tile'
import LayerImage from 'ol/layer/image'
import OSMSource from 'ol/source/osm'
import VectorTile from 'ol/layer/vectortile'
import Attribution from 'ol/attribution'
import olProj from 'ol/proj'
class BaseLayers {

  /**
   * 添加底图
   * @param params
   * @param view
   * @returns {[*]}
   */
  addBaseLayers (params, view) {
    let options = params || []
    let _view = view || {}
    if (_view) {
      /**
       * 投影
       * @type {ol.proj.Projection}
       */
      this.projection = olProj.get((_view['projection'] ? _view.projection : 'EPSG:3857'))
      /**
       * 显示范围
       */
      this.fullExtent = _view['extent'] ? _view.extent : undefined
      /**
       * 投影范围
       */
      if (this.fullExtent) {
        this.projection.setExtent(this.fullExtent)
      }
      /**
       * 瓦片原点
       * @desc 设置瓦片原点的目的是因为部分地图切图原点不是[0,0]
       * 为保证正确加载，所以必须设置瓦片原点。
       */
      this.origin = _view.origin
      /**
       * 瓦片大小
       * @desc 切片大小，典型值有256， 512.
       * 默认256
       */
      this.tileSize = _view.tileSize
      /**
       * 分辨率
       * @type Array
       */
      this.resolutions = _view['resolutions']
    }

    if (!options || !Array.isArray(options) || options.length <= 0) {
      return [new LayerGroup({
        layers: [new LayerTitle({
          source: new OSMSource()
        })],
        isBaseLayer: true
      })]
    } else {
      return [new LayerGroup({
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
    let [layers, labelLayers, _layers, labelLayersConfig] = [[], [], [], []]
    if (layerConfig && Array.isArray(layerConfig) && layerConfig.length > 0) {
      layerConfig.forEach(config => {
        if (config['layerName'] && config['layerUrl'] && config['layerType']) {
          let layer = null
          switch (config['layerType']) {
            case 'TileXYZ':
              layer = this._getXYZLayer(config)
              break
            case 'TitleWMTS':
              layer = this._getWMTSLayer(config)
              break
            case 'OSM':
              layer = this._getOSMLayer(config)
              break
            case 'ImageWMS':
              layer = this._getImageWMSLayer(config)
              break
            case 'TileWMS':
              layer = this._getTileWMSLayer(config)
              break
            case 'MapboxVectorTile':
              layer = this._getMapboxVectorTileLayer(config)
              break
            case 'TileArcGISRest':
              layer = this._getTileArcGISRestLayer(config)
              break
          }
          if (layer) layers.push(layer)
          if (config['label']) {
            labelLayersConfig.push(config['label'])
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
      });
      [...(_labelLayersLayerNames)].forEach(layerName => {
        labelLayersConfig.every(configM => {
          if (configM && configM['layerName'] === layerName) {
            let labelLayer = null
            switch (configM['layerType']) {
              case 'TileXYZ':
                labelLayer = this._getXYZLayer(configM)
                break
              case 'OSM':
                labelLayer = this._getOSMLayer(configM)
                break
              case 'TitleWMTS':
                labelLayer = this._getWMTSLayer(configM)
                break
              case 'ImageWMS':
                labelLayer = this._getImageWMSLayer(configM)
                break
              case 'TileWMS':
                labelLayer = this._getTileWMSLayer(configM)
                break
              case 'MapboxVectorTile':
                labelLayer = this._getMapboxVectorTileLayer(configM)
                break
              case 'TileArcGISRest':
                labelLayer = this._getTileArcGISRestLayer(configM)
                break
            }
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
   * 获取标准XYZ图层
   * @param config
   * @returns {ol.layer.Tile}
   * @private
   */
  _getXYZLayer (config) {
    try {
      let layerName = config['layerName'] ? config.layerName : ''
      config['addLayer'] = false
      config['create'] = true
      if (!config.hasOwnProperty('tileGrid')) {
        config['tileGrid'] = {}
        config['tileGrid']['tileSize'] = this.tileSize
        config['tileGrid']['origin'] = this.origin
        config['tileGrid']['extent'] = this.fullExtent
        config['tileGrid']['resolutions'] = this.resolutions
      }
      let baseLayer = this.createXYZLayer(layerName, config)
      if (baseLayer && baseLayer instanceof LayerTitle) {
        baseLayer.set('isDefault', ((config['isDefault'] === true) ? config['isDefault'] : false))
        baseLayer.set('isBaseLayer', true)
        baseLayer.set('alias', (config['alias'] ? config['alias'] : ''))
        baseLayer.getSource().setAttributions(this._getAttribution(config['attribution']))
      }
      return baseLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 加载开源OSM图层
   * @param config
   * @returns {ol.layer.Tile}
   * @private
   */
  _getOSMLayer (config) {
    try {
      let layerName = config['layerName'] ? config.layerName : ''
      config['addLayer'] = false
      config['create'] = true
      let baseLayer = this.createOSMLayer(layerName, config)
      if (baseLayer && baseLayer instanceof LayerTitle) {
        baseLayer.set('isDefault', ((config['isDefault'] === true) ? config['isDefault'] : false))
        baseLayer.set('isBaseLayer', true)
        baseLayer.set('alias', (config['alias'] ? config['alias'] : ''))
        baseLayer.getSource().setAttributions(this._getAttribution(config['attribution']))
      }
      return baseLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取标准WMTS图层
   * @param config
   * @returns {ol.layer.Tile}
   * @private
   */
  _getWMTSLayer (config) {
    try {
      let layerName = config['layerName'] ? config.layerName : ''
      config['addLayer'] = false
      config['create'] = true
      let baseLayer = this.createWMTSLayer(layerName, config)
      if (baseLayer && baseLayer instanceof LayerTitle) {
        baseLayer.set('isDefault', ((config['isDefault'] === true) ? config['isDefault'] : false))
        baseLayer.set('isBaseLayer', true)
        baseLayer.set('alias', (config['alias'] ? config['alias'] : ''))
        baseLayer.getSource().setAttributions(this._getAttribution(config['attribution']))
      }
      return baseLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * Images WMS 方式加载
   * @param config
   * @private
   */
  _getImageWMSLayer (config) {
    try {
      let layerName = config['layerName'] ? config.layerName : ''
      config['addLayer'] = false
      config['create'] = true
      let layer = this.createImageWMSLayer(layerName, config)
      if (layer && layer instanceof LayerImage) {
        layer.set('isDefault', ((config['isDefault'] === true) ? config['isDefault'] : false))
        layer.set('isBaseLayer', true)
        layer.set('alias', (config['alias'] ? config['alias'] : ''))
        layer.getSource().setAttributions(this._getAttribution(config['attribution']))
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * Title WMS 方式加载
   * @param config
   * @returns {ol.layer.Tile}
   * @private
   */
  _getTileWMSLayer (config) {
    try {
      let layerName = config['layerName'] ? config.layerName : ''
      config['addLayer'] = false
      config['create'] = true
      let layer = this.createTileWMSLayer(layerName, config)
      if (layer && layer instanceof LayerTitle) {
        layer.set('isDefault', ((config['isDefault'] === true) ? config['isDefault'] : false))
        layer.set('isBaseLayer', true)
        layer.set('alias', (config['alias'] ? config['alias'] : ''))
        layer.getSource().setAttributions(this._getAttribution(config['attribution']))
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 添加MapBox的矢量图层
   * @param config
   * @returns {*}
   * @private
   */
  _getMapboxVectorTileLayer (config) {
    try {
      let layerName = config['layerName'] ? config.layerName : ''
      config['addLayer'] = false
      config['create'] = true
      let layer = this.createMapboxVectorTileLayer(layerName, config)
      if (layer && layer instanceof VectorTile) {
        layer.set('isDefault', ((config['isDefault'] === true) ? config['isDefault'] : false))
        layer.set('isBaseLayer', true)
        layer.set('alias', (config['alias'] ? config['alias'] : ''))
        layer.getSource().setAttributions(this._getAttribution(config['attribution']))
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建arcgis矢量渲染图层
   * @param config
   * @returns {*}
   * @private
   */
  _getTileArcGISRestLayer (config) {
    try {
      let layerName = config['layerName'] ? config.layerName : ''
      config['addLayer'] = false
      config['create'] = true
      let layer = this.createTitleLayer(layerName, config)
      if (layer && layer instanceof VectorTile) {
        layer.set('isDefault', ((config['isDefault'] === true) ? config['isDefault'] : false))
        layer.set('isBaseLayer', true)
        layer.set('alias', (config['alias'] ? config['alias'] : ''))
        layer.getSource().setAttributions(this._getAttribution(config['attribution']))
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取版权信息
   * @returns {Xr.Attribution|Jr.Attribution|Wr.Attribution|*|ol.Attribution|ol.control.Attribution}
   * @private
   */
  _getAttribution (params) {
    try {
      let attribution = null
      if (params && typeof params !== 'object') {
        params = {}
        params['url'] = 'https://aurorafe.github.io'
        params['messages'] = 'contributors.'
        params['title'] = 'HMap'
        attribution = new Attribution({
          html: '&copy; ' + '<a href="' + params['url'] + '">' + params['title'] + '</a> ' + params['messages']
        })
      } else if (typeof params === 'object') {
        attribution = new Attribution({
          html: '&copy; ' + '<a href="' + params['url'] + '">' + params['title'] + '</a> ' + params['messages']
        })
      } else {
        attribution = undefined
      }
      return attribution
    } catch (e) {
      console.log(e)
      return undefined
    }
  }
}
export default BaseLayers
