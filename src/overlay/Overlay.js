class Overlay {
  constructor (map) {
    if (map && map instanceof ol.Map) {
      /**
       * 地图对象
       * @type {ol.Map}
       */
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象或者地图对象为空！')
    }
  }
  /**
   * 添加字体图标要素
   * @param point
   * @param params
   */
  addOverlayPoint (point, params) {
    try {
      if (!this.map) return;
      let marker = document.createElement('div');
      let attributes = point['attributes'];
      let [color, fontSize, opacity, style, coordinate, ele, span] = ['#EB4F38', '31px', 1, null, [], null, null];
      let [id] = [null];
      marker.className = 'overlay-point iconfont';
      if (attributes['style']) {
        style = attributes['style'];
      } else if (params['style']) {
        style = params['style'];
      }
      if (style) {
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
      if (params['orderBy']) {
        m = 1;
        span = document.createElement('span');
      } else if (params['orderByNum'] && attributes['number']) {
        m = Number(attributes.number) + 1;
        span = document.createElement('span');
      }
      if (!!span && ele == '') {
        span.innerHTML = m;
        marker.appendChild(span);
      }
      if (ele !== '') {
        marker.appendChild(ele);
      }
      marker.style.color = color;
      marker.style.fontSize = fontSize;
      marker.style.opacity = opacity;
      marker.selectColor = "#1b9de8";
      marker.normalColor = color;
      marker.onmousedown = function (ev) {
        if (ev.button == 2) {//鼠标右键
          window.ObservableObj.set("rightMenuFeature", feature);
          window.ObservableObj.dispatchEvent("rightMenuEvt");
        } else if (ev.button == 0) {//鼠标左键
          window.ObservableObj.set("overlay", feature);
          window.ObservableObj.dispatchEvent("overlayEvent");
        }
      };
      if (point['attributes'] && (point['attributes']['id'] || point['attributes']['ID'])) {
        let id = (point.attributes['id'] || point.attributes['ID'] || params['id']);
        let overlaytemp = this.map.getOverlayById(id);
        if (!overlaytemp) {
          let iconOverlay = new ol.Overlay({
            element: marker,
            positioning: 'center-center',
            id: id,
            offset: [0, -10],
            stopEvent: true
          });
          iconOverlay.setPosition(coordinate);
          iconOverlay.setProperties(point['attributes']);
          //设置标识参数
          if (params) {
            iconOverlay.set("params", params);
            if (params['layerName']) {
              iconOverlay.set("layerName", params.layerName);
            }
          }
          this.map.addOverlay(iconOverlay);
        } else {
          overlaytemp.setElement(marker)
        }
      }
    } catch (e) {
      console.info(e)
    }
  }

  addOverlayPoints (points, params) {

  }
}

export default Overlay