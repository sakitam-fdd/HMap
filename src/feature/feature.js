/**
 * Created by FDD on 2017/9/18.
 * @desc 矢量要素标绘
 */
import ol from 'openlayers'
import mixin from '../utils/mixins'
import olStyleFactory from 'ol-extent/src/style/factory'
import Layer from '../layer/Layer'
class Feature extends mixin(Layer) {
  constructor () {
    super()
    this.desc = ''
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
      if (layer && layer instanceof ol.layer.Vector && layer.getSource() && layer.getSource().getFeatureById) {
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
      if (layer && layer instanceof ol.layer.Vector) {
        feature = layer.getSource().getFeatureById(id)
      }
    }
    if (!feature || !(feature instanceof ol.Feature)) {
      feature = this.getFeatureById(id)
    }
    return feature
  }

  /**
   * 获取当前范围
   * @param multiFeatures
   * @param params
   * @private
   */
  _getExtent (multiFeatures, params) {
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
      if (params['view'] && params['view']['adjustExtent']) {
        extent = this.adjustExtent(extent, params['view'])
      }
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
      if (!(ol.extent.containsXY(extent, coordinate[0], coordinate[1]))) {
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
   * @returns {ol.Extent}
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
   * @returns {ol.Feature|ol.format.Feature|*|ol.render.Feature|Feature}
   */
  addPoint (point, params) {
    try {
      let geometry = this.getGeomFromGeomData(point, params)
      let feature = new ol.Feature({
        geometry: geometry,
        params: params
      })
      let style = new olStyleFactory(point['attributes']['style'] || params['style'])
      let selectStyle = new olStyleFactory(point['attributes']['selectStyle'] || params['selectStyle'])
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
        let _extent = this.adjustExtent(extent, params['view'])
        this.zoomToExtent(_extent, true)
      }
      if (params['layerName']) {
        params['create'] = true
        let layer = this.createVectorLayer(params['layerName'], params)
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
        let [multiPoint, change] = [(new ol.geom.MultiPoint([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        points.forEach(point => {
          if (point && point['geometry']) {
            let pointFeat = this.addPoint(point, params)
            if (pointFeat && pointFeat instanceof ol.Feature) {
              let geom = pointFeat.getGeometry()
              if (geom && geom instanceof ol.geom.Point) {
                multiPoint.appendPoint(geom)
              } else if (geom && geom instanceof ol.geom.MultiPoint) {
                let multiGeoms = geom.getPoints()
                if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                  multiGeoms.forEach(_geom => {
                    if (_geom && _geom instanceof ol.geom.Point) {
                      multiPoint.appendPoint(_geom)
                    }
                  })
                }
              }
            }
          }
        })
        if (change) {
          this._getExtent(multiPoint, params)
        }
        return multiPoint
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 设置点的空间信息
   * @param point
   * @param geometry
   * @param params
   */
  setPointGeometry (point, geometry, params) {
    if (point && geometry && point instanceof ol.Feature) {
      let _geometry = this.getGeomFromGeomData({
        geometry: geometry
      }, params)
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
      let linefeature = new ol.Feature({
        geometry: this.getGeomFromGeomData(line, params)
      })
      let style = new olStyleFactory(line['attributes']['style'] || params['style'])
      let selectStyle = new olStyleFactory(line['attributes']['selectStyle'] || params['selectStyle'])
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
        if (params['view'] && params['view']['adjustExtent']) {
          extent = this.adjustExtent(extent, params['view'])
        }
        this.zoomToExtent(extent, true)
      }
      if (params['layerName']) {
        params['create'] = true
        let layer = this.createVectorLayer(params['layerName'], params)
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
        let [MultiLine, change] = [(new ol.geom.MultiLineString([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        lines.forEach(line => {
          let polyLine = this.addPolyline(line, params)
          if (polyLine && polyLine instanceof ol.Feature) {
            let geom = polyLine.getGeometry()
            if (geom && geom instanceof ol.geom.LineString) {
              MultiLine.appendLineString(geom)
            } else if (geom && geom instanceof ol.geom.MultiLineString) {
              let multiGeoms = geom.getLineStrings()
              if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof ol.geom.LineString) {
                    MultiLine.appendLineString(_geom)
                  }
                })
              }
            }
          }
        })
        if (change) {
          this._getExtent(MultiLine, params)
        }
        return MultiLine
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 添加面要素
   * @param polygon
   * @param params
   * @returns {ol.render.Feature|ol.format.Feature|Feature|*|ol.Feature}
   */
  addPolygon (polygon, params) {
    try {
      if (polygon && polygon['geometry']) {
        let polygonFeature = new ol.Feature({
          geometry: this.getGeomFromGeomData(polygon, params)
        })
        let style = new olStyleFactory(polygon['attributes']['style'] || params['style'])
        let selectStyle = new olStyleFactory(polygon['attributes']['selectStyle'] || params['selectStyle'])
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
          if (params['view'] && params['view']['adjustExtent']) {
            extent = this.adjustExtent(extent, params['view'])
          }
          this.zoomToExtent(extent, true)
        }
        if (params['layerName']) {
          params['create'] = true
          let layer = this.createVectorLayer(params['layerName'], params)
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
        let [MultiPolygon, change] = [(new ol.geom.MultiPolygon([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        polygons.forEach(polygon => {
          let polygonFeat = this.addPolygon(polygon, params)
          if (polygonFeat && polygonFeat instanceof ol.Feature) {
            let geom = polygonFeat.getGeometry()
            if (geom && geom instanceof ol.geom.Polygon) {
              MultiPolygon.appendPolygon(geom)
            } else if (geom && geom instanceof ol.geom.MultiPolygon) {
              let multiGeoms = geom.getPolygons()
              if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof ol.geom.Polygon) {
                    MultiPolygon.appendPolygon(_geom)
                  }
                })
              }
            }
          }
        })
        if (change) {
          this._getExtent(MultiPolygon, params)
        }
        return MultiPolygon
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
        let [multiPoint, change] = [(new ol.geom.MultiPoint([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        points.forEach(item => {
          if (item && item['geometry']) {
            let geometry = this.getGeomFromGeomData(item, params)
            if (geometry && geometry instanceof ol.geom.Point) {
              multiPoint.appendPoint(geometry)
            } else if (geometry && geometry instanceof ol.geom.MultiPoint) {
              let multiGeoms = geometry.getPoints()
              if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
                multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof ol.geom.Point) {
                    multiPoint.appendPoint(_geom)
                  }
                })
              }
            }
          }
        })
        if (params['layerName']) {
          feature = new ol.Feature({
            geometry: multiPoint,
            params: params
          })
          params['create'] = true
          let layer = this.createHeatMapLayer(params['layerName'], params)
          if (layer && layer instanceof ol.layer.Heatmap) {
            layer.getSource().addFeature(feature)
          }
          this.pointLayers.add(params['layerName'])
        }
        if (change) {
          this._getExtent(multiPoint, params)
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
   * @param params
   * @returns {{extent: *, center: ol.Coordinate}}
   */
  getCenterExtentFromLine (line, params) {
    try {
      let geom = null
      if (!(line instanceof ol.geom.Geometry)) {
        geom = this.getGeomFromGeomData(line, params)
      }
      let [MultiLine] = [(new ol.geom.MultiLineString([]))]
      if (geom && geom instanceof ol.geom.LineString) {
        MultiLine.appendLineString(geom)
      } else if (geom && geom instanceof ol.geom.MultiLineString) {
        let multiGeoms = geom.getLineStrings()
        if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
          multiGeoms.forEach(_geom => {
            if (_geom && _geom instanceof ol.geom.LineString) {
              MultiLine.appendLineString(_geom)
            }
          })
        }
      }
      let extent = this._getExtent(MultiLine, params)
      let center = ol.extent.getCenter(extent)
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
   * @param params
   * @returns {{extent: *, center: ol.Coordinate}}
   */
  getCenterExtentFromPolygon (polygon, params) {
    try {
      let geom = null
      if (!(polygon instanceof ol.geom.Geometry)) {
        geom = this.getGeomFromGeomData(polygon, params)
      }
      let [MultiPolygon] = [(new ol.geom.MultiPolygon([]))]
      if (geom && geom instanceof ol.geom.Polygon) {
        MultiPolygon.appendPolygon(geom)
      } else if (geom && geom instanceof ol.geom.MultiPolygon) {
        let multiGeoms = geom.getPolygons()
        if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
          multiGeoms.forEach(_geom => {
            if (_geom && _geom instanceof ol.geom.Polygon) {
              MultiPolygon.appendPolygon(_geom)
            }
          })
        }
      }
      let extent = this._getExtent(MultiPolygon, params)
      let center = ol.extent.getCenter(extent)
      return ({
        extent: extent,
        center: center
      })
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 读取空间数据
   * @param data
   * @param params
   * @returns {*}
   * @private
   */
  _getMultiGeomtery (data, params) {
    try {
      let geom = null
      let multiPolygon = new ol.geom.MultiPolygon([])
      let multiLine = new ol.geom.MultiLineString([])
      let multiPoint = new ol.geom.MultiPoint([])
      if (!(data instanceof ol.geom.Geometry)) {
        geom = this.getGeomFromGeomData(data, params)
      } else {
        geom = data
      }
      if (geom) {
        if (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.MultiPolygon) {
          if (geom instanceof ol.geom.Polygon) {
            multiPolygon.appendPolygon(geom)
          } else {
            let multiGeoms = geom.getPolygons()
            if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
              multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof ol.geom.Polygon) {
                  multiPolygon.appendPolygon(_geom)
                }
              })
            }
          }
          return multiPolygon
        } else if (geom instanceof ol.geom.LineString || geom instanceof ol.geom.MultiLineString) {
          if (geom instanceof ol.geom.LineString) {
            multiLine.appendLineString(geom)
          } else {
            let multiGeoms = geom.getLineStrings()
            if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
              multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof ol.geom.LineString) {
                  multiLine.appendLineString(_geom)
                }
              })
            }
          }
          return multiLine
        } else if (geom instanceof ol.geom.Point || geom instanceof ol.geom.MultiPoint) {
          if (geom instanceof ol.geom.Point) {
            multiPoint.appendPoint(geom)
          } else {
            let multiGeoms = geom.getPoints()
            if (multiGeoms && Array.isArray(multiGeoms) && multiGeoms.length > 0) {
              multiGeoms.forEach(_geom => {
                if (_geom && _geom instanceof ol.geom.Point) {
                  multiPoint.appendPoint(_geom)
                }
              })
            }
          }
          return multiPoint
        }
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 读取空间信息(无类型默认以wkt方式读取)
   * @param geomData
   * @param options
   * @returns {*}
   */
  getGeomFromGeomData (geomData, options) {
    try {
      options = options || {}
      let featureGeom = null
      if (geomData instanceof ol.geom.Geometry) {
        featureGeom = geomData
        if (options['dataProjection'] && options['featureProjection']) {
          featureGeom = featureGeom.transform(options['dataProjection'], options['featureProjection'])
        }
      } else if (geomData.hasOwnProperty('geometry') && geomData['geometry'] instanceof ol.geom.Geometry) {
        featureGeom = geomData['geometry']
        if (options['dataProjection'] && options['featureProjection']) {
          featureGeom = featureGeom.transform(options['dataProjection'], options['featureProjection'])
        }
      } else if (geomData['geomType'] === 'GeoJSON' || options['geomType'] === 'GeoJSON') {
        let GeoJSONFormat = new ol.format.GeoJSON()
        featureGeom = GeoJSONFormat.readGeometry(geomData['geometry'], {
          dataProjection: options['dataProjection'] ? options['dataProjection'] : undefined,
          featureProjection: options['featureProjection'] ? options['featureProjection'] : undefined
        })
      } else if (geomData['geomType'] === 'EsriJSON' || options['geomType'] === 'EsriJSON') {
        let esriJsonFormat = new ol.format.EsriJSON()
        featureGeom = esriJsonFormat.readGeometry(geomData['geometry'], {
          dataProjection: options['dataProjection'] ? options['dataProjection'] : undefined,
          featureProjection: options['featureProjection'] ? options['featureProjection'] : undefined
        })
      } else if (geomData['geomType'] === 'Polyline' || options['geomType'] === 'Polyline') {
        let polylineFormat = new ol.format.Polyline()
        featureGeom = polylineFormat.readGeometry(geomData['geometry'], {
          dataProjection: options['dataProjection'] ? options['dataProjection'] : undefined,
          featureProjection: options['featureProjection'] ? options['featureProjection'] : undefined
        })
      } else if (Array.isArray(geomData['geometry'])) {
        featureGeom = new ol.geom.Point(geomData['geometry'])
        if (options['dataProjection'] && options['featureProjection']) {
          featureGeom = featureGeom.transform(options['dataProjection'], options['featureProjection'])
        }
      } else if (geomData['geomType'] === 'MVT' || options['geomType'] === 'MVT') {
        featureGeom = (new ol.format.MVT()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'TopoJSON' || options['geomType'] === 'TopoJSON') {
        featureGeom = (new ol.format.TopoJSON()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'IGC' || options['geomType'] === 'IGC') {
        featureGeom = (new ol.format.IGC()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'GMLBase' || options['geomType'] === 'GMLBase') {
        featureGeom = (new ol.format.GMLBase()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'GPX' || options['geomType'] === 'GPX') {
        featureGeom = (new ol.format.GPX()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'KML' || options['geomType'] === 'KML') {
        featureGeom = (new ol.format.KML()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'OSMXML' || options['geomType'] === 'OSMXML') {
        featureGeom = (new ol.format.OSMXML()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'WFS' || options['geomType'] === 'WFS') {
        featureGeom = (new ol.format.WFS()).readGeometry(geomData)
      } else if (geomData['geomType'] === 'WMSGetFeatureInfo' || options['geomType'] === 'WMSGetFeatureInfo') {
        featureGeom = (new ol.format.WMSGetFeatureInfo()).readGeometry(geomData)
      } else {
        let wktFormat = new ol.format.WKT()
        featureGeom = wktFormat.readGeometry(geomData['geometry'], {
          dataProjection: options['dataProjection'] ? options['dataProjection'] : undefined,
          featureProjection: options['featureProjection'] ? options['featureProjection'] : undefined
        })
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
    let extent = this._getExtent(geom, options)
    let center = ol.extent.getCenter(extent)
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
      if (options['view'] && options['view']['adjustExtent']) {
        extent = this.adjustExtent(extent, options['view'])
      }
      this.zoomToExtent(extent, true)
    }
    return ({
      extent: extent,
      center: center
    })
  }

  /**
   * 获取范围和中心点
   * @param multiGeom
   * @param options
   * @returns {{extent: *, center: ol.Coordinate}}
   * @private
   */
  _getExtentCenter (multiGeom, options) {
    let extent = this._getExtent(multiGeom, options)
    let center = ol.extent.getCenter(extent)
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
      if (options['view'] && options['view']['adjustExtent']) {
        extent = this.adjustExtent(extent, options['view'])
      }
      this.zoomToExtent(extent, true)
    }
    return ({
      extent: extent,
      center: center
    })
  }

  /**
   * 从多个geom获取范围和中心点（必须同种类型）
   * @param geomDatas
   * @param options
   * @returns {null}
   */
  getCenterExtentFromGeoms (geomDatas, options) {
    let [res, type] = [null, '']
    if (geomDatas && Array.isArray(geomDatas) && geomDatas.length > 0) {
      let multiPolygon = new ol.geom.MultiPolygon([])
      let multiLine = new ol.geom.MultiLineString([])
      let multiPoint = new ol.geom.MultiPoint([])
      geomDatas.forEach(item => {
        if (item) {
          let multiGeom = this._getMultiGeomtery(this.getGeomFromGeomData(item, options))
          if (multiGeom) {
            if (multiGeom instanceof ol.geom.MultiPolygon) {
              let _multiGeoms = multiGeom.getPolygons()
              if (_multiGeoms && Array.isArray(_multiGeoms) && _multiGeoms.length > 0) {
                _multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof ol.geom.Polygon) {
                    multiPolygon.appendPolygon(_geom)
                  }
                })
              }
              type = 'multiPolygon'
            } else if (multiGeom instanceof ol.geom.MultiLineString) {
              let _multiGeoms = multiGeom.getLineStrings()
              if (_multiGeoms && Array.isArray(_multiGeoms) && _multiGeoms.length > 0) {
                _multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof ol.geom.LineString) {
                    multiLine.appendLineString(_geom)
                  }
                })
              }
              type = 'multiLine'
            } else if (multiGeom instanceof ol.geom.MultiPoint) {
              let _multiGeoms = multiGeom.getPoints()
              if (_multiGeoms && Array.isArray(_multiGeoms) && _multiGeoms.length > 0) {
                _multiGeoms.forEach(_geom => {
                  if (_geom && _geom instanceof ol.geom.Point) {
                    multiPoint.appendPoint(_geom)
                  }
                })
              }
              type = 'multiPoint'
            }
          }
        }
      })
      if (type === 'multiPolygon') {
        res = this._getExtentCenter(multiPolygon, options)
      } else if (type === 'multiLine') {
        res = this._getExtentCenter(multiLine, options)
      } else if (type === 'multiPoint') {
        res = this._getExtentCenter(multiPoint, options)
      }
    }
    return res
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
        if (_layer && _layer instanceof ol.layer.Heatmap) {
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
      if (layer && layer instanceof ol.layer.Vector && layer.getSource()) {
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
    if (feature && feature instanceof ol.Feature) {
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
          if (feature && feature instanceof ol.Feature) {
            layer.getSource().removeFeature(feature)
          }
        }
      } else {
        let layers = this.map.getLayers().getArray()
        layers.forEach(layer => {
          if (layer && layer instanceof ol.layer.Vector && layer.getSource()) {
            let feature = layer.getSource().getFeatureById(id)
            if (feature && feature instanceof ol.Feature) {
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
    if (feat && feat instanceof ol.Feature) {
      let selectStyle = feat.get('selectStyle')
      if (selectStyle && selectStyle instanceof ol.style.Style) {
        feat.setStyle(selectStyle)
      } else if (selectStyle) {
        let st = this.getStyleByPoint(selectStyle)
        feat.setStyle(st)
      }
      return feat
    } else if (id && id.trim() !== "''") {
      let feature = this.getFeatureById(id)
      if (feature && feature instanceof ol.Feature) {
        let selectStyle = feature.get('selectStyle')
        if (selectStyle && selectStyle instanceof ol.style.Style) {
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
    if (feat && feat instanceof ol.Feature) {
      let normalStyle = feat.get('style')
      if (normalStyle && normalStyle instanceof ol.style.Style) {
        feat.setStyle(normalStyle)
      } else if (normalStyle) {
        let st = this.getStyleByPoint(normalStyle)
        feat.setStyle(st)
      }
      return feat
    } else if (id && id.trim() !== "''") {
      let feature = this.getFeatureById(id)
      if (feature && feature instanceof ol.Feature) {
        let normalStyle = feature.get('style')
        if (normalStyle && normalStyle instanceof ol.style.Style) {
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
