import ol from 'openlayers'

/**
 * create canvas
 * @param width
 * @param height
 * @param Canvas
 * @returns {HTMLCanvasElement}
 */
const createCanvas = (width, height, Canvas) => {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  } else {
    // create a new canvas instance in node.js
    // the canvas class needs to have a default constructor without any parameter
    return new Canvas(width, height)
  }
}

class DozensLayer extends ol.layer.Image {
  constructor (options = {}) {
    super(options)

    /**
     * this canvas
     * @type {null}
     * @private
     */
    this._canvas = null

    /**
     * context
     * @type {null}
     * @private
     */
    this._context = null

    /**
     * style
     * @type {null}
     * @private
     */
    this._style = null

    /**
     * features
     * @type {Array}
     */
    this.features = []

    /**
     * options
     * @type {{}}
     */
    this.options = options

    this.setSource(new ol.source.ImageCanvas({
      logo: options.logo,
      state: options.state,
      attributions: options.attributions,
      resolutions: options.resolutions,
      canvasFunction: this.canvasFunction.bind(this),
      projection: (options.hasOwnProperty('projection') ? options.projection : 'EPSG:3857'),
      ratio: (options.hasOwnProperty('ratio') ? options.ratio : 1)
    }))

    this.setStyle(options.style)

    this.on('precompose', this.redraw, this)
  }

  addFeature (feature) {
    this.features.push(feature)
  }

  addFeatures (features) {
    this.features = this.features.concat(features)
  }

  getFeatures () {
    return this.features
  }

  getFeatureById (id) {
    //
  }

  getStyle () {
    return this._style
  }

  /**
   * return style
   * @param style
   */
  setStyle (style) {
    this._style = style
  }

  _drawFeature () {
    const that = this
    if (!this.getMap()) return
    if (!this._context) this._context = this.getContext()
    const _length = this.features.length
    const imageStyle = that._style.getImage()
    function render_ (beauty) {
      for (let i = 0; i < _length; i++) {
        const geometry = that.features[i].getGeometry()
        const coordinates = geometry && geometry.getCoordinates()
        if (coordinates) {
          const pixel = that.getMap().getPixelFromCoordinate(coordinates)
          const imageStyle = that._style.getImage()
          if (imageStyle) {
            // imageStyle.load()
          }
          const size = imageStyle.getSize()
          that._context.drawImage(beauty, pixel[0], pixel[1], size[0], size[1])
        }
      }
    }
    if (imageStyle) {
      const beauty = new Image()
      beauty.src = imageStyle.getSrc()
      if (beauty.complete) {
        render_(beauty)
      }
    }
  }

  /**
   * re-draw
   */
  redraw () {
    const _extent = this.options.extent || this._getMapExtent()
    this.setExtent(_extent)
  }

  /**
   * get context
   * @returns {*|CanvasRenderingContext2D|WebGLRenderingContext|ol.webgl.Context}
   */
  getContext () {
    return this._canvas.getContext(this.get('context') || '2d')
  }

  /**
   * get map current extent
   * @returns {ol.View|*|Array<number>}
   * @private
   */
  _getMapExtent () {
    if (!this.getMap()) return
    const size = this._getMapSize()
    const _view = this.getMap().getView()
    return _view && _view.calculateExtent(size)
  }

  /**
   * get size
   * @private
   */
  _getMapSize () {
    if (!this.getMap()) return
    return this.getMap().getSize()
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
      this._canvas = createCanvas(size[0], size[1])
    } else {
      this._canvas.width = size[0]
      this._canvas.height = size[1]
    }
    if (resolution <= this.get('maxResolution')) {
      const context = this.getContext()
      this._drawFeature()
      this.get('render') && this.get('render')({
        context: context,
        extent: extent,
        size: size,
        pixelRatio: pixelRatio,
        projection: projection
      })
    } else {
      // console.warn('超出所设置最大分辨率！')
    }
    return this._canvas
  }

  /**
   * set map
   * @param map
   */
  setMap (map) {
    this.set('originMap', map)
    // super.setMap.call(this, map)
  }

  /**
   * get map
   */
  getMap () {
    return this.get('originMap')
  }
}

ol.layer.DozensLayer = DozensLayer
export default DozensLayer
