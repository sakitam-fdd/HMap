import { ol } from '../constants'
import { DomUtil } from '../dom'
import Feature from '../feature/feature'
import mix from '../utils/mixin'
class Overlay extends mix(Feature) {
  constructor (map) {
    super()
    if (map && map instanceof ol.Map) {
      /**
       * 地图对象
       * @type {ol.Map}
       */
      this.map = map
    } else {
      throw new Error('传入的不是地图对象或者地图对象为空！')
    }
  }

  /**
   * 从空间数据中解析坐标
   * @param point
   */
  _getCoordinatesFromGeom (point) {
    let [ geometry ] = [ null ]
    if (point instanceof ol.geom.Geometry) {
      geometry = point
    } else if (Array.isArray(point.geometry)) {
      geometry = new ol.geom.Point(point.geometry)
    } else {
      geometry = new ol.format.WKT().readGeometry(point.geometry)
    }
    return geometry.getCoordinates()
  }
  /**
   * 添加字体图标要素
   * @param point
   * @param params
   */
  addOverlayPoint (point, params, index) {
    try {
      if (point && point['geometry']) {
        let coordinate = this._getCoordinatesFromGeom(point)
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
          this.movePointToView(coordinate)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 添加要素事件
   * @param marker
   * @param OverLay
   * @private
   */
  _addOverLayEvent (marker, ele, OverLay) {
    marker.onmousedown = function (event) {
      if (event.button === 2) {
        window.ObservableObj.dispatchEvent({
          type: 'rightMenuEvt',
          originEvent: event,
          value: OverLay
        })
      } else if (event.button === 0) {
        window.ObservableObj.dispatchEvent({
          type: 'overlayEvent',
          originEvent: event,
          value: OverLay
        })
      }
    }
    marker.onmouseover = function (event) {
      ele.style.color = ele.selectColor
      window.ObservableObj.dispatchEvent({
        type: 'onMouseoverOverlay',
        originEvent: event,
        value: OverLay
      })
    }
    marker.onmouseout = function (event) {
      ele.style.color = ele.normalColor
      window.ObservableObj.dispatchEvent({
        type: 'onMouseOutOverlay',
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
      DomUtil.addClass(ele, 'iconfont')
      DomUtil.addClass(ele, eleClass)
      ele.style.top = style['element']['top'] ? style['element']['top'] : '-100%'
      ele.style.left = style['element']['left'] ? style['element']['left'] : '100%'
      ele.style.fontSize = style['element']['fontSize'] ? style['element']['fontSize'] : '16px'
      ele.style.borderColor = style['element']['borderColor'] ? style['element']['borderColor'] : '#2A2A2A'
      ele.style.borderWidth = style['element']['borderWidth'] ? style['element']['borderWidth'] : '1px'
      ele.style.opacity = style['element']['opacity'] ? style['element']['opacity'] : 1
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
            let _geom = this._getGeometryFromPoint(item)
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
          this._getExtent(multiPoint)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export default Overlay
