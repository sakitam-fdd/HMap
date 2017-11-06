/**
 * Created by FDD on 2017/10/11.
 * @desc 空间数据处理
 */
import ol from 'openlayers'
import ViewUtil from '../utils/ViewUtil'
class Geometry extends ViewUtil {
  constructor () {
    super()
    this[Symbol('geometry')] = Symbol('geometry')
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
      if (params['zoomToExtent']) {
        this.zoomToExtent(extent, true)
      }
    }
    return extent
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
}
export default Geometry
