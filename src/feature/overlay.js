/**
 * Created by FDD on 2017/9/18.
 * @desc 用于dom标绘（包含自定义dom或者iconfont）
 */
import mixin from '../utils/mixins'
import * as htmlUtils from 'nature-dom-util/src/utils/domUtils'
import { trim } from '../utils/utils'
import Feature from '../feature/feature'
class Overlay extends mixin(Feature) {

  /**
   * 添加字体图标要素
   * @param point
   * @param params
   * @param index
   */
  addOverlayPoint (point, params, index) {
    try {
      if (point && point['geometry']) {
        let geom_ = this.getGeomFromGeomData(point, params)
        if (geom_ && geom_.getCoordinates) {
          let coordinate = geom_.getCoordinates()
          if (point['attributes'] && (point['attributes']['id'] || point['attributes']['ID'])) {
            let id = (point['attributes']['id'] || point['attributes']['ID'] || params['id'])
            let overlay = this.map.getOverlayById(id)
            let creatEle = this.getElementForOverlay(point, params, index)
            let [marker, ele] = [creatEle['marker'], creatEle['ele']]
            if (!overlay) {
              let iconOverlay = new ol.Overlay({
                element: marker,
                positioning: 'center-center',
                id: id,
                offset: [0, 0],
                stopEvent: true
              })
              iconOverlay.setPosition(coordinate)
              iconOverlay.setProperties(point['attributes'])
              if (params) {
                iconOverlay.set('params', params)
                if (params['layerName']) {
                  iconOverlay.set('layerName', params.layerName)
                }
              }
              this._addOverLayEvent(marker, ele, iconOverlay)
              this.map.addOverlay(iconOverlay)
            } else {
              this._addOverLayEvent(marker, ele, overlay)
              overlay.setElement(marker)
            }
          }
          if (params['zoomToExtent']) {
            let extent = (new ol.geom.Point(coordinate)).getExtent()
            if (params['view'] && params['view']['adjustExtent']) {
              extent = this.adjustExtent(extent, params['view'])
            }
            this.zoomToExtent(extent, true)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 添加要素事件
   * @param marker
   * @param ele
   * @param OverLay
   * @private
   */
  _addOverLayEvent (marker, ele, OverLay) {
    let that = this
    marker.onmousedown = function (event) {
      if (event.button === 2) {
        that.dispatch('overlay:onmouseright', {
          type: 'overlay:onmouseright',
          originEvent: event,
          value: OverLay
        })
      } else if (event.button === 0) {
        that.dispatch('overlay:onmouseleft', {
          type: 'overlay:onmouseleft',
          originEvent: event,
          value: OverLay
        })
      }
      that.dispatch('overlay:click', {
        type: 'overlay:click',
        originEvent: event,
        value: OverLay
      })
    }
    marker.onmouseover = function (event) {
      ele.style.color = ele.selectColor
      that.dispatch('overlay:onmouseover', {
        type: 'overlay:onmouseover',
        originEvent: event,
        value: OverLay
      })
    }
    marker.onmouseout = function (event) {
      ele.style.color = ele.normalColor
      that.dispatch('overlay:onmouseout', {
        type: 'overlay:onmouseout',
        originEvent: event,
        value: OverLay
      })
    }
  }

  /**
   * 获取OverLay Dom
   * @param point
   * @param params
   * @param index
   * @returns {Element}
   */
  getElementForOverlay (point, params, index) {
    let marker = document.createElement('div')
    marker.className = 'overlay-point-content'
    let style = point['attributes']['style'] || params['style']
    let [ele, spanEle] = ['', '']
    if (style['element']) {
      ele = document.createElement('div')
      let eleClass = (style['element']['className'] ? style['element']['className'] : 'maker-point')
      htmlUtils.addClass(ele, 'iconfont')
      htmlUtils.addClass(ele, eleClass)
      ele.style.top = style['element']['top'] ? style['element']['top'] : '-100%'
      ele.style.left = style['element']['left'] ? style['element']['left'] : '100%'
      ele.style.fontSize = style['element']['fontSize'] ? style['element']['fontSize'] : '16px'
      ele.style.borderColor = style['element']['borderColor'] ? style['element']['borderColor'] : '#2A2A2A'
      ele.style.borderWidth = style['element']['borderWidth'] ? style['element']['borderWidth'] : '1px'
      ele.style.opacity = style['element']['opacity'] ? style['element']['opacity'] : 1
      ele.style.width = style['element']['width'] ? style['element']['width'] : '100%'
      ele.style.height = style['element']['height'] ? style['element']['height'] : '100%'
      ele.style.borderRadius = style['element']['borderRadius'] ? style['element']['borderRadius'] : '0px'
      ele.normalColor = ele.style.color = style['element']['color'] ? style['element']['color'] : '#1b9de8'
      ele.selectColor = style['element']['selectColor'] ? style['element']['selectColor'] : '#F61717'
      ele.innerHTML = style['element']['text'] ? style['element']['text'] : ''
      if (params['orderBy']) {
        spanEle = document.createElement('span')
        spanEle.innerHTML = Number(index) + 1
      } else if (params['orderByNum'] && point['attributes']['number'] !== undefined && point['attributes']['number'] !== '' && point['attributes']['number'] !== null) {
        spanEle = document.createElement('span')
        spanEle.innerHTML = Number(point['attributes']['number']) + 1
      }
      if (spanEle) {
        ele.appendChild(spanEle)
      }
      marker.appendChild(ele)
    }
    return ({
      marker: marker,
      ele: ele
    })
  }

  /**
   * 添加多个OverLay
   * @param points
   * @param params
   */
  addOverlayPoints (points, params) {
    try {
      if (points && Array.isArray(points)) {
        let multiPoint = new ol.geom.MultiPoint([])
        let change = false
        points.forEach((item, index) => {
          if (item && item['geometry']) {
            let _geom = this.getGeomFromGeomData(item, params)
            if (_geom) {
              this.addOverlayPoint(item, params, index)
              multiPoint.appendPoint(_geom)
            }
          }
        })
        if (params['zoomToExtent']) {
          params['zoomToExtent'] = !params['zoomToExtent']
          change = true
        }
        if (change) {
          this._getExtent(multiPoint, params)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 移除overlay
   * @param overlay
   */
  removeOverLay (overlay) {
    try {
      if (overlay && overlay instanceof ol.Overlay && this.map) {
        if (overlay.get('markFeature') && overlay.get('markFeature') instanceof ol.Feature) {
          this.removeFeature(overlay.get('markFeature'))
        }
        this.map.removeOverlay(overlay)
        return overlay
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 通过id移除overlay
   * @param id
   * @returns {ol.Overlay}
   */
  removeOverlayById (id) {
    try {
      if (this.map && id) {
        let _id = trim(id)
        let overLay = this.map.getOverlayById(_id)
        if (overLay && overLay instanceof ol.Overlay) {
          if (overLay.get('markFeature') && overLay.get('markFeature') instanceof ol.Feature) {
            this.removeFeature(overLay.get('markFeature'))
          }
          this.map.removeOverlay(overLay)
        }
        return overLay
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 通过layerName移除OverLay
   * @param layerName
   * @returns {Array}
   */
  removeOverlayByLayerName (layerName) {
    let _overlays = []
    if (this.map && layerName) {
      let overlays = this.map.getOverlays().getArray()
      let len = overlays.length
      for (let i = 0; i < len; i++) {
        if (overlays[i] && overlays[i].get('layerName') === layerName) {
          _overlays.push(overlays[i])
          if (overlays[i].get('markFeature') && overlays[i].get('markFeature') instanceof ol.Feature) {
            this.removeFeature(overlays[i].get('markFeature'))
          }
          this.map.removeOverlay(overlays[i])
          i--
        }
      }
    }
    return _overlays
  }

  /**
   * 通过id数组移除OverLay
   * @param ids
   * @returns {Array}
   */
  removeOverlayByIds (ids) {
    try {
      let overlays = []
      if (ids && Array.isArray(ids) && ids.length > 0) {
        ids.forEach(id => {
          if (id) {
            let overlay = this.removeOverlayById(id)
            overlays.push(overlay)
          }
        })
      }
      return overlays
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 通过layerNames移除Overlay
   * @param layerNames
   * @returns {Array}
   */
  removeOverlayByLayerNames (layerNames) {
    try {
      let overlays = []
      if (layerNames && Array.isArray(layerNames) && layerNames.length > 0) {
        layerNames.forEach(layerName => {
          if (layerName) {
            let rOverlays = this.removeOverlayByLayerName(layerName)
            if (rOverlays && rOverlays.length > 0) {
              overlays = overlays.concat(rOverlays)
            }
          }
        })
      }
      return overlays
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 高亮OverLay
   * @param id
   * @param overlay
   * @returns {ol.Overlay}
   */
  highLightOverLay (id, overlay) {
    try {
      if (!this.map) return
      if (overlay && overlay instanceof ol.Overlay) {
        let overlayElement = overlay.getElement()
        let iconElement = overlayElement.getElementsByTagName('div')[0]
        iconElement.style.color = iconElement.selectColor
        htmlUtils.addClass(overlayElement, 'overlay-point-marker-raise')
        return overlay
      } else if (id && trim(id) !== "''") {
        let _overlay = this.map.getOverlayById(id)
        if (_overlay && _overlay instanceof ol.Overlay) {
          let _overlayElement = _overlay.getElement()
          let _iconElement = _overlayElement.getElementsByTagName('div')[0]
          _iconElement.style.color = _iconElement.selectColor
          htmlUtils.addClass(_overlayElement, 'overlay-point-marker-raise')
          return _overlay
        }
      }
    } catch (error) {
      console.info(error)
    }
  }

  /**
   * 取消高亮OverLay
   * @param id
   * @param overlay
   * @returns {ol.Overlay}
   */
  unHighLightOverLay (id, overlay) {
    if (!this.map) return
    if (overlay && overlay instanceof ol.Overlay) {
      let overlayElement = overlay.getElement()
      let iconElement = overlayElement.getElementsByTagName('div')[0]
      iconElement.style.color = iconElement.normalColor
      htmlUtils.removeClass(overlayElement, 'overlay-point-marker-raise')
      return overlay
    } else if (id && trim(id) !== "''") {
      let _overlay = this.map.getOverlayById(id)
      if (_overlay && _overlay instanceof ol.Overlay) {
        let _overlayElement = _overlay.getElement()
        let _iconElement = _overlayElement.getElementsByTagName('div')[0]
        _iconElement.style.color = _iconElement.normalColor
        htmlUtils.removeClass(_overlayElement, 'overlay-point-marker-raise')
        return _overlay
      }
    }
  }

  /**
   * 通过id获取OverLay
   * @param id
   * @returns {ol.Overlay}
   */
  getOverLayById (id) {
    let _id = trim(id)
    let overLay = this.map.getOverlayById(_id)
    return overLay
  }

  /**
   * 通过LayerNames获取OverLays
   * @param layerNames
   * @returns {Array}
   */
  getOverLaysByLayerNames (layerNames) {
    try {
      let overlays = []
      if (layerNames && Array.isArray(layerNames) && layerNames.length > 0) {
        layerNames.forEach(layerName => {
          if (layerName) {
            let rOverlays = this.getOverlayByLayerName(layerName)
            if (rOverlays && rOverlays.length > 0) {
              overlays = overlays.concat(rOverlays)
            }
          }
        })
      }
      return overlays
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 通过layerName获取OverLays
   * @param layerName
   * @returns {Array}
   */
  getOverlayByLayerName (layerName) {
    let _overlays = []
    if (this.map && layerName) {
      let overlays = this.map.getOverlays().getArray()
      overlays.forEach(overlay => {
        if (overlay && overlay.get('layerName') === layerName) {
          _overlays.push(overlay)
        }
      })
    }
    return _overlays
  }

  /**
   * 通过属性键值获取Overlay
   * @param key
   * @param value
   * @returns {Array}
   */
  getOverlayByPropertiesKey (key, value) {
    let _overlays = []
    if (this.map && key && value) {
      let overlays = this.map.getOverlays().getArray()
      overlays.forEach(overlay => {
        if (overlay) {
          let properties = overlay.getProperties()
          if (properties && properties[key] && properties[key] === value) {
            _overlays.push(overlay)
          }
        }
      })
    }
    return _overlays
  }

  /**
   * 获取键值组的多类Overlay，注意键名和键值的长度必须相同和一一对应
   * @param keys
   * @param values
   * @returns {Array}
   */
  getOverlayByPropertiesKeys (keys, values) {
    let _overlays = []
    if (this.map && keys && values && Array.isArray(keys) && Array.isArray(values) && keys.length === values.length) {
      keys.forEach((key, index) => {
        let overlays = this.getOverlayByPropertiesKey(key, values[index])
        if (overlays && overlays.length > 0) {
          _overlays = _overlays.concat(overlays)
        }
      })
    }
    return _overlays
  }

  /**
   * 通过键名键值移除要素
   * @param key
   * @param value
   * @returns {Array}
   */
  removeOverlayByPropertiesKey (key, value) {
    let _overlays = []
    if (this.map && key && value) {
      let overlays = this.map.getOverlays().getArray()
      let len = overlays.length
      for (let i = 0; i < len; i++) {
        if (overlays[i]) {
          let properties = overlays[i].getProperties()
          if (properties && properties[key] && properties[key] === value) {
            _overlays.push(overlays[i])
            if (overlays[i].get('markFeature') && overlays[i].get('markFeature') instanceof ol.Feature) {
              this.removeFeature(overlays[i].get('markFeature'))
            }
            this.map.removeOverlay(overlays[i])
            i--
          }
        }
      }
    }
    return _overlays
  }

  /**
   * 通过键值组移除多类Overlay，注意键名和键值的长度必须相同和一一对应
   * @param keys
   * @param values
   * @returns {Array}
   */
  removeOverlayByPropertiesKeys (keys, values) {
    let _overlays = []
    if (this.map && keys && values && Array.isArray(keys) && Array.isArray(values) && keys.length === values.length) {
      keys.forEach((key, index) => {
        let overlays = this.removeOverlayByPropertiesKey(key, values[index])
        if (overlays && overlays.length > 0) {
          _overlays = _overlays.concat(overlays)
        }
      })
    }
    return _overlays
  }
}
export default Overlay
