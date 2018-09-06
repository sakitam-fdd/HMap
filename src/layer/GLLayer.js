import kdbush from 'kdbush';
import ol from 'openlayers';
import {createCanvas} from '../utils';

const _options = {
  pickable: true,
  id: '',
  fp64: false,
  sphere: 6378137,
  projection: 'EPSG:3857',
  ratio: 1,
  autoHighlight: true
};

class GLLayer extends ol.layer.Image {
  constructor (options = {}) {
    options = Object.assign(_options, options);
    super(options);

    /**
     * this canvas
     * @type {null}
     * @private
     */
    this._canvas = null;

    /**
     * context
     * @type {null}
     * @private
     */
    this._context = null;

    /**
     * style
     * @type {null}
     * @private
     */
    this._style = null;

    /**
     * features
     * @type {Array}
     */
    this.features = [];

    /**
     * options
     * @type {{}}
     */
    this.options = options;

    /**
     * 计算工具
     * @type {ol.Sphere}
     */
    this.wgs84Sphere = new ol.Sphere(
      typeof this.options['sphere'] === 'number'
        ? this.options['sphere']
        : 6378137
    );

    this.setSource(
      new ol.source.ImageCanvas({
        logo: options.logo,
        state: options.state,
        attributions: options.attributions,
        resolutions: options.resolutions,
        canvasFunction: this.canvasFunction.bind(this),
        projection: options.projection,
        ratio: options.ratio
      })
    );

    this.setStyle(options.style);

    this.on('precompose', this.redraw, this);
  }

  addFeature (feature) {
    this.features.push(feature);
  }

  addFeatures (features) {
    this.features = this.features.concat(features);
    this.originData = kdbush(this.features, (p) => p.getGeometry().getCoordinates()[0], (p) => p.getGeometry().getCoordinates()[1]);
  }

  getFeatures () {
    return this.features;
  }

  getFeatureById (id) {
    //
  }

  getStyle () {
    return this._style;
  }

  /**
   * return style
   * @param style
   */
  setStyle (style) {
    this._style = style;
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
    return this._canvas.getContext('webgl2');
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
    const width = size[0];
    const height = size[1];
    if (!this._canvas) {
      this._canvas = createCanvas(width, height);
    } else {
      this._canvas.width = width;
      this._canvas.height = height;
    }
    if (resolution <= this.get('maxResolution')) {
      this.render(extent, resolution, pixelRatio, size, projection);
    } else {
      // console.warn('超出所设置最大分辨率！')
    }
    return this._canvas;
  }

  /**
   * set map
   * @param map
   */
  setMap (map) {
    this.set('originMap', map);
    // super.setMap.call(this, map)
  }

  /**
   * get map
   */
  getMap () {
    return this.get('originMap');
  }

  clearLayer () {
    if (!this.glLayer) {
      return;
    }
    const layerManager = this.glLayer.layerManager;
    layerManager && layerManager.context.gl.clear(layerManager.context.gl.COLOR_BUFFER_BIT);
    return this;
  }

  /**
   * render
   * @param extent
   * @param resolution
   * @param pixelRatio
   * @param size
   * @param projection
   */
  render (extent, resolution, pixelRatio, size, projection) {
    if (!this.layers) {
      this.layers = this.options.layers;
    } else {
      this.clearLayer();
    }
    this._renderer(extent, resolution, pixelRatio, size, projection);
  }

  /**
   * renderer
   * @param extent
   * @param resolution
   * @param pixelRatio
   * @param size
   * @param projection
   * @private
   */
  _renderer (extent, resolution, pixelRatio, size, projection) {
    const map = this.getMap();
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      const center = view.getCenter();
      const nCenter = ol.proj.transform(center, view.getProjection(), 'EPSG:4326');
      const _props = {
        // width: size[0], // Number, required
        // height: size[1],
        layers: this.layers,
        gl: this._canvas.getContext('webgl2'),
        // layerFilter: ({layer, viewport, isPicking}) => true,
        initialViewState: {
          latitude: nCenter[1],
          longitude: nCenter[0],
          zoom: zoom,
          bearing: 0,
          pitch: 0,
          maxZoom: 16
        }
      };
      if (!this.glLayer) {
        this.glLayer = new deck.Deck(_props); // eslint-disable-line
      } else {
        this.glLayer.setProps(Object.assign({
          viewState: _props.initialViewState
        }, _props));
      }
    }
  }

  transformRadius (
    center,
    meterRadius
  ) {
    try {
      let lastCoords = this.wgs84Sphere.offset(
        center,
        meterRadius,
        (270 / 360) * 2 * Math.PI
      ); // 计算偏移量
      let [ptx, pty] = [center[0] - lastCoords[0], center[1] - lastCoords[1]];
      return Math.sqrt(Math.pow(ptx, 2) + Math.pow(pty, 2));
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 获取最近的要素
   * @param coords
   * @param tolerance
   * @returns {*}
   */
  getClosestPoint (coords, tolerance) {
    const radius_ = this.transformRadius(coords, tolerance);
    return this.originData.within(...coords, radius_).map((id) => this.features[id]);
  }
}

ol.layer.GLLayer = GLLayer;

export default GLLayer;
