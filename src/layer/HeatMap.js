import ol from 'openlayers';
import simpleheat from 'simpleheat';
import CanvasLayer from './CanvasLayer';

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
  'minOpacity': 0.05
};

class HeatMap extends CanvasLayer {
  constructor (datas, options = {}) {
    super(Object.assign(options_, options));

    this._features = datas || [];
  }

  getFeatures () {
    return this._features;
  }

  setFeatures (features) {
    this._features = features || [];
    return this.render();
  }

  addFeature (feature) {
    if (!feature) {
      return this;
    }
    if (feature[0] && Array.isArray(feature[0])) {
      // maptalks.Util.pushIn(this._heats, feature);
    } else {
      this._features.push(feature);
    }
    return this.render();
  }

  render () {
    if (!this._layer) {
      this._layer = simpleheat(this._canvas);
    }
    this._layer.radius(this.options['radius'] || this._layer.defaultRadius, this.options['blur']);
    if (this.options['gradient']) {
      this._layer.gradient(this.options['gradient']);
    }
    this._layer.max(this.options['max']);
    const features = this.getFeatures();
    if (!features || features.length === 0) return;
    const data = this.renderData(features);
    this._layer.data(data).draw(this.options['minOpacity']);
    return this;
  }

  renderData (features) {
    return features.map(feature => {
      const pixel = this.getMap().getPixelFromCoordinate([feature[0], feature[1]]);
      return [...pixel, feature[2]];
    });
  }

  // draw() {
  //   const map = this.getMap(),
  //     layer = this.layer,
  //     extent = map.getContainerExtent();
  //   let maskExtent = this.prepareCanvas(),
  //     displayExtent = extent;
  //   this._heater.max(layer.options['max']);
  //   //a cache of heat points' viewpoints.
  //   if (!this._heatViews) {
  //     this._heatViews = [];
  //   }
  //
  //   const heats = layer.getData();
  //   if (heats.length === 0) {
  //     this.completeRender();
  //     return;
  //   }
  //   const data = this._heatData(heats, displayExtent);
  //   this._heater.data(data).draw(layer.options['minOpacity']);
  //   this.completeRender();
  // }
  //
  // _heatData(heats, displayExtent) {
  //   const map = this.getMap(),
  //     layer = this.layer;
  //   const projection = map.getProjection();
  //   const data = [],
  //     r = this._heater._r,
  //     max = layer.options['max'] === undefined ? 1 : layer.options['max'],
  //     maxZoom = maptalks.Util.isNil(layer.options['maxZoom']) ? map.getMaxZoom() : layer.options['maxZoom'],
  //     v = 1 / Math.pow(2, Math.max(0, Math.min(maxZoom - map.getZoom(), 12))),
  //     cellSize = r / 2,
  //     grid = [],
  //     panePos = map.offsetPlatform(),
  //     offsetX = panePos.x % cellSize,
  //     offsetY = panePos.y % cellSize;
  //   let heat, p, alt, cell, x, y, k;
  //   displayExtent = displayExtent.expand(r).convertTo(c => new maptalks.Point(map._containerPointToPrj(c)));
  //   this._heatRadius = r;
  //   for (let i = 0, l = heats.length; i < l; i++) {
  //     heat = heats[i];
  //     if (!this._heatViews[i]) {
  //       this._heatViews[i] = projection.project(new maptalks.Coordinate(heat[0], heat[1]));
  //     }
  //     p = this._heatViews[i];
  //     if (displayExtent.contains(p)) {
  //       p = map._prjToContainerPoint(p);
  //       x = Math.floor((p.x - offsetX) / cellSize) + 2;
  //       y = Math.floor((p.y - offsetY) / cellSize) + 2;
  //
  //       alt =
  //         heat.alt !== undefined ? heat.alt :
  //           heat[2] !== undefined ? +heat[2] : 1;
  //       k = alt * v;
  //
  //       grid[y] = grid[y] || [];
  //       cell = grid[y][x];
  //
  //       if (!cell) {
  //         grid[y][x] = [p.x, p.y, k];
  //
  //       } else {
  //         cell[0] = (cell[0] * cell[2] + (p.x) * k) / (cell[2] + k); // x
  //         cell[1] = (cell[1] * cell[2] + (p.y) * k) / (cell[2] + k); // y
  //         cell[2] += k; // cumulated intensity value
  //       }
  //     }
  //   }
  //   for (let i = 0, l = grid.length; i < l; i++) {
  //     if (grid[i]) {
  //       for (let j = 0, ll = grid[i].length; j < ll; j++) {
  //         cell = grid[i][j];
  //         if (cell) {
  //           data.push([
  //             Math.round(cell[0]),
  //             Math.round(cell[1]),
  //             Math.min(cell[2], max)
  //           ]);
  //         }
  //       }
  //     }
  //   }
  //   return data;
  // }

  isEmpty () {
    return !this._features.length;
  }

  clear () {
    this._features = [];
    this.render();
    return this;
  }
}

ol.layer.HeatMap = HeatMap;
export default HeatMap;
