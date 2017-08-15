/**
 * Created by FDD on 2017/2/22.
 * @desc 要素相关处理
 */
import LayerVector from 'ol/layer/vector'
import Feature_ from 'ol/feature'
import Styles from 'ol/style/style'
import LayerHeatmap from 'ol/layer/heatmap'
import WKTFormat from 'ol/format/wkt'
import PolylineFormat from 'ol/format/polyline'
import GeoJSONFormat from 'ol/format/geojson'
import EsriJSONFormat from 'ol/format/esrijson'
import Geom from 'ol/geom/geometry'
import PointGeom from 'ol/geom/point'
import MultiPointGeom from 'ol/geom/multipoint'
import LineStringGeom from 'ol/geom/linestring'
import MultiLineStringGeom from 'ol/geom/multilinestring'
import PolygonGeom from 'ol/geom/polygon'
import MultiPolygonGeom from 'ol/geom/multipolygon'
import Extent_ from 'ol/extent'
import mix from '../utils/mixin'
import Style from '../style/Style'
import Layer from '../layer/Layer'

class Feature extends mix(Style, Layer) {
  constructor (map) {
    super()
    this.map = map
    if (!this.map) {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 通过id获取Feature
   * @param id
   * @returns {*}
   */
  getFeatureById (id) {
    let layers = this.map.getLayers()
    let feature = null
    layers.forEach(layer => {
      if (layer && layer instanceof LayerVector && layer.getSource() && layer.getSource().getFeatureById) {
        feature = layer.getSource().getFeatureById(id)
      }
    })
    return feature
  }

  /**
   * 通过id和layerName获取Feature
   * （若在当前layerName查不到，则查询全部图层）
   * @param id
   * @param layerName
   * @returns {*}
   */
  getFeatureById2LayerName (id, layerName) {
    let feature = null
    if (layerName) {
      let layer = this.getLayerByName(layerName)
      if (layer && layer instanceof LayerVector) {
        feature = layer.getSource().getFeatureById(id)
      }
    }
    if (!feature || !(feature instanceof Feature_)) {
      feature = this.getFeatureById(id)
    }
    return feature
  }

  /**
   * 从属性信息中获取空间信息
   * @param point
   * @returns {*}
   * @private
   */
  _getGeometryFromPoint (point) {
    let geometry = null
    if (point instanceof Geom) {
      geometry = point
    } else if (Array.isArray(point.geometry)) {
      geometry = new PointGeom(point.geometry)
    } else {
      geometry = new WKTFormat().readGeometry(point.geometry)
    }
    return geometry
  }

  /**
   * 获取当前范围
   * @param multiFeatures
   * @private
   */
  _getExtent (multiFeatures) {
    let extent = multiFeatures.getExtent()
    let bExtent = true
    extent.every(item => {
      if (item === Infinity || isNaN(item) || item === undefined || item === null) {
        bExtent = false
        return false
      } else {
        return true
      }
    })
    if (bExtent) {
      this.zoomToExtent(extent, true)
    }
    return extent
  }

  /**
   * 判断点是否在视图内，如果不在地图将自动平移
   * @param coordinate (当前点坐标)
   */
  movePointToView (coordinate) {
    if (this.map) {
      let extent = this.getMapCurrentExtent()
      if (!(Extent_.containsXY(extent, coordinate[0], coordinate[1]))) {
        this.map.getView().animate({
          center: [coordinate[0], coordinate[1]],
          duration: 400
        })
      }
    }
  }

  /**
   * 设置视图中心点
   * @param coordinate （传入坐标）
   */
  setViewCenter (coordinate) {
    if (coordinate && Array.isArray(coordinate) && this.map) {
      this.map.getView().animate({
        center: coordinate,
        duration: 800
      })
    }
  }

  /**
   * 获取当前地图的范围
   * @returns {Extent_}
   */
  getMapCurrentExtent () {
    if (this.map) {
      return this.map.getView().calculateExtent(this.map.getSize())
    }
  }

  /**
   * 添加单点
   * @param point
   * @param params
   * @returns {Feature_|ol.format.Feature|*|ol.render.Feature|Feature}
   */
  addPoint (point, params) {
    try {
      let geometry = this._getGeometryFromPoint(point)
      let feature = new Feature_({
        geometry: geometry,
        params: params
      })
      let style = this.getStyleByPoint(point['attributes']['style'] || params['style'])
      let selectStyle = this.getStyleByPoint(point['attributes']['selectStyle'] || params['selectStyle'])
      if (style && feature) {
        feature.setStyle(style)
        feature.set('style', style)
        if (selectStyle) {
          feature.set('selectStyle', selectStyle)
        }
      }
      if (point['attributes'] && (point['attributes']['id'] || point['attributes']['ID'])) {
        // let id = (point['attributes']['id'] ? point['attributes']['id'] : (point['attributes']['ID'] ? point['attributes']['ID'] : params['id']))
        let id = (point.attributes['id'] || point.attributes['ID'] || params['id'])
        feature.setId(id)
        feature.setProperties(point['attributes'])
      }
      if (params['zoomToExtent']) {
        let extent = geometry.getExtent()
        let _extent = this.adjustExtent(extent)
        this.zoomToExtent(_extent, true)
      }
      if (params['layerName']) {
        let layer = this.createVectorLayer(params['layerName'], {
          create: true
        })
        layer.getSource().addFeature(feature)
        this.pointLayers.add(params['layerName'])
      }
      this.orderLayerZindex()
      return feature
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 添加多个点
   * @param points
   * @param params
   */
  addPoints (points, params) {
    try {
      if (points && Array.isArray(points)) {
        let [multiPoint, change] = [(new MultiPointGeom([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        points.forEach(point => {
          if (point && point['geometry']) {
            let pointFeat = this.addPoint(point, params)
            if (pointFeat && pointFeat instanceof Feature_) {
              let geom = pointFeat.getGeometry()
              if (geom && geom instanceof PointGeom) {
                multiPoint.appendPoint(geom)
              } else if (geom && geom instanceof MultiPointGeom) {
                let multiGeoms = geom.getPoints()
                if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                  multiGeoms.forEach(_geom => {
                    if (_geom && _geom instanceof PointGeom) {
                      multiPoint.appendPoint(_geom)
                    }
                  })
                }
              }
            }
          }
        })
        if (change) {
          this._getExtent(multiPoint)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 设置点的空间信息
   * @param point
   * @param geometry
   */
  setPointGeometry (point, geometry) {
    if (point && geometry && point instanceof Feature_) {
      let _geometry = this._getGeometryFromPoint({
        geometry: geometry
      })
      point.setGeometry(_geometry)
    } else {
      console.info('传入数据有误！')
    }
  }

  /**
   * 添加线要素
   * @param line
   * @param params
   * @returns {*}
   */
  addPolyline (line, params) {
    try {
      let linefeature = null
      if (line.geometry.hasOwnProperty('paths')) {
        let feat = {
          'type': 'Feature',
          'geometry': {
            'type': 'MultiLineString',
            'coordinates': line.geometry.paths
          }
        }
        linefeature = (new GeoJSONFormat()).readFeature(feat)
      } else {
        linefeature = new Feature_({
          geometry: new WKTFormat().readGeometry(line.geometry)
        })
      }
      let style = this.getStyleByLine(line['attributes']['style'] || params['style'])
      let selectStyle = this.getStyleByLine(line['attributes']['selectStyle'] || params['selectStyle'])
      let extent = linefeature.getGeometry().getExtent()
      if (style && linefeature) {
        linefeature.setStyle(style)
        linefeature.set('style', style)
        if (selectStyle) {
          linefeature.set('selectStyle', selectStyle)
        }
      }
      if (line['attributes'] && (line.attributes['ID'] || line.attributes['id'])) {
        let id = (line.attributes['id'] || line.attributes['ID'] || params['id'])
        linefeature.setId(id)
        linefeature.setProperties(line.attributes)
      }
      if (params['zoomToExtent']) {
        this.zoomToExtent(extent, true)
      }
      if (params['layerName']) {
        let layer = this.createVectorLayer(params['layerName'], {
          create: true
        })
        layer.getSource().addFeature(linefeature)
        this.lineLayers.add(params['layerName'])
      }
      this.orderLayerZindex()
      return linefeature
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 添加多条线要素
   * @param lines
   * @param params
   */
  addPolylines (lines, params) {
    try {
      if (lines && Array.isArray(lines)) {
        let [MultiLine, change] = [(new MultiLineStringGeom([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        lines.forEach(line => {
          let polyLine = this.addPolyline(line, params)
          if (polyLine && polyLine instanceof Feature_) {
            let geom = polyLine.getGeometry()
            if (geom && geom instanceof LineStringGeom) {
              MultiLine.appendLineString(geom)
            } else if (geom && geom instanceof MultiLineStringGeom) {
              let multiGeoms = geom.getLineStrings()
              if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof LineStringGeom) {
                    MultiLine.appendLineString(geom)
                  }
                })
              }
            }
          }
        })
        if (change) {
          this._getExtent(MultiLine)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 添加面要素
   * @param polygon
   * @param params
   * @returns {ol.render.Feature|ol.format.Feature|Feature|*|Feature_}
   */
  addPolygon (polygon, params) {
    try {
      if (polygon && polygon['geometry']) {
        let polygonFeature = new Feature_({
          geometry: new WKTFormat().readGeometry(polygon.geometry)
        })
        let style = this.getStyleByPolygon(polygon['attributes']['style'] || params['style'])
        let selectStyle = this.getStyleByPolygon(polygon['attributes']['selectStyle'] || params['selectStyle'])
        let extent = polygonFeature.getGeometry().getExtent()
        if (style && polygonFeature) {
          polygonFeature.setStyle(style)
          if (selectStyle) {
            polygonFeature.set('selectStyle', selectStyle)
          }
        }
        if (polygon['attributes'] && (polygon.attributes['ID'] || polygon.attributes['id'])) {
          let id = (polygon.attributes['id'] || polygon.attributes['ID'] || params['id'])
          polygonFeature.setId(id)
          polygonFeature.setProperties(polygon.attributes)
        }
        if (params['zoomToExtent']) {
          this.zoomToExtent(extent, true)
        }
        if (params['layerName']) {
          let layer = this.createVectorLayer(params['layerName'], {
            create: true
          })
          layer.getSource().addFeature(polygonFeature)
          this.polygonLayers.add(params['layerName'])
        }
        this.orderLayerZindex()
        return polygonFeature
      } else {
        console.info('传入的数据不标准！')
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 添加多个面
   * @param polygons
   * @param params
   */
  addPolygons (polygons, params) {
    try {
      if (polygons && Array.isArray(polygons)) {
        let [MultiPolygon, change] = [(new MultiPolygonGeom([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        polygons.forEach(polygon => {
          let polygonFeat = this.addPolygon(polygon, params)
          if (polygonFeat && polygonFeat instanceof Feature_) {
            let geom = polygonFeat.getGeometry()
            if (geom && geom instanceof PolygonGeom) {
              MultiPolygon.appendPolygon(geom)
            } else if (geom && geom instanceof MultiPolygonGeom) {
              let multiGeoms = geom.getPolygons()
              if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof PolygonGeom) {
                    MultiPolygon.appendPolygon(_geom)
                  }
                })
              }
            }
          }
        })
        if (change) {
          this._getExtent(MultiPolygon)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 添加热力图要素
   * @param points
   * @param params
   * @returns {string}
   */
  addHeatFeatures (points, params) {
    try {
      let feature = ''
      if (points && Array.isArray(points) && points.length > 0) {
        let [multiPoint, change] = [(new MultiPointGeom([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        points.forEach(item => {
          if (item && item['geometry']) {
            let geometry = this._getGeometryFromPoint(item)
            if (geometry && geometry instanceof PointGeom) {
              multiPoint.appendPoint(geometry)
            } else if (geometry && geometry instanceof MultiPointGeom) {
              let multiGeoms = geometry.getPoints()
              if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof PointGeom) {
                    multiPoint.appendPoint(_geom)
                  }
                })
              }
            }
          }
        })
        if (params['layerName']) {
          feature = new Feature_({
            geometry: multiPoint,
            params: params
          })
          params['create'] = true
          let layer = this.createHeatMapLayer(params['layerName'], params)
          if (layer && layer instanceof LayerHeatmap) {
            layer.getSource().addFeature(feature)
          }
          this.pointLayers.add(params['layerName'])
        }
        if (change) {
          this._getExtent(multiPoint)
        }
      }
      this.orderLayerZindex()
      return feature
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取线当前范围和中心点
   * @param line
   * @returns {{extent: *, center: ol.Coordinate}}
   */
  getCenterExtentFromLine (line) {
    try {
      let geom = null
      if (!(line instanceof Geom)) {
        geom = (new WKTFormat()).readGeometry(line)
      }
      let [MultiLine] = [(new MultiLineStringGeom([]))]
      if (geom && geom instanceof LineStringGeom) {
        MultiLine.appendLineString(geom)
      } else if (geom && geom instanceof MultiLineStringGeom) {
        let multiGeoms = geom.getLineStrings()
        if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
          multiGeoms.forEach(_geom => {
            if (_geom && _geom instanceof LineStringGeom) {
              MultiLine.appendLineString(geom)
            }
          })
        }
      }
      let extent = this._getExtent(MultiLine)
      let center = Extent_.getCenter(extent)
      return ({
        extent: extent,
        center: center
      })
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 获取当前面范围和中心点
   * @param polygon
   * @returns {{extent: *, center: ol.Coordinate}}
   */
  getCenterExtentFromPolygon (polygon) {
    try {
      let geom = null
      if (!(polygon instanceof Geom)) {
        geom = (new WKTFormat()).readGeometry(polygon)
      }
      let [MultiPolygon] = [(new MultiPolygonGeom([]))]
      if (geom && geom instanceof PolygonGeom) {
        MultiPolygon.appendPolygon(geom)
      } else if (geom && geom instanceof MultiPolygonGeom) {
        let multiGeoms = geom.getPolygons()
        if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
          multiGeoms.forEach(_geom => {
            if (_geom && _geom instanceof PolygonGeom) {
              MultiPolygon.appendPolygon(geom)
            }
          })
        }
      }
      let extent = this._getExtent(MultiPolygon)
      let center = Extent_.getCenter(extent)
      return ({
        extent: extent,
        center: center
      })
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 读取空间信息
   * @param geomData
   * @param options
   * @returns {*}
   */
  getGeomFromGeomData (geomData, options) {
    try {
      let featureGeom = null
      if (geomData['geomType'] === 'GeoJSON') {
        featureGeom = (new GeoJSONFormat()).readGeometry(geomData['geometry'])
      } else if (geomData['geomType'] === 'WKT') {
        featureGeom = (new WKTFormat()).readGeometry(geomData['geometry'])
      } else if (geomData['geomType'] === 'EsriJSON') {
        featureGeom = (new EsriJSONFormat()).readGeometry(geomData['geometry'])
      } else if (geomData['geomType'] === 'Polyline') {
        featureGeom = (new PolylineFormat()).readGeometry(geomData['geometry'])
      } else if (Array.isArray(geomData['geometry']) && geomData['geometry'].length === 2) {
        featureGeom = new PointGeom(geomData['geometry'])
      }
      return featureGeom
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 简单兼容
   * @param geomData
   * @param options
   * @returns {{extent: *, center: ol.Coordinate}}
   */
  getCenterExtentFromGeom (geomData, options) {
    let geom = this.getGeomFromGeomData(geomData, options)
    let extent = this._getExtent(geom)
    let center = Extent_.getCenter(extent)
    let bExtent = true
    extent.every(item => {
      if (item === Infinity || isNaN(item) || item === undefined || item === null) {
        bExtent = false
        return false
      } else {
        return true
      }
    })
    if (bExtent && options['zoomToExtent']) {
      this.zoomToExtent(extent, true)
    }
    return ({
      extent: extent,
      center: center
    })
  }

  /**
   * 设置热力图样式
   * @param layerName
   * @param params
   * @returns {*}
   */
  setHeatLayerStyle (layerName, params) {
    try {
      let layer = null
      if (layerName) {
        layerName = layerName.trim()
        let _layer = this.getLayerByLayerName(layerName)
        if (_layer && _layer instanceof LayerHeatmap) {
          layer = _layer
          if (params && typeof params === 'object') {
            for (let key in params) {
              switch (key) {
                case 'blur':
                  layer.setBlur(params[key])
                  break
                case 'radius':
                  layer.setRadius(params[key])
                  break
                case 'gradient':
                  layer.setGradient(params[key])
                  break
                case 'visible':
                  layer.setVisible(params[key])
                  break
                case 'opacity':
                  layer.setOpacity(params[key])
                  break
              }
            }
          }
        }
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 通过图层名移除要素
   * @param layerName
   */
  removeFeatureByLayerName (layerName) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (layer && layer instanceof LayerVector && layer.getSource()) {
        layer.getSource().clear()
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 移除多个图层的要素
   * @param layerNames <Array>
   */
  removeFeatureByLayerNames (layerNames) {
    if (layerNames && Array.isArray(layerNames) && layerNames.length > 0) {
      layerNames.forEach(item => {
        this.removeFeatureByLayerName(item)
      })
    } else {
      console.info('id为空或者不是数组！')
    }
  }

  /**
   * 移除当前要素
   * @param feature
   */
  removeFeature (feature) {
    if (feature && feature instanceof Feature_) {
      let tragetLayer = this.getLayerByFeatuer(feature)
      if (tragetLayer) {
        let source = tragetLayer.getSource()
        if (source && source.removeFeature) {
          source.removeFeature(feature)
        }
      }
    } else {
      throw new Error('传入的不是要素!')
    }
  }

  /**
   * 通过id移除要素
   * @param id
   * @param layerName
   */
  removeFeatureById (id, layerName) {
    if (this.map && id) {
      if (layerName) {
        let layer = this.getLayerByLayerName(layerName)
        if (layer) {
          let feature = layer.getSource().getFeatureById(id)
          if (feature && feature instanceof Feature_) {
            layer.getSource().removeFeature(feature)
          }
        }
      } else {
        let layers = this.map.getLayers().getArray()
        layers.forEach(layer => {
          if (layer && layer instanceof LayerVector && layer.getSource()) {
            let feature = layer.getSource().getFeatureById(id)
            if (feature && feature instanceof Feature_) {
              layer.getSource().removeFeature(feature)
            }
          }
        })
      }
    }
  }

  /**
   * 移除多个要素
   * @param ids
   * @param layerName
   */
  removeFeatureByIds (ids, layerName) {
    if (ids && Array.isArray(ids) && ids.length > 0) {
      ids.forEach(item => {
        this.removeFeatureById(item, layerName)
      })
    } else {
      console.info('id为空或者不是数组！')
    }
  }

  /**
   * 高亮要素
   * @param id (若传feat时其他参数可不传)
   * @param feat
   * @param layerName (传入id时layerName可不传)
   * @returns {*}
   */
  highLightFeature (id, feat, layerName) {
    if (!this.map) return
    if (feat && feat instanceof Feature_) {
      let selectStyle = feat.get('selectStyle')
      if (selectStyle && selectStyle instanceof Styles) {
        feat.setStyle(selectStyle)
      } else if (selectStyle) {
        let st = this.getStyleByPoint(selectStyle)
        feat.setStyle(st)
      }
      return feat
    } else if (id && id.trim() !== "''") {
      let feature = this.getFeatureById(id)
      if (feature && feature instanceof Feature_) {
        let selectStyle = feature.get('selectStyle')
        if (selectStyle && selectStyle instanceof Styles) {
          feature.setStyle(selectStyle)
        } else if (selectStyle) {
          let st = this.getStyleByPoint(selectStyle)
          feature.setStyle(st)
        }
      }
      return feature
    }
  }

  /**
   * 取消高亮状态
   * @param id (若传feat时其他参数可不传)
   * @param feat
   * @param layerName (传入id时layerName可不传)
   * @returns {*}
   */
  unHighLightFeature (id, feat, layerName) {
    if (!this.map) return
    if (feat && feat instanceof Feature_) {
      let normalStyle = feat.get('style')
      if (normalStyle && normalStyle instanceof Styles) {
        feat.setStyle(normalStyle)
      } else if (normalStyle) {
        let st = this.getStyleByPoint(normalStyle)
        feat.setStyle(st)
      }
      return feat
    } else if (id && id.trim() !== "''") {
      let feature = this.getFeatureById(id)
      if (feature && feature instanceof Feature_) {
        let normalStyle = feature.get('style')
        if (normalStyle && normalStyle instanceof Styles) {
          feature.setStyle(normalStyle)
        } else if (normalStyle) {
          let st = this.getStyleByPoint(normalStyle)
          feature.setStyle(st)
        }
      }
      return feature
    }
  }
}
export default Feature
