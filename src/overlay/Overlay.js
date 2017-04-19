import { ol } from '../constants'
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
  getCoordinatesFromGeom (point) {
    let [ geometry, coor ] = [ null, null ]
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
  addOverlayPoint (point, params) {
    try {
      if (!this.map) return
      let marker = document.createElement('div')
      let _span = document.createElement('span')
      let attributes = point['attributes']
      let [color, fontSize, opacity, style, coordinate, ele, _span] = ['#EB4F38', '31px', 1, null, [], null, null]
      let [id] = [null]
      marker.className = 'overlay-point iconfont'
      if (attributes['style']) {
        style = attributes['style']
      } else if (params['style']) {
        style = params['style']
      }
      if (style) {
        if (style['className']) {
          $(marker).addClass(style.className)
        }
        marker.selectColor = "#1b9de8"
        marker.className = style['element']['className'] ? style['element']['className'] : 'maked-point'
        marker.style.top = style['element']['top'] ? style['element']['top'] : '-100%'
        marker.style.left = style['element']['left'] ? style['element']['left'] : '100%'
        marker.style.fontSize = style['element']['fontSize'] ? style['element']['fontSize'] : '16px'
        marker.normalColor = marker.style.color = style['element']['color'] ? style['element']['color'] : '#1b9de8'
        marker.style.borderColor = style['element']['borderColor'] ? style['element']['borderColor'] : '#2A2A2A'
        marker.style.borderWidth = style['element']['borderWidth'] ? style['element']['borderWidth'] : '1px'
        marker.style.opacity = style['element']['opacity'] ? style['element']['opacity'] : 1
        span.innerHTML = style['element']['text'] ? style['element']['text'] : ''
        marker.appendChild(span)
      }
      marker.onmousedown = function (ev) {
        if (ev.button == 2) {//鼠标右键
          window.ObservableObj.set("rightMenuFeature", feature)
          window.ObservableObj.dispatchEvent("rightMenuEvt")
        } else if (ev.button == 0) {//鼠标左键
          window.ObservableObj.set("overlay", feature)
          window.ObservableObj.dispatchEvent("overlayEvent")
        }
      }
      if (point['attributes'] && (point['attributes']['id'] || point['attributes']['ID'])) {
        let id = (point.attributes['id'] || point.attributes['ID'] || params['id'])
        let overlaytemp = this.map.getOverlayById(id)
        if (!overlaytemp) {
          let iconOverlay = new ol.Overlay({
            element: marker,
            positioning: 'center-center',
            id: id,
            offset: [0, -10],
            stopEvent: true
          })
          iconOverlay.setPosition(coordinate)
          iconOverlay.setProperties(point['attributes'])
          //设置标识参数
          if (params) {
            iconOverlay.set("params", params)
            if (params['layerName']) {
              iconOverlay.set("layerName", params.layerName)
            }
          }
          this.map.addOverlay(iconOverlay)
        } else {
          overlaytemp.setElement(marker)
        }
      }
    } catch (e) {
      console.info(e)
    }
  }

  _addOverlayPoint (point, params) {
    try {
      if (point && point['geometry']) {
        let coordinate = this.getCoordinatesFromGeom(point);
        let marker = this.getElementForOverlay(point, params);
        if (point['attributes'] && (point['attributes']['id'] || point['attributes']['ID'])) {
          let id = (point.attributes['id'] || point.attributes['ID'] || params['id']);
          let overlay = this.map.getOverlayById(id);
          if (!overlay) {
            let iconOverlay = new ol.Overlay({
              element: marker,
              positioning: 'center-center',
              id: id,
              offset: [0, -10],
              stopEvent: true
            });
            iconOverlay.setPosition(coordinate);
            iconOverlay.setProperties(point['attributes']);
            if (params) {
              iconOverlay.set('params', params);
              if (params['layerName']) {
                iconOverlay.set("layerName", params.layerName);
              }
            }
            this.map.addOverlay(iconOverlay);
          } else {
            overlay.setElement(marker)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  getElementForOverlay (point, params) {
    let marker = document.createElement('div');
    marker.className = 'hmap-marker-overlay-point iconfont';
    let style = point['attributes']['style'] || params['style'];
    if (style['className']) {
      $(marker).addClass(style.className);
    }
    if (style['color']) {
      color = style.color;
    }
    if (style['fontSize']) {
      fontSize = style.fontSize;
    }
    if (style['opacity']) {
      opacity = style.opacity;
    }
    if (style['element']) {
      ele = document.createElement('div');
      ele.className = style['element']['className'] ? style['element']['className'] : 'maked-point';
      ele.style.top = style['element']['top'] ? style['element']['top'] : '-100%';
      ele.style.left = style['element']['left'] ? style['element']['left'] : '100%';
      ele.style.fontSize = style['element']['fontSize'] ? style['element']['fontSize'] : '16px';
      ele.style.borderColor = style['element']['borderColor'] ? style['element']['borderColor'] : '#2A2A2A';
      ele.style.borderWidth = style['element']['borderWidth'] ? style['element']['borderWidth'] : '1px';
      ele.innerHTML = style['element']['text'] ? style['element']['text'] : ''
    }
  }

  addOverlayPoints (points, params) {

  }
}

export default Overlay