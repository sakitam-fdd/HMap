import { ol } from '../constants'
import mix from '../utils/mixin'
import LayerSwitcher from './LayerSwitcher';
import Style from '../style/Style'

class Layer extends mix(Style, LayerSwitcher) {
  constructor (map) {
    super();
    this.map = map || null;
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
      let targetLayer = null;
      if (this.map) {
        let layers = this.map.getLayers().getArray();
        targetLayer = layers.filter(layer => {
          return layer.get('layerName') === layerName
        });
      }
      return targetLayer;
    } catch (e) {
      console.log(e);
    }
  }


  /**
   * 通过要素获取图层
   * @param feature
   * @returns {*}
   */
  getLayerByFeatuer (feature) {
    let tragetLayer = null;
    if (this.map) {
      if (feature instanceof ol.Feature) {
        let layers = this.map.getLayers().getArray();
        layers.forEach(layer => {
          let source = layer.getSource();
          if (source.getFeatures) {
            let features = source.getFeatures();
            features.forEach(feat => {
              if (feat == feature) {
                tragetLayer = layer;
              }
            })
          }
        })
      } else {
        throw new Error('传入的不是要素!');
      }
    }
    return tragetLayer;
  }

  /**
   * 创建临时图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatVectorLayer (layerName, params) {
    try {
      if (this.map) {
        let vectorLayer = this.getLayerByLayerName(layerName);
        if (!(vectorLayer instanceof ol.layer.Vector)) {
          vectorLayer = null;
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
              })
            });
          }
        }
        if (this.map && vectorLayer) {
          if (params && params.hasOwnProperty('selectable')) {
            vectorLayer.set("selectable", params.selectable);
          }
          this.map.addLayer(vectorLayer);
        }
        return vectorLayer;
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 创建专题图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatTitleLayer (layerName, params) {
    let titleLayer = null;
    if (this.map) {
      let serviceUrl = params['serviceUrl'];
      if (!serviceUrl) return null;
      titleLayer = new ol.layer.Tile({
        layerName: layerName,
        layerType: 'title',
        source: new ol.source.TileArcGISRest({
          url: serviceUrl,
          params: params,
          wrapX: false
        }),
        wrapX: false
      });
      this.map.addLayer(titleLayer)
    }
    return titleLayer;
  }

  /**
   * 移除图层
   * @param layerName
   */
  removeLayerByLayerName (layerName) {
    if (this.map) {
      let layer = this.getLayerByLayerName(layerName);
      if (layer && layer instanceof ol.layer.Vector && layer.getSource() && layer.getSource().clear) {
        layer.getSource().clear();
      }
    }
  }

  /**
   * 设置地图
   * @param map
   */
  setMap (map) {
    this.map = map;
  }

  /**
   * 获取当前地图对象
   * @returns {*|null}
   */
  getMap () {
    return this.map;
  }
}

export default Layer