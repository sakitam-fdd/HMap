import ol from 'openlayers';
import { createCanvas, isFunction } from '../utils';
import CanvasLayer from './CanvasLayer';
import { createWebGLHeatmap } from '../assets/webgl-heatmap';

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

// https://github.com/mourner/simpleheat
class SimpleHeat {
  static _colorize (pixels, gradient) {
    for (var i = 0, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i + 3] * 4; // get gradient color from opacity value

      if (j) {
        pixels[i] = gradient[j];
        pixels[i + 1] = gradient[j + 1];
        pixels[i + 2] = gradient[j + 2];
      }
    }
  }

  constructor (canvas, context) {
    if (!canvas) {
      canvas = context.canvas;
    }

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = context || canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._max = 1;
    this._data = [];

    this.defaultRadius = 25;

    this.defaultGradient = {
      0.4: 'blue',
      0.6: 'cyan',
      0.7: 'lime',
      0.8: 'yellow',
      1.0: 'red'
    };
  }

  data (data) {
    this._data = data;
    return this;
  }

  max (max) {
    this._max = max;
    return this;
  }

  add (point) {
    this._data.push(point);
    return this;
  }

  clear () {
    this._data = [];
    return this;
  }

  radius (r, blur) {
    blur = blur === undefined ? 15 : blur;
    // create a grayscale blurred circle image that we'll use for drawing points
    var circle = this._circle = this._createCanvas(), // eslint-disable-line
      ctx = circle.getContext('2d'),
      r2 = this._r = r + blur;
    circle.width = circle.height = r2 * 2;
    ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
    ctx.shadowBlur = blur;
    ctx.shadowColor = 'black';

    ctx.beginPath();
    ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    return this;
  }

  resize () {
    this._width = this._canvas.width;
    this._height = this._canvas.height;
  }

  gradient (grad) {
    // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
    const canvas = this._createCanvas();
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (var i in grad) {
      gradient.addColorStop(+i, grad[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    this._grad = ctx.getImageData(0, 0, 1, 256).data;

    return this;
  }

  draw (minOpacity) {
    if (!this._circle) this.radius(this.defaultRadius);
    if (!this._grad) this.gradient(this.defaultGradient);

    var ctx = this._ctx;

    ctx.clearRect(0, 0, this._width, this._height);

    // draw a grayscale heatmap by putting a blurred circle at each data point
    for (var i = 0, len = this._data.length, p; i < len; i++) {
      p = this._data[i];
      ctx.globalAlpha = Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity);
      ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
    }

    // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
    var colored = ctx.getImageData(0, 0, this._width, this._height);
    SimpleHeat._colorize(colored.data, this._grad);
    ctx.putImageData(colored, 0, 0);
    return this;
  }

  _createCanvas () {
    if (typeof document !== 'undefined') {
      return document.createElement('canvas');
    } else {
      // create a new canvas instance in node.js
      // the canvas class needs to have a default constructor without any parameter
      return new this._canvas.constructor();
    }
  }
}

class HeatMap extends CanvasLayer {
  constructor (datas, options = {}) {
    super(Object.assign(options_, options));

    this._features = datas || [];

    /**
     * FIXME: 暂时处理方案，主要为了解决首次渲染热力图size问题
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
    super.render();
    const features = this.getFeatures();
    if (!features || features.length === 0) return;
    const data = this.renderData(features);
    if (this.options.renderType === 'canvas') {
      if (!this._layer) {
        this._layer = new SimpleHeat(this._canvas);
      }
      this._layer.radius(this.options['radius'] || this._layer.defaultRadius, this.options['blur']);
      if (this.options['gradient']) {
        this._layer.gradient(this.options['gradient']);
      }
      this._layer.max(this.options['max']);
      this._layer.data(data);
      this._layer.draw(this.options['minOpacity']);
      if (!this._isRendered) {
        this.once('precompose', this._layer.draw.bind(this._layer, this.options['minOpacity']), this);
        this._isRendered = true;
      }
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
    this.on('precompose', this.redraw.bind(this), this);
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
