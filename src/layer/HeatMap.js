import ol from 'openlayers';
import simpleheat from '../assets/simpleheat';
import { createCanvas, isFunction } from '../utils';
import CanvasLayer from './CanvasLayer';
import {createWebGLHeatmap} from '../assets/webgl-heatmap';

const options_ = {
  'max': 1,
  'gradient': {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red'
  },
  'radius': 25,
  'blur': 15,
  'minOpacity': 0.05,
  'gradientTexture': false,
  'alphaRange': 1,
  'renderType': 'canvas'
};

class HeatMap extends CanvasLayer {
  constructor (datas, options = {}) {
    super(Object.assign(options_, options));

    this._features = datas || [];
  }

  getFeatures () {
    return this._features;
  }

  addFeatures (features) {
    this._features = features || [];
    return this.render();
  }

  addFeature (feature) {
    if (!feature) {
      return this;
    }
    if (feature[0] && Array.isArray(feature[0])) {
    } else {
      this._features.push(feature);
    }
    return this.render();
  }

  /**
   * canvas constructor
   * @param extent
   * @param resolution
   * @param pixelRatio
   * @param size
   * @param projection
   * @returns {*}
   */
  canvasFunction (extent, resolution, pixelRatio, size, projection) {
    if (!this._canvas) {
      this._canvas = createCanvas(size[0], size[1], pixelRatio);
    } else {
      this._canvas.width = size[0];
      this._canvas.height = size[1];
    }
    if (resolution <= this.get('maxResolution')) {
      this.render({
        extent: extent,
        size: size,
        pixelRatio: pixelRatio,
        projection: projection
      });
    } else {
      // console.warn('超出所设置最大分辨率！')
    }
    return this._canvas;
  }

  render () {
    const features = this.getFeatures();
    if (!features || features.length === 0) return;
    const data = this.renderData(features);
    if (this.options.renderType === 'canvas') {
      if (!this._layer) {
        this._layer = simpleheat(this._canvas);
      }
      this._layer.radius(this.options['radius'] || this._layer.defaultRadius, this.options['blur']);
      if (this.options['gradient']) {
        this._layer.gradient(this.options['gradient']);
      }
      this._layer.max(this.options['max']);
      this._layer.data(data).draw(this.options['minOpacity']);
    } else if (this.options.renderType === 'webgl') {
      if (!this._layer) {
        this._layer = createWebGLHeatmap({
          canvas: this._canvas,
          gradientTexture: this.options.gradientTexture,
          alphaRange: [0, this.options.alphaRange]
          // gl:this.getRenderer().gl
        });
      }
      this._layer.clear();
      let [i, length] = [0, data.length];
      for (; i < length; i++) {
        this._layer.addPoint(
          Math.floor(data[i][0]),
          Math.floor(data[i][1]),
          data[i][2]
        );
      }
      this._layer.update();
      this._layer.display();
    }
    return this;
  }

  renderData (features) {
    return features.map(feature => {
      const pixel = this.getMap().getPixelFromCoordinate([feature[0], feature[1]]);
      return [...pixel, feature[2]];
    });
  }

  isEmpty () {
    return !this._features.length;
  }

  clear () {
    this._features = [];
    if (this._layer.clear && isFunction(this._layer.clear)) {
      this._layer.clear();
    }
    if (this._layer.update && isFunction(this._layer.update)) {
      this._layer.update();
    }
    if (this._layer.display && isFunction(this._layer.display)) {
      this._layer.display();
    }
    this.render();
    return this;
  }
}

ol.layer.HeatMap = HeatMap;
export default HeatMap;
