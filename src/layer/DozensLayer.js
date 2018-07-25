import kdbush from 'kdbush';
import ol from 'openlayers';

/**
 * create canvas
 * @param width
 * @param height
 * @param Canvas
 * @returns {HTMLCanvasElement}
 */
const createCanvas = (width, height, Canvas) => {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  } else {
    // create a new canvas instance in node.js
    // the canvas class needs to have a default constructor without any parameter
    return new Canvas(width, height);
  }
};

class DozensLayer extends ol.layer.Image {
  constructor (options = {}) {
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
        projection: options.hasOwnProperty('projection')
          ? options.projection
          : 'EPSG:3857',
        ratio: options.hasOwnProperty('ratio') ? options.ratio : 1
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
   * draw feature
   * @param extent
   * @param pixelRatio
   * @private
   */
  _drawFeature (extent, pixelRatio) {
    const that = this;
    if (!this.getMap()) return;
    if (!this._context) this._context = this.getContext();
    const imageStyle = that._style.getImage();
    if (imageStyle) {
      const _image = new Image();
      _image.src = imageStyle.getSrc();
      if (_image.complete) {
        this.render_(_image, extent, pixelRatio);
      } else {
        _image.onload = function () {
          that.render_(_image, extent, pixelRatio);
        };
        _image.onerror = function () {
        };
      }
    }
  }

  /**
   * render
   * @param _image
   * @param extent
   * @param pixelRatio
   * @private
   */
  render_ (_image, extent, pixelRatio) {
    const viewFeature = this.originData.range(...extent).map((id) => this.features[id]);
    const _length = viewFeature.length;
    const _scale = this._style.getImage().getScale() || 1;
    const _anchor = this._style.getImage().getAnchor() || [0.5, 0.5];
    for (let i = 0; i < _length; i++) {
      const geometry = viewFeature[i].getGeometry();
      const coordinates = geometry && geometry.getCoordinates();
      if (coordinates) {
        const pixel = this.getMap().getPixelFromCoordinate(coordinates);
        const imageStyle = this._style.getImage();
        if (imageStyle) {
          // imageStyle.load()
        }
        const size = imageStyle.getSize();
        this._context.drawImage(_image, (pixel[0] - _anchor[0]) * pixelRatio, (pixel[1] - _anchor[1]) * pixelRatio, size[0] * _scale * pixelRatio, size[1] * _scale * pixelRatio);
      }
    }
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
      this._canvas = createCanvas(size[0], size[1]);
    } else {
      this._canvas.width = size[0];
      this._canvas.height = size[1];
    }
    if (resolution <= this.get('maxResolution')) {
      const context = this.getContext();
      this._drawFeature(extent, pixelRatio);
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

ol.layer.DozensLayer = DozensLayer;
export default DozensLayer;
