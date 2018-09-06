/**
 * Created by FDD on 2017/10/11.
 * @view 视图工具
 */
import ol from 'openlayers';
class ViewUtil {
  /**
   * 获取当前视图范围
   * @param size
   * @returns {ol.Extent|*}
   */
  getExtent (size) {
    if (size) {
      return this.view.calculateExtent(size);
    } else {
      return this.view.calculateExtent(this.map.getSize());
    }
  }

  /**
   * 获取当前地图的范围
   * @returns {ol.Extent}
   */
  getMapCurrentExtent () {
    if (this.map) {
      return this.view.calculateExtent(this.map.getSize());
    }
  }

  /**
   * 缩放到全图
   */
  zoomMaxExtent (zoom) {
    let view = this.map.getView();
    zoom = typeof zoom === 'number' ? zoom : 2;
    if (this.map && view) {
      let center = view.getCenter();
      if (center) {
        this.view.setCenter(center);
        this.view.setZoom(zoom);
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
      });
    }
  }

  /**
   * 判断点是否在视图内，如果不在地图将自动平移
   * @param coordinate (当前点坐标)
   */
  movePointToView (coordinate) {
    if (this.map) {
      let extent = this.getMapCurrentExtent();
      if (!ol.extent.containsXY(extent, coordinate[0], coordinate[1])) {
        this.map.getView().animate({
          center: [coordinate[0], coordinate[1]],
          duration: 400
        });
      }
    }
  }

  /**
   * 调整当前要素范围
   * @param extent
   * @param params
   * @returns {*}
   */
  adjustExtent (extent, params) {
    if (this.map) {
      params = params || {};
      let size = ol.extent.getSize(extent);
      let adjust =
        typeof params['adjust'] === 'number' ? params['adjust'] : 0.2;
      let minWidth =
        typeof params['minWidth'] === 'number' ? params['minWidth'] : 0.05;
      let minHeight =
        typeof params['minHeight'] === 'number' ? params['minHeight'] : 0.05;
      if (size[0] <= minWidth || size[1] <= minHeight) {
        let bleft = ol.extent.getBottomLeft(extent); // 获取xmin,ymin
        let tright = ol.extent.getTopRight(extent); // 获取xmax,ymax
        let xmin = bleft[0] - adjust;
        let ymin = bleft[1] - adjust;
        let xmax = tright[0] + adjust;
        let ymax = tright[1] + adjust;
        extent = ol.extent.buffer([xmin, ymin, xmax, ymax], adjust);
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
      if (!isanimation) {
        view.fit(extent, {
          size: size,
          padding: [0, 0, 0, 0],
          duration: 0,
          maxZoom: view.getMaxZoom() || undefined
        });
      } else {
        view.fit(extent, {
          size: size,
          padding: [0, 0, 0, 0],
          duration: duration || 800,
          maxZoom: view.getMaxZoom() || undefined
        });
      }
    }
  }

  /**
   * 调整图层
   * @constructor
   */
  orderLayerZindex () {
    let layerindex = 10;
    if (this.map) {
      let pointLayers = this.pointLayers;
      let lineLayers = this.lineLayers;
      let polygonLayers = this.polygonLayers;
      polygonLayers.forEach(layerName => {
        if (layerName) {
          let layer = this.getLayerByLayerName(layerName);
          if (layer) {
            layer.setZIndex(layerindex++);
          }
        }
      });
      lineLayers.forEach(layerName => {
        if (layerName) {
          let layer = this.getLayerByLayerName(layerName);
          if (layer) {
            layer.setZIndex(layerindex++);
          }
        }
      });
      pointLayers.forEach(layerName => {
        if (layerName) {
          let layer = this.getLayerByLayerName(layerName);
          if (layer) {
            layer.setZIndex(layerindex++);
          }
        }
      });
    }
  }
}

export default ViewUtil;
