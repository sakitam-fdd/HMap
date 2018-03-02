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

class CanvasLayer extends ol.layer.Image {
  constructor (options = {}) {
    super(options)

    /**
     * this canvas
     * @type {null}
     * @private
     */
    this._canvas = null

    this.setSource(new ol.source.ImageCanvas({
      logo: options.logo,
      state: options.state,
      attributions: options.attributions,
      resolutions: options.resolutions,
      canvasFunction: this.canvasFunction.bind(this),
      projection: (options.hasOwnProperty('projection') ? options.projection : 'EPSG:3857'),
      ratio: (options.hasOwnProperty('ratio') ? options.ratio : 1)
    }))

    this.on('precompose', this.redraw, this)
    this.on('postcompose', this._canvasUpdate, this)
  }

  /**
   * re-draw
   */
  redraw () {
    if (!this) return
    const _extent = this.getExtent() || this.getMapExtent()
    this.setExtent(_extent)
  }

  /**
   * canvas update
   * @param event
   * @private
   */
  _canvasUpdate (event) {
    const res = event.frameState.viewState.resolution
    if (res <= this.get('maxResolution')) {
      let ratio = event.frameState.pixelRatio
      const ctx = event.context
      const context = this.getContext()
      let matrix = this.matrix_ = event.frameState.coordinateToPixelTransform
      if (!matrix) {
        matrix = event.frameState.coordinateToPixelMatrix
        matrix[2] = matrix[4]
        matrix[3] = matrix[5]
        matrix[4] = matrix[12]
        matrix[5] = matrix[13]
      }
      ctx.save()
      ctx.scale(ratio, ratio)
      this.get('render') && this.get('render')(event, context)
      ctx.restore()
    } else {
      // console.warn('超出所设置最大分辨率！')
    }
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
   */
  getMapExtent () {
    if (!this.getMap()) return
    const size = this.getMap().getSize()
    const _view = this.getMap().getView()
    return (_view && _view.calculateExtent(size))
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
    return this._canvas
  }

  /**
   * set map
   * @param map
   */
  setMap (map) {
    ol.layer.Image.prototype.setMap.call(this, map)
  }

  /**
   * get map
   */
  getMap () {
    return this.get('map')
  }
}

ol.layer.CanvasLayer = CanvasLayer
export default CanvasLayer
