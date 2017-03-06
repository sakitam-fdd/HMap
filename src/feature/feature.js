/**
 * Created by FDD on 2017/2/22.
 * @desc 要素相关处理
 */

import { ol, Layer, Style } from '../constants'
class Feature {
  constructor (map, layer) {
    this.map = map;
    if (!this.map) {
      throw new Error('缺少地图对象！')
    } else {
      this.layer = layer || new Layer(this.map);
    }
  }

  /**
   * 通过id获取Feature
   * @param id
   * @returns {*}
   */
  getFeatureById (id) {
    let layers = this.map.getLayers(), feature;
    layers.forEach(layer => {
      let source = layer.getSource();
      if (source && source.getFeatureById) {
        feature = source.getFeatureById(id);
      }
    });
    return feature;
  }

  /**
   * 通过id和layerName获取Feature
   * （若在当前layerName查不到，则查询全部图层）
   * @param id
   * @param layerName
   * @returns {*}
   */
  getFeatureById2LayerName (id, layerName) {
    let feature = null;
    if (!!layerName) {
      let layer = this.layer.getLayerByName(layerName);
      if (layer && layer instanceof ol.layer.Vector) {
        feature = layer.getSource().getFeatureById(id)
      }
    }
    if (!feature || !(feature instanceof ol.Feature)) {
      feature = this.getFeatureById(id);
    }
    return feature;
  }

  /**
   * 从属性信息中获取空间信息
   * @param point
   * @returns {*}
   * @private
   */
  _getGeometryFromPoint (point) {
    let geometry = null;
    if (point instanceof ol.geom.Geometry) {
      geometry = point;
    } else if (Array.isArray(point.geometry)) {
      geometry = new ol.geom.Point(point.geometry);
    } else {
      geometry = new ol.format.WKT().readGeometry(point.geometry);
    }
    return geometry;
  }

  /**
   * 获取当前范围
   * @param multiFeatures
   * @private
   */
  _getExtent (multiFeatures) {
    let extent = multiFeatures.getExtent();
    let bExtent = true;
    for (let m = 0; m < 4; m++) {
      if (extent[m] == Infinity || extent[m] == NaN) {
        bExtent = false;
        break;
      }
    }
    if (bExtent) {
      this.zoomToExtent(extent, true);
    }
    return extent;
  }

  /**
   * 调整当前要素范围
   * @param extent
   * @returns {*}
   */
  adjustExtent (extent) {
    if (this.map) {
      let width = ol.extent.getWidth(extent);
      let height = ol.extent.getHeight(extent);
      let adjust = 0.2;
      if (width < 0.05) {
        let bleft = ol.extent.getBottomLeft(extent);//获取xmin,ymin
        let tright = ol.extent.getTopRight(extent);//获取xmax,ymax
        let xmin = bleft[0] - adjust;
        let ymin = bleft[1] - adjust;
        let xmax = tright[0] + adjust;
        let ymax = tright[1] + adjust;
        extent = ol.extent.buffer(extent, adjust);
      }
      return extent;
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
      let view = this.map.getView();
      let size = this.map.getSize();
      /**
       *  @type {ol.Coordinate} center The center of the view.
       */
      let center = ol.extent.getCenter(extent);
      if (!isanimation) {
        view.fit(extent, size, {
          padding: [350, 200, 200, 350]
        });
        view.setCenter(center);
      } else {
        if (!duration) {
          duration = 100;
          let pan = ol.animation.pan({
            duration: duration,
            source: /** @type {ol.Coordinate} */ (view.getCenter())
          });
          let bounce = ol.animation.bounce({
            duration: duration,
            resolution: view.getResolution()
          });
          this.map.beforeRender(pan, bounce);
          view.setCenter(center);
          view.fit(extent, size, {
            padding: [200, 350, 200, 350]
          });
        }
      }
    }
  };

  /**
   * 添加单点
   * @param point
   * @param params
   * @returns {ol.Feature|ol.format.Feature|*|ol.render.Feature|Feature}
   */
  addPoint (point, params) {
    let geometry = this._getGeometryFromPoint(point);
    let style = Style.getStyleByPoint(point['attributes']);
    let feature = new ol.Feature({
      geometry: geometry,
      params: params
    });
    feature.setStyle(style);
    if (point['attributes'] && point['attributes']['id']) {
      let id = point['attributes']['id'] ? point['attributes']['id'] : (point['attributes']['ID'] ? point['attributes']['ID'] : params['id']);
      feature.setId(id);
      feature.setProperties(point['attributes']);
    } else {
      throw new Error('传入的数据缺少id！')
    }
    if (params['zoomToExtent']) {
      let extent = geometry.getExtent();
      this.zoomToExtent(extent);
    }
    return feature;
  }

  /**
   * 添加多个点
   * @param points
   * @param params
   */
  addPoints (points, params) {
    if (points && Array.isArray(points)) {
      let multiPoint = new ol.geom.MultiPoint([]), change = false;
      if (params['zoomToExtent']) {
        params['zoomToExtent'] = !params['zoomToExtent'];
        change = true;
      };
      for (let i = 0; i < points.length; i++) {
        let pointFeat = this.addPoint(points[i], params);
        multiPoint.appendPoint(pointFeat.getGeometry());
      }
      if (change) {
        this._getExtent(multiPoint);
      }
    }
  }

  /**
   * 添加线要素
   * @param line
   * @param params
   * @returns {*}
   */
  addPolyline (line, params) {
    let linefeature = null;
    if (line.geometry.hasOwnProperty('paths')) {
      let feat = {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiLineString',
          'coordinates': line.geometry.paths
        }
      };
      linefeature = (new ol.format.GeoJSON()).readFeature(feat);
    } else {
      linefeature = new ol.Feature({
        geometry: new ol.format.WKT().readGeometry(line.geometry)
      });
    }
    let style = Style.getStyleByPoint(line['attributes']);
    let extent = linefeature.getGeometry().getExtent();
    if (style && linefeature) {
      linefeature.setStyle(style);
    }
    if (line.attributes['ID'] || line.attributes['id']) {
      let id = line['attributes']['id'] ? line['attributes']['id'] : (line['attributes']['ID'] ? line['attributes']['ID'] : params['id']);
      linefeature.setId(id);
      linefeature.setProperties(line.attributes);
    }
    if (params['zoomToExtent']) {
      this.zoomToExtent(extent, true);
    }
    return linefeature;
  }

  /**
   * 添加多条线要素
   * @param lines
   * @param params
   */
  addPolylines (lines, params) {
    if (lines && Array.isArray(lines)) {
      let MultiLine = new ol.geom.MultiLineString([]), change = false;
      if (params['zoomToExtent']) {
        params['zoomToExtent'] = !params['zoomToExtent'];
        change = true;
      };
      for (let i = 0; i < lines.length; i++) {
        let polyLine = this.addPolyline(lines[i], params);
        MultiLine.appendLineString(polyLine.getGeometry());
      }
      if (change) {
        this._getExtent(MultiLine);
      }
    }
  }
}

export default Feature