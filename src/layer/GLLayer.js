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
    options = Object.assign(options, _options);
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
    return this._canvas.getContext('gl');
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
    if (!this.glRender) {
      this.glRender = new deck.IconLayer({ // eslint-disable-line
        id: this.options.id || '',
        data: this.features || [],
        fp64: this.options.fp64,
        pickable: this.options.pickable,
        autoHighlight: this.options.autoHighlight,
        iconAtlas: this.options.imageSrc,
        iconMapping: {
          marker: {
            x: 0,
            y: 0,
            width: 128,
            height: 128,
            anchorY: 128,
            mask: true
          }
        },
        sizeScale: 15,
        getPosition (point) {
          if (!point) {
            return [0, 0, 0];
          }
          let geometry = point && point.getGeometry();
          let coordinates = geometry && geometry.getCoordinates();
          return coordinates && [coordinates[0], coordinates[1], 0];
        },
        getIcon: d => 'marker',
        getSize: d => 5,
        getColor: d => [Math.sqrt(d.exits), 140, 0],
        getAngle: d => 0,
        onHover: ({object}) => {
          console.log(object);
        },
        onClick: ({object}) => {
          console.log(object);
        }
      });
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
      this.features = this.originData.range(...extent).map((id) => this.features[id]);
      const nCenter = ol.proj.transform(center, view.getProjection(), 'EPSG:4326');
      const _props = {
        width: size[0], // Number, required
        height: size[1],
        layers: [
          this.glRender
        ],
        canvas: this._canvas,
        // gl: this._canvas.getContext('webgl'),
        useDevicePixels: true,
        controller: false,
        _customRender: true,
        initialViewState: {
          latitude: nCenter[0],
          longitude: nCenter[1],
          zoom: zoom,
          bearing: 0,
          pitch: 0
        }
      };
      if (!this.glLayer) {
        this.glLayer = new deck.Deck(_props); // eslint-disable-line
      } else {
        this.glLayer.setProps(_props);
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
