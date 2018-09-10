import ol from 'openlayers';
import { createCanvas } from '../utils';

class CanvasLayer extends ol.layer.Image {
  constructor (options = {}) {
    super(options);

    /**
     * this canvas
     * @type {null}
     * @private
     */
    this._canvas = null;

    /**
     * options
     * @type {{}}
     */
    this.options = options;

    this.setSource(
      new ol.source.ImageCanvas({
        logo: options.logo,
        state: options.state,
        attributions: options.attributions,
        resolutions: options.resolutions,
        canvasFunction: this.canvasFunction.bind(this),
        projection: options.hasOwnProperty('projection')
          ? options.projection
          : 'EPSG:3857',
        ratio: options.hasOwnProperty('ratio') ? options.ratio : 1
      })
    );

    this.on('precompose', this.redraw, this);
  }

  /**
   * re-draw
   */
  redraw () {
    const _extent = this.options.extent || this._getMapExtent();
    this.setExtent(_extent);
  }

  /**
   * get context
   * @returns {*|CanvasRenderingContext2D|WebGLRenderingContext|ol.webgl.Context}
   */
  getContext () {
    return this._canvas.getContext(this.get('context') || '2d');
  }

  /**
   * get map current extent
   * @returns {ol.View|*|Array<number>}
   * @private
   */
  _getMapExtent () {
    if (!this.getMap()) return;
    const size = this._getMapSize();
    const _view = this.getMap().getView();
    return _view && _view.calculateExtent(size);
  }

  /**
   * get size
   * @private
   */
  _getMapSize () {
    if (!this.getMap()) return;
    return this.getMap().getSize();
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
      const context = this.getContext();
      this.render({
        context: context,
        extent: extent,
        size: size,
        pixelRatio: pixelRatio,
        projection: projection
      });
      this.get('render') &&
        this.get('render')({
          context: context,
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

  render () {}

  /**
   * set map
   * @param map
   */
  setMap (map) {
    ol.layer.Image.prototype.setMap.call(this, map);
  }

  /**
   * get map
   */
  getMap () {
    return this.get('map');
  }
}

ol.layer.CanvasLayer = CanvasLayer;
export default CanvasLayer;
