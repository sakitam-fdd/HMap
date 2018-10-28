import ol from 'openlayers';
import { createCanvas } from '../utils';
import CanvasLayer from './CanvasLayer';

const options_ = {
  'animation': false,
  'renderType': 'canvas'
};

class ParticleLayer extends CanvasLayer {
  constructor (datas, options = {}) {
    super(Object.assign(options_, options));

    this._features = datas || [];

    /**
     * FIXME: 可去除
     * @type {boolean}
     * @private
     */
    this._isRendered = false;
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

  getParticles () {}

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
    const map = this.getMap();
    const context = this.getContext();
    const points = this.getParticles(Date.now());
    if (!context || !map || !points || points.length === 0) return;
    const view = map.getView();
    let extent = view.calculateExtent(map.getSize());
    const e = 2 * Math.PI;
    for (let i = 0, l = points.length; i < l; i++) {
      const coordinate = points[i].coordinates;
      if (ol.extent.containsCoordinate(extent, coordinate)) {
        const pixel = map.getPixelFromCoordinate(coordinate);
        const color = points[i].color || this.options['lineColor'] || '#fff';
        const radius = points[i].radius;
        if (context.fillStyle !== color) {
          context.fillStyle = color;
        }
        if (radius <= 2) {
          context.fillRect(pixel[0] - radius / 2, pixel[1] - radius / 2, radius, radius);
        } else {
          context.beginPath();
          context.arc(pixel[0], pixel[1], radius / 2, 0, e);
          context.fill();
        }
      }
    }
    this.drawReact(context);
    if (!this._isRendered) {
      this.once('precompose', () => {
        setTimeout(() => {
          this.render();
        }, 300);
      }, this);
      this._isRendered = true;
    }
    super.render();
    return this;
  }

  draw () {
    this.render();
  }

  drawReact (context) {
    // FIXME：淡化现有粒子轨迹，效果不好，怀疑是 `ol` 内置渲染器影响
    const g = context.globalCompositeOperation;
    context.globalCompositeOperation = 'destination-out';
    const trail = this.options['trail'] || 30;
    context.fillStyle = 'rgba(0, 0, 0, ' + (1 / trail) + ')';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.globalCompositeOperation = g;
  }

  isEmpty () {
    return !this._features.length;
  }

  clear () {
    this._features = [];
    return this;
  }
}

ol.layer.ParticleLayer = ParticleLayer;
export default ParticleLayer;
