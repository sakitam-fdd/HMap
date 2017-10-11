/**
 * Created by FDD on 2017/9/18.
 * @desc 矢量要素标绘
 */
import ol from 'openlayers'
import mixin from '../utils/mixins'
import olStyleFactory from 'ol-extent/src/style/factory'
import Layer from '../layer/Layer'
import Geometry from '../geom/Geometry'
class Feature extends mixin(Layer, Geometry) {
  constructor () {
    super()
    this[Symbol()] = Symbol()
  }

  /**
   * 在某个图层查找id匹配的要素
   * @param layer
   * @param id
   * @returns {*}
   */
  getFeatureFromLayer (layer, id) {
    let feature
    if (layer && layer instanceof ol.layer.Vector && id) {
      const source = layer.getSource()
      if (source && source.getFeatureById) {
        feature = source.getFeatureById(id)
      }
    }
    return feature
  }

  /**
   * 通过id获取Feature
   * @param id
   * @returns {*}
   */
  getFeatureById (id) {
    let layers = this.getVectorLayers()
    let feature
    layers.every(layer => {
      feature = this.getFeatureFromLayer(layer, id)
      if (feature && feature instanceof ol.Feature) {
        return false
      } else {
        return true
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
    let feature
    if (layerName) {
      let layer = this.getLayerByLayerName(layerName)
      feature = this.getFeatureFromLayer(layer, id)
    }
    if (!feature || !(feature instanceof ol.Feature)) {
      feature = this.getFeatureById(id)
    }
    return feature
  }

  /**
   * 添加样式
   * @param data_
   * @param params
   * @param feature
   * @returns {*}
   */
  fixStyle (data_, params, feature) {
    let style = new olStyleFactory(data_['attributes']['style'] || params['style'])
    let selectStyle = new olStyleFactory(data_['attributes']['selectStyle'] || params['selectStyle'])
    if (style && feature) {
      feature.setStyle(style)
      feature.set('style', style)
      if (selectStyle) {
        feature.set('selectStyle', selectStyle)
      }
    }
    return feature
  }

  /**
   * 添加相关属性信息
   * @param data_
   * @param params
   * @param feature
   * @returns {*}
   */
  fixProperties (data_, params, feature) {
    if (data_['attributes'] && (data_['attributes']['id'] || data_['attributes']['ID'])) {
      let id = (data_.attributes['id'] || data_.attributes['ID'] || params['id'])
      feature.setId(id)
      feature.setProperties(data_['attributes'])
    }
    return feature
  }

  /**
   * 调整视图
   * @param geometry
   * @param params
   */
  fixView (geometry, params) {
    if (params['zoomToExtent']) {
      let extent = geometry.getExtent()
      if (params['view'] && params['view']['adjustExtent']) {
        extent = this.adjustExtent(extent, params['view'])
      }
      this.zoomToExtent(extent, true)
    }
  }

  /**
   * 向图层添加要素
   * @param params
   * @param feature
   */
  appendFeature (params, feature) {
    params['create'] = true
    let layer = this.createVectorLayer(params['layerName'], params)
    layer.getSource().addFeature(feature)
  }

  /**
   * 添加单点
   * @param point
   * @param params
   * @returns {ol.Feature|ol.format.Feature|*|ol.render.Feature|Feature}
   */
  addPoint (point, params) {
    let geometry = this.getGeomFromGeomData(point, params)
    if (geometry) {
      let feature = new ol.Feature({
        geometry: geometry,
        params: params
      })
      feature = this.fixStyle(point, params, feature)
      feature = this.fixProperties(point, params, feature)
      this.fixView(geometry, params)
      if (params['layerName']) {
        this.appendFeature(params, feature)
        this.pointLayers.add(params['layerName'])
      }
      return feature
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
        let [features, multiPoint, change] = [[], (new ol.geom.MultiPoint([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        points.forEach(point => {
          if (point && point['geometry']) {
            let pointFeat = this.addPoint(point, params)
            if (pointFeat && pointFeat instanceof ol.Feature) {
              features.push(pointFeat)
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
          params['zoomToExtent'] = true
          this.fixView(multiPoint, params)
        }
        return features
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
    let geometry = this.getGeomFromGeomData(line, params)
    if (geometry) {
      let lineFeature = new ol.Feature({
        geometry: geometry,
        params: params
      })
      lineFeature = this.fixStyle(line, params, lineFeature)
      lineFeature = this.fixProperties(line, params, lineFeature)
      this.fixView(geometry, params)
      if (params['layerName']) {
        this.appendFeature(params, lineFeature)
        this.lineLayers.add(params['layerName'])
      }
      return lineFeature
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
        let [features, MultiLine, change] = [[], (new ol.geom.MultiLineString([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        lines.forEach(line => {
          let polyLine = this.addPolyline(line, params)
          if (polyLine && polyLine instanceof ol.Feature) {
            features.push(polyLine)
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
          params['zoomToExtent'] = true
          this.fixView(MultiLine, params)
        }
        return features
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
    let geometry = this.getGeomFromGeomData(polygon, params)
    if (geometry) {
      let polygonFeature = new ol.Feature({
        geometry: geometry,
        params: params
      })
      polygonFeature = this.fixStyle(polygon, params, polygonFeature)
      polygonFeature = this.fixProperties(polygon, params, polygonFeature)
      this.fixView(geometry, params)
      if (params['layerName']) {
        this.appendFeature(params, polygonFeature)
        this.polygonLayers.add(params['layerName'])
      }
      return polygonFeature
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
        let [features, MultiPolygon, change] = [[], (new ol.geom.MultiPolygon([])), false]
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = false
          change = true
        }
        polygons.forEach(polygon => {
          let polygonFeat = this.addPolygon(polygon, params)
          if (polygonFeat && polygonFeat instanceof ol.Feature) {
            features.push(polygonFeat)
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
          params['zoomToExtent'] = true
          this.fixView(MultiPolygon, params)
        }
        return features
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
          params['zoomToExtent'] = true
          this.fixView(multiPoint, params)
        }
      }
      return feature
    } catch (e) {
      console.log(e)
    }
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
   * @param fast
   * @returns {Array}
   */
  removeFeatureByLayerName (layerName, fast) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      let features = []
      if (layer && layer instanceof ol.layer.Vector) {
        const source = layer.getSource()
        if (source && source.clear) {
          if (source.getFeatures) {
            features = source.getFeatures()
          }
          source.clear((fast || false))
        }
      }
      return features
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 移除多个图层的要素
   * @param layerNames
   * @returns {Array}
   */
  removeFeatureByLayerNames (layerNames) {
    let features = []
    if (layerNames && Array.isArray(layerNames) && layerNames.length > 0) {
      layerNames.forEach(item => {
        features = features.concat(this.removeFeatureByLayerName(item))
      })
      return features
    } else {
      console.info('传入的不是数组！')
    }
  }

  /**
   * 移除当前要素
   * @param feature
   */
  removeFeature (feature) {
    if (feature && feature instanceof ol.Feature) {
      let tragetLayer = this.getLayerByFeature(feature)
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
    let feature
    if (this.map && id) {
      if (layerName) {
        let layer = this.getLayerByLayerName(layerName)
        if (layer && layer.getSource) {
          let source = layer.getSource()
          if (source && source.getFeatureById) {
            feature = source.getFeatureById(id)
            if (feature && feature instanceof ol.Feature) {
              source.removeFeature(feature)
            }
          }
        }
      } else {
        let layers = this.getAllLayers()
        layers.every(layer => {
          feature = this.getFeatureFromLayer(layer, id)
          if (feature && feature instanceof ol.Feature) {
            layer.getSource().removeFeature(feature)
            return false
          } else {
            return true
          }
        })
      }
    }
    return feature
  }

  /**
   * 移除多个要素
   * @param ids
   * @param layerName
   */
  removeFeatureByIds (ids, layerName) {
    let features = []
    if (ids && Array.isArray(ids) && ids.length > 0) {
      ids.forEach(item => {
        features.push(this.removeFeatureById(item, layerName))
      })
    } else {
      console.info('id为空或者不是数组！')
    }
    return features
  }

  /**
   * 高亮要素
   * @param key (若传feat时其他参数可不传)
   * @param style
   * @returns {*}
   */
  highLightFeature (key, style) {
    if (!this.map) return
    if (key && key instanceof ol.Feature) {
      if (style && style instanceof ol.style.Style) {
        key.setStyle(style)
      } else if (typeof style === 'object') {
        let st = new olStyleFactory(style)
        key.setStyle(st)
      } else {
        let selectStyle = key.get('selectStyle')
        if (selectStyle && selectStyle instanceof ol.style.Style) {
          key.setStyle(selectStyle)
        } else if (typeof selectStyle === 'object') {
          let st = new olStyleFactory(selectStyle)
          key.setStyle(st)
        }
      }
      return key
    } else if (key && (typeof key === 'string') && key.trim() !== "''") {
      let feature = this.getFeatureById(key)
      if (feature && feature instanceof ol.Feature) {
        if (style && style instanceof ol.style.Style) {
          feature.setStyle(style)
        } else if (typeof style === 'object') {
          let st = new olStyleFactory(style)
          feature.setStyle(st)
        } else {
          let selectStyle = feature.get('selectStyle')
          if (selectStyle && selectStyle instanceof ol.style.Style) {
            feature.setStyle(selectStyle)
          } else if (typeof selectStyle === 'object') {
            let st = new olStyleFactory(selectStyle)
            feature.setStyle(st)
          }
        }
      }
      return feature
    }
  }

  /**
   * 取消高亮状态
   * @param key (若传feat时其他参数可不传)
   * @param style
   * @returns {*}
   */
  unHighLightFeature (key, style) {
    if (!this.map) return
    if (key && key instanceof ol.Feature) {
      if (style && style instanceof ol.style.Style) {
        key.setStyle(style)
      } else if (typeof style === 'object') {
        let st = new olStyleFactory(style)
        key.setStyle(st)
      } else {
        let normalStyle = key.get('style')
        if (normalStyle && normalStyle instanceof ol.style.Style) {
          key.setStyle(normalStyle)
        } else if (typeof normalStyle === 'object') {
          let st = new olStyleFactory(normalStyle)
          key.setStyle(st)
        }
      }
      return key
    } else if (key && (typeof key === 'string') && key.trim() !== "''") {
      let feature = this.getFeatureById(key)
      if (feature && feature instanceof ol.Feature) {
        if (style && style instanceof ol.style.Style) {
          feature.setStyle(style)
        } else if (typeof style === 'object') {
          let st = new olStyleFactory(style)
          feature.setStyle(st)
        } else {
          let normalStyle = feature.get('style')
          if (normalStyle && normalStyle instanceof ol.style.Style) {
            feature.setStyle(normalStyle)
          } else if (typeof normalStyle === 'object') {
            let st = new olStyleFactory(normalStyle)
            feature.setStyle(st)
          }
        }
      }
      return feature
    }
  }
}
export default Feature
