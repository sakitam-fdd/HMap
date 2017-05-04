import { ol } from '../constants'
import { DomUtil } from '../dom'
class Overlay {
  constructor (map) {
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
        let marker = this.getElementForOverlay(point, params, index)
        if (point['attributes'] && (point['attributes']['id'] || point['attributes']['ID'])) {
          let id = (point['attributes']['id'] || point['attributes']['ID'] || params['id'])
          let overlay = this.map.getOverlayById(id)
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
            this.map.addOverlay(iconOverlay)
          } else {
            overlay.setElement(marker)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

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
    return marker
  }

  addOverlayPoints (points, params) {
    try {
      console.log(1)
    } catch (e) {
      console.log(e)
    }
  }
}

export default Overlay
