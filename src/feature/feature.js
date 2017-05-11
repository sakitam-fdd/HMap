/**
 * Created by FDD on 2017/2/22.
 * @desc 要素相关处理
 */
import { ol } from '../constants'
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
   * 从属性信息中获取空间信息
   * @param point
   * @returns {*}
   * @private
   */
  _getGeometryFromPoint (point) {
    let geometry = null
    if (point instanceof ol.geom.Geometry) {
      geometry = point
    } else if (Array.isArray(point.geometry)) {
      geometry = new ol.geom.Point(point.geometry)
    } else {
      geometry = new ol.format.WKT().readGeometry(point.geometry)
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
   * 调整当前要素范围
   * @param extent
   * @returns {*}
   */
  adjustExtent (extent) {
    if (this.map) {
      let width = ol.extent.getWidth(extent)
      let adjust = 0.2
      if (width < 0.05) {
        let bleft = ol.extent.getBottomLeft(extent) // 获取xmin,ymin
        let tright = ol.extent.getTopRight(extent) // 获取xmax,ymax
        let xmin = bleft[0] - adjust
        let ymin = bleft[1] - adjust
        let xmax = tright[0] + adjust
        let ymax = tright[1] + adjust
        extent = ol.extent.buffer([xmin, ymin, xmax, ymax], adjust)
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
      let center = ol.extent.getCenter(extent)
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

  /**
   * 判断点是否在视图内，如果不在地图将自动平移
   * @param coordinate (当前点坐标)
   */
  movePointToView (coordinate) {
    if (this.map) {
      let extent = this.getMapCurrentExtent()
      if (!(ol.extent.containsXY(extent, coordinate[0], coordinate[1]))) {
        this.map.getView().setCenter([coordinate[0], coordinate[1]])
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
      let geometry = this._getGeometryFromPoint(point)
      let feature = new ol.Feature({
        geometry: geometry,
        params: params
      })
      let style = this.getStyleByPoint(point['attributes']['style'])
      let selectStyle = this.getStyleByPoint(point['attributes']['selectStyle'])
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
        let layer = this.creatVectorLayer(params['layerName'], {
          create: true
        })
        layer.getSource().addFeature(feature)
      }
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
                    multiPoint.appendPoint(geom)
                  }
                })
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
    if (point && geometry && point instanceof ol.Feature) {
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
        linefeature = (new ol.format.GeoJSON()).readFeature(feat)
      } else {
        linefeature = new ol.Feature({
          geometry: new ol.format.WKT().readGeometry(line.geometry)
        })
      }
      let style = this.getStyleByLine(line['attributes']['style'])
      let selectStyle = this.getStyleByLine(line['attributes']['selectStyle'])
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
        let layer = this.creatVectorLayer(params['layerName'], {
          create: true
        })
        layer.getSource().addFeature(linefeature)
      }
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
   * @returns {ol.render.Feature|ol.format.Feature|Feature|*|ol.Feature}
   */
  addPolygon (polygon, params) {
    try {
      if (polygon && polygon['geometry']) {
        let polygonFeature = new ol.Feature({
          geometry: new ol.format.WKT().readGeometry(polygon.geometry)
        })
        let style = this.getStyleByPolygon(polygon['attributes']['style'])
        let selectStyle = this.getStyleByPolygon(polygon['attributes']['selectStyle'])
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
          let layer = this.creatVectorLayer(params['layerName'], {
            create: true
          })
          layer.getSource().addFeature(polygonFeature)
        }
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
          this._getExtent(MultiPolygon)
        }
      }
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
      let feature = this.getFeatureById(id, layerName)
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
      let feature = this.getFeatureById(id, layerName)
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
