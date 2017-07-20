import { ol } from '../constants'
class View {
  _addView (params) {
    let option = params || {}
    return new ol.View({
      center: ((option['center'] && Array.isArray(option['center'])) ? option['center'] : [0, 0]),
      zoom: ((option['zoom'] && (typeof option['zoom'] === 'number')) ? option['zoom'] : 0),
      minZoom: ((option['minZoom'] && (typeof option['minZoom'] === 'number')) ? option['minZoom'] : undefined),
      maxZoom: ((option['maxZoom'] && (typeof option['maxZoom'] === 'number')) ? option['maxZoom'] : undefined),
      zoomFactor: ((option['zoomFactor'] && (typeof option['zoomFactor'] === 'number')) ? option['zoomFactor'] : 2),
      rotation: ((option['rotation'] && (typeof option['rotation'] === 'number')) ? option['rotation'] : 0),
      enableRotation: (option['enableRotation'] === false ? option['enableRotation'] : true),
      projection: (option['projection'] ? option['projection'] : 'EPSG:3857'),
      extent: ((option['extent'] && Array.isArray(option['extent']) && option['extent'].length === 4) ? option['extent'] : undefined),
      resolutions: ((option['resolutions'] && Array.isArray(option['resolutions']) && option['resolutions'].length > 0) ? option['resolutions'] : undefined)
    })
  }

  /**
   * 获取当前地图尺寸
   */
  getSize () {
    if (this.map && this.map instanceof ol.Map) {
      return (this.map.getSize())
    } else {
      console.log('未获取到视图！')
    }
  }

  /**
   * 获取当前视图范围
   * @param size
   * @returns {ol.Extent|*}
   */
  getExtent (size) {
    if (size) {
      return (this.view.calculateExtent(size))
    } else {
      return (this.view.calculateExtent(this.map.getSize()))
    }
  }

  /**
   * 获取当前地图的范围
   * @returns {ol.Extent}
   */
  getMapCurrentExtent () {
    if (this.map) {
      return this.view.calculateExtent(this.map.getSize())
    }
  }

  /**
   * 缩放到全图
   */
  zoomMaxExtent (zoom) {
    let view = this.map.getView()
    zoom = (typeof zoom === 'number') ? zoom : 2
    if (this.map && view) {
      let center = view.getCenter()
      if (center) {
        this.view.setCenter(center)
        this.view.setZoom(zoom)
      }
    }
  }

  /**
   * 判断点是否在视图内，如果不在地图将自动平移
   * @param coord
   */
  movePointToView (coord) {
    if (this.map) {
      let extent = this.getMapCurrentExtent()
      if (!(ol.extent.containsXY(extent, coord[0], coord[1]))) {
        this.view.setCenter(coord)
      }
    }
  }

  /**
   * 调整图层
   * @constructor
   */
  orderLayerZindex () {
    let layerindex = 10
    if (this.map) {
      let pointLayers = [...(this.pointLayers)]
      let lineLayers = [...(this.lineLayers)]
      let polygonLayers = [...(this.polygonLayers)]
      polygonLayers.forEach(layerName => {
        if (layerName) {
          let layer = this.getLayerByLayerName(layerName)
          if (layer) {
            layer.setZIndex(layerindex++)
          }
        }
      })
      lineLayers.forEach(layerName => {
        if (layerName) {
          let layer = this.getLayerByLayerName(layerName)
          if (layer) {
            layer.setZIndex(layerindex++)
          }
        }
      })
      pointLayers.forEach(layerName => {
        if (layerName) {
          let layer = this.getLayerByLayerName(layerName)
          if (layer) {
            layer.setZIndex(layerindex++)
          }
        }
      })
    }
  }
}

export default View
