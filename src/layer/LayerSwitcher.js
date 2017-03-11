import { ol } from '../constants'
class LayerSwitcher {
  constructor (map) {
    this.map = map || null;
    if (!this.map) {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 获取当前底图（包含标注层）
   * @private
   */
  _getBaseLayers () {
    if (this.map) {
      this.baseLayers = [];
      this.map.getLayers().getArray().forEach(layer => {
        if (layer && layer instanceof ol.layer.Group && layer.get('isBaseLayer')) {
          layer.getLayers().getArray().forEach(_layer => {
            if (_layer && _layer instanceof ol.layer.Tile && _layer.get('isBaseLayer')) {
              this.baseLayers.push(_layer);
            }
          })
        }
      })
    }
  }

  /**
   * 获取地图除标注层的layerNames
   * @returns {Array|*}
   */
  getBaseLayerNames () {
    this._getBaseLayers ();
    this.baseLayerNames = [];
    if (this.baseLayers && Array.isArray(this.baseLayers) && this.baseLayers.length > 0) {
      this.baseLayerNames = this.baseLayers.map(layer => {
        let layerName = '';
        if (layer.get('layerNames') && !layer.get('alias')) {
          layerName = layer.get('layerNames');
        }
        return layerName
      })
    }
    return this.baseLayerNames;
  }

  /**
   * 图层切换
   * @param layerName
   */
  switchLayer (layerName) {
    this._getBaseLayers ();
    this.baseLayers.forEach(layer => {
      if (layer.get('layerName') === layerName || layer.get('alias') === layerName) {
        layer.set('isDefault', true);
        layer.setVisible(true);
      } else {
        layer.set('isDefault', false);
        layer.setVisible(false);
      }
    })
  }
}

export default LayerSwitcher