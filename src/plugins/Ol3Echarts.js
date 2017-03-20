import { ol } from '../constants'
class olMapCoordSys {
  constructor (olMap, api) {
    this._olMap = olMap;
    this.dimensions = ['lng', 'lat'];
    this._mapOffset = [0, 0];
    this._api = api
    this.dimensions = ['lng', 'lat']
  }

  setMapOffset (mapOffset) {
    this._mapOffset = mapOffset
  }

  getBMap () {
    return this._olMap
  }

  dataToPoint (coords) {
    return this._olMap.getPixelFromCoordinate(ol.proj.fromLonLat(coords));
  }

  pointToData (pixel) {
    return this._olMap.getCoordinateFromPixel(pixel);
  }

  getViewRect () {
    let api = this._api
    return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight())
  }

  getRoamTransform () {
    return echarts.matrix.create()
  }
  create (ecModel, api) {
    var coordSys;
    ecModel.eachComponent('olMap', function (olMapModel) {
      var viewportRoot = api.getZr().painter.getViewportRoot()
      var olMap = echarts.olMap;
      coordSys = new olMapCoordSys(olMap, api)
      coordSys.setMapOffset(olMapModel.__mapOffset || [0, 0])
      olMapModel.coordinateSystem = coordSys
    })

    ecModel.eachSeries(function (seriesModel) {
      if (seriesModel.get('coordinateSystem') === 'olMap') {
        seriesModel.coordinateSystem = coordSys
      }
    })
  }
}

class Ol3Echarts {
  constructor (map, echarts) {
    if (!echarts) {
      throw new Error('请先引入echarts3！')
    }
    if (!map || !(map instanceof ol.Map)) {
      throw new Error('必须传入地图对象！')
    }
    this._map = map;
    this._echarts = echarts;
    let size = this._map.getSize();
    let div = this._echartsContainer = document.createElement('div');
    div.style.position = 'absolute';
    div.style.height = size[1] + 'px';
    div.style.width = size[0] + 'px';
    div.style.top = 0;
    div.style.left = 0;
    this._map.getViewport().appendChild(div);
    this.chart = echarts.init(this._echartsContainer);
    echarts.olMap = map;
    this.addResizeListener()
  }

  registerCoordinateSystem () {
    this._echarts.registerCoordinateSystem(
      'olMap', require('./olMapCoordSys')
    )
  }

  /**
   * 移除图表DOM
   */
  remove () {
    this._echartsContainer.parentNode.removeChild(this._echartsContainer);
    this._map = undefined
  }

  /**
   * 更新视图尺寸
   */
  resize () {
    let that = this;
    setTimeout(function () {
      that._echartsContainer.style.width = that._map.getSize() + 'px';
      that._echartsContainer.style.height = that._map.getSize() + 'px';
      that.chart.resize()
    }, 100);
  }

  /**
   * 添加监听事件
   */
  addResizeListener () {
    window.addEventListener(('orientationchange' in window ? 'orientationchange' : 'resize'), event => {
      this.resize()
    }, false);

    window.addEventListener('pageshow', ev => {
      if (ev.persisted) {
        this.resize()
      }
    }, false);
  }
}

export default Ol3Echarts