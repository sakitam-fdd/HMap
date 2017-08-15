import mix from '../utils/mixin'
import View_ from 'ol/view'
import VectorTile_ from 'ol/vectortile'
import LayerGroup from 'ol/layer/group'
import LayerTitle from 'ol/layer/tile'
import VectorTile from 'ol/layer/vectortile'
import LayerImage from 'ol/layer/image'
import LayerHeatmap from 'ol/layer/heatmap'
import LayerVector from 'ol/layer/vector'
import Feature_ from 'ol/feature'
import VectorSource from 'ol/source/vector'
import TileArcGISRestSource from 'ol/source/tilearcgisrest'
import ImageWMSSource from 'ol/source/imagewms'
import TileWMSSource from 'ol/source/tilewms'
import WMTSSource from 'ol/source/wmts'
import ImageStaticSource from 'ol/source/imagestatic'
import XYZSource from 'ol/source/xyz'
import OSMSource from 'ol/source/osm'
import RasterSource from 'ol/source/raster'
import ImageMapGuideSource from 'ol/source/imagemapguide'
import ImageCanvasSource from 'ol/source/imagecanvas'
import ImageArcGISRestSource from 'ol/source/imagearcgisrest'
import WMTSTileGrid from 'ol/tilegrid/wmts'
import TileGrid from 'ol/tilegrid'
import TileGridGrid from 'ol/tilegrid/tilegrid'
import Styles from 'ol/style/style'
import FillStyle from 'ol/style/fill'
import StrokeStyle from 'ol/style/stroke'
import CircleStyle from 'ol/style/circle'
import GeoJSONFormat from 'ol/format/geojson'
import MVTFormat from 'ol/format/mvt'
import EsriJSONFormat from 'ol/format/esrijson'
import TopoJSONFormat from 'ol/format/topojson'
import IGCFormat from 'ol/format/igc'
import PolylineFormat from 'ol/format/polyline'
import WKTFormat from 'ol/format/wkt'
import GMLBaseFormat from 'ol/format/gmlbase'
import GPXFormat from 'ol/format/gpx'
import KMLFormat from 'ol/format/kml'
import OSMXMLFormat from 'ol/format/osmxml'
import WFSFormat from 'ol/format/wfs'
import WMSGetFeatureInfoFormat from 'ol/format/wmsgetfeatureinfo'
import Loadingstrategy from 'ol/loadingstrategy'
import Proj from 'ol/proj'
import ProjProjection from 'ol/proj/projection'
import Extent_ from 'ol/extent'
import * as MapboxStyle from '../style/MapboxStyle'
import Style from '../style/Style'
class Layer extends mix(Style) {
  constructor (map) {
    super()
    this.map = map || null
    if (!this.map) {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 通过layerName获取图层
   * @param layerName
   * @returns {*}
   */
  getLayerByLayerName (layerName) {
    try {
      let targetLayer = null
      if (this.map) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer.get('layerName') === layerName) {
            targetLayer = layer
            return false
          } else {
            return true
          }
        })
      }
      return targetLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 通过layerName获取专题图层
   * @param layerName
   * @returns {*}
   */
  getTitleLayerByLayerName (layerName) {
    try {
      let targetLayer = null
      if (this.map) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer.get('layerType') === 'title' && layer.get('layerName') === layerName) {
            targetLayer = layer
            return false
          } else {
            return true
          }
        })
      }
      return targetLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 根据图层名获取底图
   * @param layerName
   * @returns {*}
   */
  getBaseLayerByLayerName (layerName) {
    try {
      let currentLayer = null
      this.map.getLayers().getArray().forEach(layer => {
        if (layer && layer instanceof LayerGroup && layer.get('isBaseLayer')) {
          layer.getLayers().getArray().forEach(_layer => {
            if (_layer && _layer instanceof LayerTitle && _layer.get('isBaseLayer') && _layer.get('layerName') === layerName) {
              currentLayer = _layer
            }
          })
        }
      })
      return currentLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取底图图层组
   * @returns {*}
   */
  getBaseLayers () {
    try {
      let currentLayer = null
      this.map.getLayers().getArray().forEach(layer => {
        if (layer && layer instanceof LayerGroup && layer.get('isBaseLayer')) {
          currentLayer = layer
        }
      })
      return currentLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 通过要素获取图层
   * @param feature
   * @returns {*}
   */
  getLayerByFeatuer (feature) {
    let tragetLayer = null
    if (this.map) {
      if (feature instanceof Feature_) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer && layer instanceof LayerVector && layer.getSource) {
            let source = layer.getSource()
            if (source.getFeatures) {
              let features = source.getFeatures()
              features.every(feat => {
                if (feat === feature) {
                  tragetLayer = layer
                  return false
                } else {
                  return true
                }
              })
            }
            return false
          } else {
            return true
          }
        })
      } else {
        throw new Error('传入的不是要素!')
      }
    }
    return tragetLayer
  }

  /**
   * 创建临时图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createVectorLayer (layerName, params) {
    try {
      if (this.map) {
        let vectorLayer = this.getLayerByLayerName(layerName)
        if (!(vectorLayer instanceof LayerVector)) {
          vectorLayer = null
        }
        if (!vectorLayer) {
          if (params && params.create) {
            vectorLayer = new LayerVector({
              layerName: layerName,
              params: params,
              layerType: 'vector',
              source: new VectorSource({
                wrapX: false
              }),
              style: new Styles({
                fill: new FillStyle({
                  color: 'rgba(67, 110, 238, 0.4)'
                }),
                stroke: new StrokeStyle({
                  color: '#4781d9',
                  width: 2
                }),
                image: new CircleStyle({
                  radius: 7,
                  fill: new FillStyle({
                    color: '#ffcc33'
                  })
                })
              })
            })
          }
        }
        if (this.map && vectorLayer) {
          if (params && params.hasOwnProperty('selectable')) {
            vectorLayer.set('selectable', params.selectable)
          }
          // 图层只添加一次
          let _vectorLayer = this.getLayerByLayerName(layerName)
          if (!_vectorLayer || !(_vectorLayer instanceof LayerVector)) {
            this.map.addLayer(vectorLayer)
          }
        }
        return vectorLayer
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建热力图图层
   * @param layerName
   * @param params
   * @returns {string}
   */
  createHeatMapLayer (layerName, params) {
    try {
      let currentLayer = null
      if (this.map) {
        currentLayer = this.getLayerByLayerName(layerName)
        if (!(currentLayer instanceof LayerHeatmap)) {
          currentLayer = null
        } else if ((currentLayer instanceof LayerHeatmap) && !(params['addLayer'] === false)) {
          this.map.removeLayer(currentLayer)
          currentLayer = null
        }
        if (!currentLayer && params && params['create']) {
          currentLayer = new LayerHeatmap({
            layerName: layerName,
            gradient: (params['gradient'] ? params['gradient'] : ['#00f', '#0ff', '#0f0', '#ff0', '#f00']),
            source: new VectorSource({
              wrapX: false,
              crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined)
            }),
            blur: (params['blur'] ? params['blur'] : 15),
            radius: (params['radius'] ? params['radius'] : 8),
            shadow: (params['shadow'] ? params['shadow'] : 250),
            weight: (params['weight'] ? params['weight'] : 'weight'),
            extent: (params['extent'] ? params['extent'] : undefined),
            minResolution: (params['minResolution'] ? params['minResolution'] : undefined),
            maxResolution: (params['maxResolution'] ? params['maxResolution'] : undefined),
            opacity: (params['opacity'] ? params['opacity'] : 1),
            visible: ((params['visible'] === false) ? params['visible'] : true)
          })
          if (params && params.hasOwnProperty('selectable')) {
            currentLayer.set('selectable', params.selectable)
          }
        }
        if (currentLayer && !(params['addLayer'] === false)) {
          this.map.addLayer(currentLayer)
        }
        return currentLayer
      } else {
        throw new Error('未创建地图对象！')
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 创建专题图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createTitleLayer (layerName, params) {
    try {
      let serviceUrl = params['layerUrl']
      if (!serviceUrl) return null
      let ooLayer = this.getTitleLayerByLayerName(layerName)
      if (ooLayer && ooLayer instanceof LayerTitle && !(params['addLayer'] === false)) {
        this.map.removeLayer(ooLayer)
        ooLayer = null
      }
      if (!ooLayer && params['create']) {
        ooLayer = new LayerTitle({
          layerName: layerName,
          layerType: ((params['notShowLayerType'] === true) ? '' : 'title'),
          visible: (params['visible'] === false) ? params['visible'] : true,
          source: new TileArcGISRestSource({
            url: serviceUrl,
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            params: (params['layerParams'] ? params['layerParams'] : undefined),
            wrapX: false
          }),
          wrapX: false
        })
      }
      if (this.map && ooLayer && !(params['addLayer'] === false)) {
        this.map.addLayer(ooLayer)
      }
      return ooLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建ImageWMSLayer
   * @param layerName
   * @param params
   * @returns {string}
   */
  createImageWMSLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof LayerImage)) {
        layer = null
      } else if ((layer instanceof LayerImage) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        layer = new LayerImage({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: (params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1,
          source: new ImageWMSSource({
            url: params['layerUrl'],
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            params: {
              LAYERS: params['layers'], // require
              STYLES: params['style'] ? params['style'] : '',
              VERSION: params['version'] ? params['version'] : '1.3.0',
              WIDTH: params['width'] ? params['width'] : 256,
              HEIGHT: params['height'] ? params['height'] : 256,
              BBOX: params['bbox'], // require
              SRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              CRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              REQUEST: 'GetMap',
              TRANSPARENT: true,
              TILED: (params['tiled'] === false) ? params['tiled'] : true,
              TILESORIGIN: (params['tiledsorrigin'] ? params['tiledsorrigin'] : undefined),
              SERVICE: 'WMS',
              FORMAT: (params['format'] ? params['format'] : 'image/png'),
              VIEWPARAMS: (params['viewparams'] ? params['viewparams'] : '')
            },
            wrapX: false
          })
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建TileWMSLayer
   * @param layerName
   * @param params
   * @returns {string}
   */
  createTileWMSLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof LayerImage)) {
        layer = null
      } else if ((layer instanceof LayerTitle) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        layer = new LayerTitle({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: (params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1,
          source: new TileWMSSource({
            url: params['layerUrl'],
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            params: {
              LAYERS: params['layers'], // require
              STYLES: params['style'] ? params['style'] : '',
              VERSION: params['version'] ? params['version'] : '1.3.0',
              WIDTH: params['width'] ? params['width'] : 256,
              HEIGHT: params['height'] ? params['height'] : 256,
              BBOX: params['bbox'], // require
              SRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              CRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              REQUEST: 'GetMap',
              TRANSPARENT: true,
              TILED: ((params['tiled'] === false) ? params['tiled'] : true),
              TILESORIGIN: (params['tiledsorrigin'] ? params['tiledsorrigin'] : undefined),
              SERVICE: 'WMS',
              FORMAT: (params['format'] ? params['format'] : 'image/png'),
              VIEWPARAMS: (params['viewparams'] ? params['viewparams'] : '')
            },
            wrapX: false
          })
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建WFS图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createWfsVectorLayer (layerName, params) {
    try {
      let vectorLayer = this.getLayerByLayerName(layerName)
      if (!(vectorLayer instanceof LayerVector)) {
        vectorLayer = null
      }
      if (!vectorLayer) {
        let proj = params['projection'] ? params['projection'] : 'EPSG:3857'
        let style = this.getStyleByParams(params['style'])
        vectorLayer = new LayerVector({
          layerName: layerName,
          params: params,
          layerType: 'vector',
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new VectorSource({
            format: new GeoJSONFormat(),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            url: function (extent) {
              return params['layerUrl'] + extent.join(',') + ',' + proj
            },
            wrapX: false,
            strategy: Loadingstrategy.bbox
          }),
          style: style
        })
      }
      if (this.map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable)
        }
        // 图层只添加一次
        let _vectorLayer = this.getLayerByLayerName(layerName)
        if (!_vectorLayer || !(_vectorLayer instanceof LayerVector)) {
          if (!(params['addLayer'] === false)) {
            this.map.addLayer(vectorLayer)
          }
        }
      }
      return vectorLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建矢量要素图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createVectorFeatureLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof LayerVector)) {
        layer = null
      } else if (this.map && (layer instanceof LayerVector) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        let style = this.getStyleByParams(params['style'])
        layer = new LayerVector({
          layerName: layerName,
          params: params,
          layerType: 'vector',
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new VectorSource({
            format: new GeoJSONFormat(),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            url: params['layerUrl'],
            wrapX: false,
            strategy: Loadingstrategy.bbox
          }),
          style: style
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建WMTS图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createWMTSLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof LayerTitle)) {
        layer = null
      } else if (this.map && (layer instanceof LayerTitle) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create'] && params['levels']) {
        let projection = Proj.get((params['projection'] ? params['projection'] : 'EPSG:3857'))
        let projectionExtent = (params['extent'] ? params['extent'] : projection.getExtent())
        let size = Extent_.getWidth(projectionExtent) / 256
        let levels = params['levels']
        let resolutions = new Array(levels)
        let matrixIds = new Array(levels)
        for (let z = 0; z < levels; ++z) {
          // generate resolutions and matrixIds arrays for this WMTS
          resolutions[z] = size / Math.pow(2, z)
          matrixIds[z] = z
        }
        layer = new LayerTitle({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new WMTSSource({
            url: params['layerUrl'],
            layer: (params['layer'] ? params['layer'] : '0'),
            matrixSet: (params['matrixSet'] ? params['matrixSet'] : 'EPSG:3857'),
            format: (params['format'] ? params['format'] : 'image/png'),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            projection: projection,
            tileGrid: new WMTSTileGrid({
              origin: Extent_.getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds,
              version: (params['version'] ? params['version'] : '1.0.0'),
              dimensions: (params['dimensions'] ? params['dimensions'] : undefined)
            }),
            style: (params['style'] ? params['style'] : 'default'),
            wrapX: false
          })
        })
      } else {
        throw new Error('传入参数不正确！')
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建XYZ图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createXYZLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof LayerTitle)) {
        layer = null
      } else if (this.map && (layer instanceof LayerTitle) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        let tileGrid = null
        let tileSize = 256
        if (params['tileSize'] && typeof params['tileSize'] === 'number') {
          tileSize = params['tileSize']
        } else if (params['tileGrid'] && params['tileGrid']['tileSize'] && typeof params['tileGrid']['tileSize'] === 'number') {
          tileSize = params['tileGrid']['tileSize']
        }
        let projection = 'EPSG:3857'
        if (params['projection']) {
          projection = params['projection']
        } else if (this.view && this.view instanceof View_) {
          projection = this.view.getProjection().getCode()
        }
        if (params['tileGrid'] && params['tileGrid']['resolutions']) {
          tileGrid = new TileGridGrid({
            tileSize: tileSize,
            origin: (params['tileGrid']['origin'] ? params['tileGrid']['origin'] : undefined),
            extent: (params['tileGrid']['extent'] ? params['tileGrid']['extent'] : undefined),
            resolutions: params['tileGrid']['resolutions'],
            minZoom: ((params['tileGrid']['minZoom'] && typeof params['tileGrid']['minZoom'] === 'number') ? params['tileGrid']['minZoom'] : 0)
          })
        }
        layer = new LayerTitle({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new XYZSource({
            wrapX: false,
            tileGrid: (tileGrid !== null ? tileGrid : undefined),
            tileSize: tileSize,
            opaque: (params['opaque'] === true) ? params['opaque'] : false, // 图层是否不透明（主题相关）
            tilePixelRatio: (params['tilePixelRatio'] ? params['tilePixelRatio'] : 1), // todo 对于高分辨率设备，例如苹果等可能2、3（移动端开发需要注意）
            projection: projection,
            maxZoom: (params['maxZoom'] ? params['maxZoom'] : 18),
            minZoom: (params['minZoom'] ? params['minZoom'] : 0),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            tileUrlFunction: function (tileCoord) {
              let url = (params['layerUrl']).replace('{z}',
                (tileCoord[0]).toString()).replace('{x}',
                tileCoord[1].toString()).replace('{y}',
                (-tileCoord[2] - 1).toString())
              return url
            }
          })
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建OSM图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createOSMLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof LayerTitle)) {
        layer = null
      } else if (this.map && (layer instanceof LayerTitle) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params['create']) {
        layer = new LayerTitle({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new OSMSource({
            wrapX: false,
            opaque: (params['opaque'] === false) ? params['opaque'] : true, // 图层是否不透明（主题相关）
            url: params['layerUrl'] ? params['layerUrl'] : 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined)
          })
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建Mapbox矢量图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createMapboxVectorTileLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof VectorTile)) {
        layer = null
      } else if (this.map && (layer instanceof VectorTile) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        let tileGrid = null
        let tileSize = 256
        if (params['tileSize'] && typeof params['tileSize'] === 'number') {
          tileSize = params['tileSize']
        } else if (params['tileGrid'] && params['tileGrid']['tileSize'] && typeof params['tileGrid']['tileSize'] === 'number') {
          tileSize = params['tileGrid']['tileSize']
        }
        let projection = 'EPSG:3857'
        if (params['projection']) {
          projection = params['projection']
        } else if (this.view && this.view instanceof View_) {
          projection = this.view.getProjection().getCode()
        }
        if (params['tileGrid']) {
          /* eslint new-cap: ["error", { "newIsCap": false }] */
          tileGrid = new TileGrid.createXYZ({
            tileSize: tileSize,
            extent: (params['tileGrid']['extent'] ? params['tileGrid']['extent'] : undefined),
            minZoom: ((params['tileGrid']['minZoom'] && typeof params['tileGrid']['minZoom'] === 'number') ? params['tileGrid']['minZoom'] : 0),
            maxZoom: ((params['tileGrid']['maxZoom'] && typeof params['tileGrid']['maxZoom'] === 'number') ? params['tileGrid']['maxZoom'] : 22)
          })
        }
        layer = new VectorTile({
          visible: (params['visible'] === false) ? params['visible'] : true,
          renderBuffer: ((params['renderBuffer'] && (typeof params['renderBuffer'] === 'number')) ? params['renderBuffer'] : 100),
          renderMode: (params['renderMode'] ? params['renderMode'] : 'hybrid'), // 渲染方式image，hybrid，vector，性能由高到低
          extent: (params['extent'] ? params['extent'] : undefined),
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          minResolution: ((params['minResolution'] && typeof params['minResolution'] === 'number') ? params['minResolution'] : undefined),
          maxResolution: ((params['maxResolution'] && typeof params['maxResolution'] === 'number') ? params['maxResolution'] : undefined),
          preload: ((params['preload'] && typeof params['preload'] === 'number') ? params['preload'] : 0),
          source: new VectorSource({
            format: new MVTFormat(),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            projection: projection,
            overlaps: (params['overlaps'] ? params['overlaps'] : true),
            tileGrid: ((tileGrid && tileGrid instanceof TileGrid) ? tileGrid : undefined),
            tilePixelRatio: ((params['tilePixelRatio'] && typeof params['tilePixelRatio'] === 'number') ? params['tilePixelRatio'] : 1),
            url: params['layerUrl'],
            wrapX: false
          }),
          style: MapboxStyle.createMapboxStreetsV6Style()
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取矢量数据格式化类型
   * @param params
   * @returns {*}
   * @private
   */
  _getFormatType (params) {
    try {
      let type
      if (params['format']) {
        switch (params['format']) {
          case 'MVT':
            type = new MVTFormat()
            break
          case 'GeoJSON':
            type = new GeoJSONFormat()
            break
          case 'EsriJSON':
            type = new EsriJSONFormat()
            break
          case 'TopoJSON':
            type = new TopoJSONFormat()
            break
          case 'IGC':
            type = new IGCFormat()
            break
          case 'Polyline':
            type = new PolylineFormat()
            break
          case 'WKT':
            type = new WKTFormat()
            break
          case 'GMLBase':
            type = new GMLBaseFormat()
            break
          case 'GPX':
            type = new GPXFormat()
            break
          case 'KML':
            type = new KMLFormat()
            break
          case 'OSMXML':
            type = new OSMXMLFormat()
            break
          case 'WFS':
            type = new WFSFormat()
            break
          case 'WMSGetFeatureInfo':
            type = new WMSGetFeatureInfoFormat()
            break
        }
      }
      return type
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取切片规则
   * @param params
   * @returns {*}
   * @private
   */
  _getTileGrid (params) {
    try {
      let tileGrid
      if (params['tileGrid']) {
        let [tileSize, tileSizes] = [256]
        if (params['tileSize'] && typeof params['tileSize'] === 'number') {
          tileSize = params['tileSize']
        } else if (params['tileGrid'] && params['tileGrid']['tileSize'] && typeof params['tileGrid']['tileSize'] === 'number') {
          tileSize = params['tileGrid']['tileSize']
        }
        if (params['tileGrid']['tileSizes'] && params['tileGrid']['tileSizes'].length === params['tileGrid']['resolutions']) {
          tileSizes = params['tileGrid']['tileSizes']
        }
        if (params['tileGrid']['gridType'] === 'XYZ') {
          /* eslint new-cap: ["error", { "newIsCap": false }] */
          tileGrid = new TileGrid.createXYZ({
            tileSize: tileSize,
            extent: (params['tileGrid']['extent'] ? params['tileGrid']['extent'] : undefined),
            minZoom: ((params['tileGrid']['minZoom'] && typeof params['tileGrid']['minZoom'] === 'number') ? params['tileGrid']['minZoom'] : 0),
            maxZoom: ((params['tileGrid']['maxZoom'] && typeof params['tileGrid']['maxZoom'] === 'number') ? params['tileGrid']['maxZoom'] : 22)
          })
        } else if (params['tileGrid']['gridType'] === 'WMTS') {
          tileGrid = new WMTSTileGrid({
            sizes: ((params['tileGrid']['sizes'] && Array.isArray(params['tileGrid']['sizes'])) ? params['tileGrid']['sizes'] : undefined),
            widths: ((params['tileGrid']['widths'] && Array.isArray(params['tileGrid']['widths'])) ? params['tileGrid']['widths'] : undefined),
            tileSize: tileSize,
            tileSizes: tileSizes, //  If given, the array length should match the length of the resolutions array
            resolutions: params['tileGrid']['resolutions'],
            origin: (params['tileGrid']['origin'] ? params['tileGrid']['origin'] : undefined),
            origins: (params['tileGrid']['origins'] ? params['tileGrid']['origins'] : undefined),
            extent: (params['tileGrid']['extent'] ? params['tileGrid']['extent'] : undefined),
            minZoom: ((params['tileGrid']['minZoom'] && typeof params['tileGrid']['minZoom'] === 'number') ? params['tileGrid']['minZoom'] : 0),
            matrixIds: params['tileGrid']['matrixIds']
          })
        } else {
          tileGrid = new TileGridGrid({
            sizes: ((params['tileGrid']['sizes'] && Array.isArray(params['tileGrid']['sizes'])) ? params['tileGrid']['sizes'] : undefined),
            widths: ((params['tileGrid']['widths'] && Array.isArray(params['tileGrid']['widths'])) ? params['tileGrid']['widths'] : undefined),
            tileSize: tileSize,
            tileSizes: tileSizes, //  If given, the array length should match the length of the resolutions array
            resolutions: params['tileGrid']['resolutions'],
            matrixIds: params['tileGrid']['matrixIds'],
            origin: (params['origin'] ? params['origin'] : undefined),
            origins: (params['origins'] ? params['origins'] : undefined),
            extent: (params['tileGrid']['extent'] ? params['tileGrid']['extent'] : undefined),
            minZoom: ((params['tileGrid']['minZoom'] && typeof params['tileGrid']['minZoom'] === 'number') ? params['tileGrid']['minZoom'] : 0)
          })
        }
      }
      return tileGrid
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 创建矢量切片图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createVectorTileLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof VectorTile)) {
        layer = null
      } else if (this.map && (layer instanceof VectorTile) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && (params['layerUrl'] || params['layerUrls']) && params['create']) {
        let projection = 'EPSG:3857'
        if (params['projection']) {
          projection = params['projection']
        } else if (this.view && this.view instanceof View_) {
          projection = this.view.getProjection().getCode()
        }
        layer = new VectorTile({
          visible: (params['visible'] === false) ? params['visible'] : true,
          renderBuffer: ((params['renderBuffer'] && (typeof params['renderBuffer'] === 'number')) ? params['renderBuffer'] : 100),
          renderMode: (params['renderMode'] ? params['renderMode'] : 'hybrid'), // 渲染方式image，hybrid，vector，性能由高到低
          extent: (params['extent'] ? params['extent'] : undefined),
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          minResolution: ((params['minResolution'] && typeof params['minResolution'] === 'number') ? params['minResolution'] : undefined),
          maxResolution: ((params['maxResolution'] && typeof params['maxResolution'] === 'number') ? params['maxResolution'] : undefined),
          preload: ((params['preload'] && typeof params['preload'] === 'number') ? params['preload'] : 0),
          source: new VectorSource({
            format: this._getFormatType(params),
            cacheSize: ((params['cacheSize'] && typeof params['cacheSize'] === 'number') ? params['cacheSize'] : 128),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            projection: projection,
            state: (params['state'] ? params['state'] : undefined), // State of the source, one of 'undefined', 'loading', 'ready' or 'error'.
            overlaps: (params['overlaps'] ? params['overlaps'] : true),
            tileClass: ((params['tileClass'] && typeof params['tileClass'] === 'function') ? params['tileClass'] : VectorTile_),
            tileGrid: this._getTileGrid(params),
            tilePixelRatio: ((params['tilePixelRatio'] && typeof params['tilePixelRatio'] === 'number') ? params['tilePixelRatio'] : 1),
            url: (params['layerUrl'] ? params['layerUrl'] : undefined),
            urls: ((params['layerUrls'] && Array.isArray(params['layerUrls']) && params['layerUrls'].length > 0) ? params['layerUrls'] : undefined),
            tileUrlFunction: ((params['tileUrlFunction'] && typeof params['tileUrlFunction'] === 'function') ? params['tileUrlFunction'] : undefined),
            tileLoadFunction: ((params['tileLoadFunction'] && typeof params['tileLoadFunction'] === 'function') ? params['tileLoadFunction'] : undefined),
            wrapX: false
          }),
          style: (params['style'] ? params['style'] : undefined)
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建图片类型图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  createImageLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof LayerImage)) {
        layer = null
      } else if (this.map && (layer instanceof LayerImage) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        let source = this.getImagesSource(params)
        layer = new LayerImage({
          layerName: layerName,
          extent: (params['extent'] ? params['extent'] : undefined),
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: source
        })
      }
      if (this.map && layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取影像图层源
   * @param params
   * @returns {*}
   */
  getImagesSource (params) {
    let source = null
    let projection = new ProjProjection({
      code: (params['projection'] ? params['projection'] : 'EPSG:3857'),
      units: 'm',
      axisOrientation: 'neu'
    })
    switch (params['sourceType']) {
      case 'ImageStatic':
        source = new ImageStaticSource({
          crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
          imageExtent: params['imageExtent'],
          projection: projection,
          imageSize: (params['imageSize'] ? params['imageSize'] : undefined),
          url: params['layerUrl'],
          wrapX: false
        })
        break
      case 'ImageWMS':
        source = new ImageWMSSource({
          url: params['layerUrl'],
          crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
          params: {
            LAYERS: params['layers'], // require
            STYLES: params['style'] ? params['style'] : '',
            TYPE: params['type'] ? params['type'] : '',
            VERSION: params['version'] ? params['version'] : '1.3.0',
            WIDTH: params['width'] ? params['width'] : 256,
            HEIGHT: params['height'] ? params['height'] : 256,
            SRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
            CRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
            REQUEST: 'GetMap',
            TRANSPARENT: true,
            TILED: (params['tiled'] === false) ? params['tiled'] : true,
            TILESORIGIN: (params['tiledsorrigin'] ? params['tiledsorrigin'] : undefined),
            SERVICE: 'WMS',
            FORMAT: (params['format'] ? params['format'] : 'image/png'),
            VIEWPARAMS: (params['viewparams'] ? params['viewparams'] : '')
          },
          wrapX: false
        })
        break
      case 'Raster':
        source = new RasterSource()
        break
      case 'ImageMapGuide':
        source = new ImageMapGuideSource({
          url: params['layerUrl'],
          wrapX: false,
          displayDpi: ((params['displayDpi'] && (typeof params['displayDpi'] === 'number')) ? params['displayDpi'] : 96),
          metersPerUnit: ((params['metersPerUnit'] && (typeof params['metersPerUnit'] === 'number')) ? params['metersPerUnit'] : 1),
          hidpi: ((params['hidpi'] && (typeof params['hidpi'] === 'boolean')) ? params['hidpi'] : true),
          useOverlay: ((params['useOverlay'] && (typeof params['useOverlay'] === 'boolean')) ? params['useOverlay'] : undefined),
          projection: (params['projection'] ? params['projection'] : 'EPSG:3857'),
          ratio: ((params['ratio'] && (typeof params['ratio'] === 'number')) ? params['ratio'] : 1),
          resolutions: ((params['resolutions'] && Array.isArray(params['resolutions'])) ? params['resolutions'] : undefined),
          imageLoadFunction: ((params['imageLoadFunction'] && (typeof params['imageLoadFunction'] === 'function')) ? params['imageLoadFunction'] : undefined),
          params: ((params['params'] && (typeof params['params'] === 'object')) ? params['params'] : undefined)
        })
        break
      case 'ImageCanvas':
        source = new ImageCanvasSource({
          projection: (params['projection'] ? params['projection'] : 'EPSG:3857'),
          ratio: ((params['ratio'] && (typeof params['ratio'] === 'number')) ? params['ratio'] : 1),
          resolutions: ((params['resolutions'] && Array.isArray(params['resolutions'])) ? params['resolutions'] : undefined),
          canvasFunction: params['canvasFunction'],
          state: (params['state'] ? params['state'] : undefined),
          wrapX: false
        })
        break
      case 'ImageArcGISRest':
        source = new ImageArcGISRestSource({
          url: params['layerUrl'],
          hidpi: ((params['hidpi'] && (typeof params['hidpi'] === 'boolean')) ? params['hidpi'] : true),
          crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
          projection: (params['projection'] ? params['projection'] : 'EPSG:3857'),
          ratio: ((params['ratio'] && (typeof params['ratio'] === 'number')) ? params['ratio'] : 1),
          resolutions: ((params['resolutions'] && Array.isArray(params['resolutions'])) ? params['resolutions'] : undefined),
          imageLoadFunction: ((params['imageLoadFunction'] && (typeof params['imageLoadFunction'] === 'function')) ? params['imageLoadFunction'] : undefined),
          params: ((params['params'] && (typeof params['params'] === 'object')) ? params['params'] : undefined),
          wrapX: false
        })
        break
      default:
        console.log('sourceType类型未传！')
        return false
    }
    return source
  }

  /**
   * 移除图层
   * @param layerName
   */
  removeLayerByLayerName (layerName) {
    if (this.map) {
      let layer = this.getLayerByLayerName(layerName)
      if (layer && !layer.get('isBaseLayer')) {
        this.map.removeLayer(layer)
      }
    }
  }

  /**
   * 通过layerName移除专题图层
   * @param layerName
   */
  removeTileLayerByLayerName (layerName) {
    if (this.map) {
      let layer = this.getTitleLayerByLayerName(layerName)
      if (layer && layer instanceof LayerTitle) {
        this.map.removeLayer(layer)
      }
    }
  }

  /**
   * 移除所有图层（除底图）
   */
  removeAllLayer () {
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      layers.forEach(layer => {
        if (!layer.get('isBaseLayer')) {
          this.map.removeLayer(layer)
        }
      })
    }
  }

  /**
   * 调整当前要素范围
   * @param extent
   * @returns {*}
   */
  adjustExtent (extent) {
    if (this.map) {
      let width = Extent_.getWidth(extent)
      let adjust = 0.2
      if (width < 0.05) {
        let bleft = Extent_.getBottomLeft(extent) // 获取xmin,ymin
        let tright = Extent_.getTopRight(extent) // 获取xmax,ymax
        let xmin = bleft[0] - adjust
        let ymin = bleft[1] - adjust
        let xmax = tright[0] + adjust
        let ymax = tright[1] + adjust
        extent = Extent_.buffer([xmin, ymin, xmax, ymax], adjust)
      }
      return extent
    }
  }

  /**
   * 缩放到当前范围
   * @param extent
   * @param isanimation
   * @param duration
   */
  zoomToExtent (extent, isanimation, duration) {
    if (this.map) {
      let view = this.map.getView()
      let size = this.map.getSize()
      /**
       *  @type {ol.Coordinate} center The center of the view.
       */
      let center = Extent_.getCenter(extent)
      if (!isanimation) {
        view.fit(extent, size, {
          padding: [350, 200, 200, 350]
        })
        view.setCenter(center)
      } else {
        if (!duration) {
          duration = 800
          view.animate({
            center: center,
            duration: duration
          })
          view.fit(extent, {
            size: size,
            duration: duration
          })
        }
      }
    }
  }
}
export default Layer
