import ol from 'openlayers';
import ParticleLayer from './ParticleLayer';

/**
 * magnitude
 * @param coordinates
 * @returns {number}
 */
const mag = (coordinates) => {
  return Math.sqrt(coordinates[0] * coordinates[0] + coordinates[1] * coordinates[1]);
};

/**
 * 2次曲线
 * @param p0
 * @param p1
 * @param p2
 * @param t
 * @returns {number}
 */
const quadraticAt = (p0, p1, p2, t) => {
  const onet = 1 - t;
  return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
};

const options_ = {
  animation: false,
  animationDuration: 6000,
  animationOnce: false,
  animationRandom: false,
  curveness: 0,
  trail: 20,
  globalCompositeOperation: 'lighter'
};

const defaultSymbol = {
  lineColor: 'rgba(2, 166, 253, 0.03)',
  lineWidth: 2
};

class ODLineLayer extends ParticleLayer {
  constructor (datas, options) {
    super(datas, Object.assign(options_, options));

    /**
     * 计算工具
     * @type {ol.Sphere}
     */
    this.wgs84Sphere = new ol.Sphere(
      typeof this.options['sphere'] === 'number'
        ? this.options['sphere']
        : 6378137
    );
  }

  render () {
    this._prepareData();
    if (!this.options['animation']) {
      this._drawLines();
    }
    super.render();
  }

  getParticles (t) {
    const map = this.getMap();
    if (!this._animStartTime) {
      this._animStartTime = Date.now();
    }
    const elapsed = t - this._animStartTime;
    const duration = this.options['animationDuration'];
    if (this.options['animationOnce'] && elapsed > duration) {
      return [];
    }
    const symbol = this.options['symbol'] || defaultSymbol;
    let r = (elapsed % duration) / duration;
    const particles = [];
    let points, x, y, style;
    let p0, p1, cp;
    for (let i = 0, l = this._dataToDraw.length; i < l; i++) {
      if (this.options['animationRandom']) {
        r = ((t - this._animStartTime - this._dataToDraw[i]['time']) % duration) / duration;
        if (r < 0) {
          r = 0;
        }
      }
      if (r > 0) {
        points = this._dataToDraw[i]['points'];
        style = symbol;
        p0 = points[0];
        p1 = points[1];
        if (points[2]) {
          cp = points[2];
          x = quadraticAt(p0[0], cp[0], p1[0], r);
          y = quadraticAt(p0[1], cp[1], p1[1], r);
        } else {
          x = p0[0] + r * (p1[0] - p0[0]);
          y = p0[1] + r * (p1[1] - p0[1]);
        }
        particles.push({
          coordinates: map.getCoordinateFromPixel([x, y]),
          radius: (style['lineWidth'] || 3) / 2,
          color: style['lineColor']
        });
      }
    }
    return particles;
  }

  _drawLines () {
    const ctx = this.getContext();
    if (!this._dataToDraw) {
      return;
    }
    const empty = {};
    const symbol = this.options['symbol'] || defaultSymbol;
    let points, style;
    let p0, p1, p2;
    ctx.lineCap = 'round';
    for (let i = 0, l = this._dataToDraw.length; i < l; i++) {
      points = this._dataToDraw[i].points;
      style = empty;
      ctx.strokeStyle = style['lineColor'] || symbol['lineColor'] || 'rgba(255, 255, 255, 0.01)'; // 'rgba(135, 196, 240, 0.1)';
      ctx.lineWidth = style['lineWidth'] || symbol['lineWidth'] || 1;
      ctx.beginPath();
      p0 = points[0];
      ctx.moveTo(p0[0], p0[1]);
      p1 = points[1];
      if (points[2]) {
        p2 = points[2];
        // quadradic curve
        ctx.quadraticCurveTo(p2[0], p2[1], p1[0], p1[1]);
      } else {
        ctx.lineTo(p1[0], p1[1]);
      }
      ctx.stroke();
    }
  }

  _prepareData () {
    const map = this.getMap();
    const features = this.getFeatures();
    if (!features) return;
    const curveness = this.options['curveness'];
    const dataToDraw = [];
    let p1, p2;
    for (let i = 0, l = features.length; i < l; i++) {
      p1 = map.getPixelFromCoordinate(features[i].coordinates[0]);
      p2 = map.getPixelFromCoordinate(features[i].coordinates[1]);
      const points = [p1, p2];
      if (curveness) {
        const distance = this._mathDistance(features[i].coordinates[0], features[i].coordinates[1]);
        let normal = [
          p1[0] - p2[0],
          p1[1] - p2[1]
        ];
        const _mag = mag(normal);
        const _x = normal[0] * (1 / _mag);
        const _y = normal[1] * (1 / _mag);
        normal = [-_y, _x];
        const middle = [
          (p1[0] + p2[0]) / 2,
          (p1[1] + p2[1]) / 2
        ];
        const curveLen = curveness * distance;
        points.push([
          middle[0] + curveLen * normal[0],
          middle[1] + curveLen * normal[1]
        ]);
      }
      dataToDraw.push({
        points: points,
        time: Math.random() * this.options['animationDuration']
      });
    }
    this._dataToDraw = dataToDraw;
  }

  _mathDistance (start, end) {
    const c1 = ol.proj.transform(start, this._getProjectionCode(), 'EPSG:4326');
    const c2 = ol.proj.transform(end, this._getProjectionCode(), 'EPSG:4326');
    return this.wgs84Sphere.haversineDistance(c1, c2);
  }

  _getProjectionCode () {
    let code = '';
    if (this.getMap()) {
      code = this.getMap()
        .getView()
        .getProjection()
        .getCode();
    } else {
      code = 'EPSG:3857';
    }
    return code;
  };
}

ol.layer.ODLineLayer = ODLineLayer;

export default ODLineLayer;
