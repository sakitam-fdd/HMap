/**
 * Created by FDD on 2017/10/11.
 * @desc 比例尺控件
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME, UNITS} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'
ol.control.ScaleLineH = function (options = {}) {
  const className = options.className !== undefined ? options.className : 'hmap-scale-line-control'

  /**
   * @private
   * @type {Element}
   */
  this.element_ = htmlUtils.create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))

  /**
   * @private
   * @type {Element}
   */
  this.innerElement_ = htmlUtils.create('div', (className + '-inner'), this.element_)

  /**
   * @private
   * @type {?olx.ViewState}
   */
  this.viewState_ = null

  /**
   * @private
   * @type {number}
   */
  this.minWidth_ = options.minWidth !== undefined ? options.minWidth : 64

  /**
   * @private
   * @type {boolean}
   */
  this.renderedVisible_ = false

  /**
   * @private
   * @type {number|undefined}
   */
  this.renderedWidth_ = undefined

  /**
   * @private
   * @type {string}
   */
  this.renderedHTML_ = ''

  const render = options.render ? options.render : ol.control.ScaleLineH.render

  ol.control.Control.call(this, {
    element: this.element_,
    render: render,
    target: options.target
  })
  Events.listen(this, 'change:' + ol.control.ScaleLineH.Property_.UNITS, this.handleUnitsChanged_, this)
  this.setUnits((options.units) || ol.control.ScaleLineH.ScaleLineUnits.METRIC)
}

ol.inherits(ol.control.ScaleLineH, ol.control.Control)

/**
 * @const
 * @type {Array.<number>}
 */
ol.control.ScaleLineH.LEADING_DIGITS = [1, 2, 5]

/**
 * 内置单位
 * @type {{DEGREES: string, IMPERIAL: string, NAUTICAL: string, METRIC: string, CHINESEMETRIC: string, US: string}}
 */
ol.control.ScaleLineH.ScaleLineUnits = {
  DEGREES: 'degrees',
  IMPERIAL: 'imperial',
  NAUTICAL: 'nautical',
  METRIC: 'metric',
  CHINESEMETRIC: 'metric_cn',
  US: 'us'
}

/**
 * 返回比例尺使用的单位
 * @returns {*}
 */
ol.control.ScaleLineH.prototype.getUnits = function () {
  return (this.get(ol.control.ScaleLineH.Property_.UNITS))
}

/**
 * 更新element
 * @param mapEvent
 */
ol.control.ScaleLineH.render = function (mapEvent) {
  let frameState = mapEvent.frameState
  if (!frameState) {
    this.viewState_ = null
  } else {
    this.viewState_ = frameState.viewState
  }
  this.updateElement_()
}

/**
 * 处理单位变化事件
 * @private
 */
ol.control.ScaleLineH.prototype.handleUnitsChanged_ = function () {
  this.updateElement_()
}

/**
 * 设置使用的单位
 * @param units
 */
ol.control.ScaleLineH.prototype.setUnits = function (units) {
  this.set(ol.control.ScaleLineH.Property_.UNITS, units)
}

/**
 * 更新element
 * @private
 */
ol.control.ScaleLineH.prototype.updateElement_ = function () {
  let viewState = this.viewState_
  if (!viewState) {
    if (this.renderedVisible_) {
      this.element_.style.display = 'none'
      this.renderedVisible_ = false
    }
    return
  }
  let [center, projection] = [viewState.center, viewState.projection]
  let units = this.getUnits()
  let pointResolutionUnits = units === ol.control.ScaleLineH.ScaleLineUnits.DEGREES ? UNITS.DEGREES : UNITS.METERS
  let pointResolution = ol.proj.getPointResolution(projection, viewState.resolution, center, pointResolutionUnits)
  let nominalCount = this.minWidth_ * pointResolution
  let suffix = ''
  if (units === ol.control.ScaleLineH.ScaleLineUnits.DEGREES) {
    let metersPerDegree = ol.proj.METERS_PER_UNIT[UNITS.DEGREES]
    if (projection.getUnits() === UNITS.DEGREES) {
      nominalCount *= metersPerDegree
    } else {
      pointResolution /= metersPerDegree
    }
    if (nominalCount < metersPerDegree / 60) {
      suffix = '\u2033' // seconds
      pointResolution *= 3600
    } else if (nominalCount < metersPerDegree) {
      suffix = '\u2032' // minutes
      pointResolution *= 60
    } else {
      suffix = '\u00b0' // degrees
    }
  } else if (units === ol.control.ScaleLineH.ScaleLineUnits.IMPERIAL) {
    if (nominalCount < 0.9144) {
      suffix = 'in'
      pointResolution /= 0.0254
    } else if (nominalCount < 1609.344) {
      suffix = 'ft'
      pointResolution /= 0.3048
    } else {
      suffix = 'mi'
      pointResolution /= 1609.344
    }
  } else if (units === ol.control.ScaleLineH.ScaleLineUnits.NAUTICAL) {
    pointResolution /= 1852
    suffix = 'nm'
  } else if (units === ol.control.ScaleLineH.ScaleLineUnits.METRIC) {
    if (nominalCount < 0.001) {
      suffix = 'μm'
      pointResolution *= 1000000
    } else if (nominalCount < 1) {
      suffix = 'mm'
      pointResolution *= 1000
    } else if (nominalCount < 1000) {
      suffix = 'm'
    } else {
      suffix = 'km'
      pointResolution /= 1000
    }
  } else if (units === ol.control.ScaleLineH.ScaleLineUnits.US) {
    if (nominalCount < 0.9144) {
      suffix = 'in'
      pointResolution *= 39.37
    } else if (nominalCount < 1609.344) {
      suffix = 'ft'
      pointResolution /= 0.30480061
    } else {
      suffix = 'mi'
      pointResolution /= 1609.3472
    }
  } else if (units === ol.control.ScaleLineH.ScaleLineUnits.CHINESEMETRIC) {
    if (nominalCount < 0.001) {
      suffix = '微米'
      pointResolution *= 1000000
    } else if (nominalCount < 1) {
      suffix = '毫米'
      pointResolution *= 1000
    } else if (nominalCount < 1000) {
      suffix = '米'
    } else {
      suffix = '千米'
      pointResolution /= 1000
    }
  } else {
    ol.asserts.assert(false, 33) // Invalid units
  }

  let i = 3 * Math.floor(Math.log(this.minWidth_ * pointResolution) / Math.log(10))
  let [count, width] = []
  while (true) {
    count = ol.control.ScaleLineH.LEADING_DIGITS[((i % 3) + 3) % 3] * Math.pow(10, Math.floor(i / 3))
    width = Math.round(count / pointResolution)
    if (isNaN(width)) {
      this.element_.style.display = 'none'
      this.renderedVisible_ = false
      return
    } else if (width >= this.minWidth_) {
      break
    }
    ++i
  }
  let html = count + ' ' + suffix
  if (this.renderedHTML_ !== html) {
    this.innerElement_.innerHTML = html
    this.renderedHTML_ = html
  }
  if (this.renderedWidth_ !== width) {
    this.innerElement_.style.width = width + 'px'
    this.renderedWidth_ = width
  }
  if (!this.renderedVisible_) {
    this.element_.style.display = ''
    this.renderedVisible_ = true
  }
}

/**
 * @enum {string}
 * @private
 */
ol.control.ScaleLineH.Property_ = {
  UNITS: 'units'
}

const olControlScaleLine = ol.control.ScaleLineH
export default olControlScaleLine
