import ol from 'openlayers'

/**
 * 获取所有图层（内部处理）
 * @param layers
 * @returns {Array}
 */
const getAllLayersInternal = function (layers) {
  let _target = []
  if (layers.length > 0) {
    layers.forEach(layer => {
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray()
        let _layer = getAllLayersInternal(layers)
        if (_layer) {
          _target = _target.concat(_layer)
        }
      } else {
        _target.push(layer)
      }
    })
  }
  return _target
}

/**
 * 获取所有图层（将图层组里面的图层解析出来）
 * @returns {Array}
 */
const getAllLayers = function (map) {
  let targetLayers = []
  if (map) {
    const layers = map.getLayers().getArray()
    targetLayers = getAllLayersInternal(layers)
  }
  return targetLayers
}

/**
 * 通过layerName获取图层
 * @param map
 * @param layerName
 * @returns {*}
 */
const getLayerByLayerName = function (map, layerName) {
  let targetLayer = null
  if (map) {
    const layers = map.getLayers().getArray()
    targetLayer = getLayerInternal(layers, 'layerName', layerName)
  }
  return targetLayer
}

/**
 * 内部处理获取图层方法
 * @param layers
 * @param key
 * @param value
 * @returns {*}
 */
const getLayerInternal = function (layers, key, value) {
  let _target = null
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray()
        _target = getLayerInternal(layers, key, value)
        if (_target) {
          return false
        } else {
          return true
        }
      } else if (layer.get(key) === value) {
        _target = layer
        return false
      } else {
        return true
      }
    })
  }
  return _target
}

/**
 * 根据相关键值键名获取图层集合
 * @param layers
 * @param key
 * @param value
 * @returns {Array}
 */
const getLayersArrayInternal = function (layers, key, value) {
  let _target = []
  if (layers.length > 0) {
    layers.forEach(layer => {
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray()
        let _layer = getLayersArrayInternal(layers, key, value)
        if (_layer) {
          _target = _target.concat(_layer)
        }
      } else if (layer.get(key) === value) {
        _target.push(layer)
      }
    })
  }
  return _target
}

/**
 * 通过键名键值获取图层（注意键名键值必须是set(key, value)）
 * @param map
 * @param key
 * @param value
 */
const getLayerByKeyValue = function (map, key, value) {
  let targetLayer = null
  if (map) {
    const layers = map.getLayers().getArray()
    targetLayer = getLayerInternal(layers, key, value)
  }
  return targetLayer
}

/**
 * 通过键名键值获取图层集合（注意键名键值必须是set(key, value)）
 * @param map
 * @param key
 * @param value
 */
const getLayersArrayByKeyValue = function (map, key, value) {
  let targetLayers = []
  if (map) {
    let layers = map.getLayers().getArray()
    targetLayers = getLayersArrayInternal(layers, key, value)
  }
  return targetLayers
}

/**
 * 通过要素获取图层
 * @param map
 * @param feature
 * @returns {*}
 */
const getLayerByFeature = function (map, feature) {
  let targetLayer
  if (map && feature instanceof ol.Feature) {
    const layers = map.getLayers().getArray()
    targetLayer = _getLayerByFeatureInternal(layers, feature)
  }
  return targetLayer
}

/**
 * 处理要素获取图层方法
 * @param layers
 * @param feature
 * @returns {*}
 * @private
 */
const _getLayerByFeatureInternal = function (layers, feature) {
  let _target
  layers.every(layer => {
    if (layer && layer instanceof ol.layer.Vector && layer.getSource) {
      let source = layer.getSource()
      if (source.getFeatures) {
        let features = source.getFeatures()
        features.every(feat => {
          if (feat === feature) {
            _target = layer
            return false
          } else {
            return true
          }
        })
      }
      return false
    } else if (layer instanceof ol.layer.Group) {
      let layers = layer.getLayers().getArray()
      _target = _getLayerByFeatureInternal(layers, feature)
      if (_target) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  })
  return _target
}

/**
 * 创建临时图层
 * @param map
 * @param layerName
 * @param params
 * @returns {*}
 */
const createVectorLayer = function (map, layerName, params) {
  if (map) {
    let vectorLayer = getLayerByLayerName(map, layerName)
    if (!(vectorLayer instanceof ol.layer.Vector)) {
      vectorLayer = null
    }
    if (!vectorLayer) {
      if (params && params.create) {
        vectorLayer = new ol.layer.Vector({
          layerName: layerName,
          params: params,
          layerType: 'vector',
          source: new ol.source.Vector({
            wrapX: false
          }),
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(67, 110, 238, 0.4)'
            }),
            stroke: new ol.style.Stroke({
              color: '#4781d9',
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({
                color: '#ffcc33'
              })
            })
          }),
          zIndex: params['zIndex']
        })
      }
    }
    if (map && vectorLayer) {
      if (params && params.hasOwnProperty('selectable')) {
        vectorLayer.set('selectable', params.selectable)
      }
      // 图层只添加一次
      let _vectorLayer = getLayerByLayerName(map, layerName)
      if (!_vectorLayer || !(_vectorLayer instanceof ol.layer.Vector)) {
        map.addLayer(vectorLayer)
      }
    }
    return vectorLayer
  }
}

export {
  getAllLayers,
  getLayerByFeature,
  getLayerByLayerName,
  getLayerInternal,
  getLayersArrayInternal,
  getLayerByKeyValue,
  getLayersArrayByKeyValue,
  createVectorLayer
}
