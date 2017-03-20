import { ol } from '../constants'

class olMapCoordSys {
  constructor (olMap, api) {
    this._olMap = olMap;
    this.dimensions = ['lng', 'lat'];
    this._mapOffset = [0, 0];
    this._api = api
    this.dimensions = ['lng', 'lat']
  }

  /**
   * 设置地图偏移
   * @param mapOffset
   */
  setMapOffset (mapOffset) {
    this._mapOffset = mapOffset
  }

  getBMap () {
    return this._olMap
  }

  /**
   * 坐标转像素
   * @param coords
   * @returns {ol.Pixel|*}
   */
  dataToPoint (coords) {
    return this._olMap.getPixelFromCoordinate(ol.proj.fromLonLat(coords));
  }

  /**
   * 像素转坐标
   * @param pixel
   * @returns {ol.Coordinate|*}
   */
  pointToData (pixel) {
    return this._olMap.getCoordinateFromPixel(pixel);
  }

  /**
   * 获取视图范围
   * @returns {BoundingRect}
   */
  getViewRect () {
    let api = this._api
    return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight())
  }

  /**
   * 转换roam
   */
  getRoamTransform () {
    return echarts.matrix.create()
  }

  static create (ecModel, api) {
    let coordSys;
    ecModel.eachComponent('olMap', function (olMapModel) {
      let viewportRoot = api.getZr().painter.getViewportRoot()
      let olMap = echarts.olMap;
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
    this.registerComponentView()
    this.registerModule()
    this.registerCoordinateSystem()
    this._registerAction()
  }

  /**
   * 注册坐标系统
   */
  registerCoordinateSystem () {
    this._echarts.registerCoordinateSystem(
      'olMap', olMapCoordSys
    )
  }

  /**
   * 注册自定义模块
   * @returns {*}
   */
  registerModule () {
    return this._echarts.extendComponentModel({
      type: 'olMap',
      getBMap: function () {
        // __bmap is injected when creating BMapCoordSys
        return this.__olMap;
      },
      defaultOption: {
        roam: false
      }
    });
  }

  /**
   * 注册事件
   * @returns {*}
   * @private
   */
  _registerAction () {
    return this._echarts.registerAction({
      type: 'olMapRoam',
      event: 'olMapRoam',
      update: 'updateLayout'
    }, function (payload, ecModel) {})
  }

  /**
   * 注册组件视图
   * @returns {*}
   */
  registerComponentView () {
    let that = this;
    return this._echarts.extendComponentView({
      type: 'olMap',
      render: function (olMapModel, ecModel, api) {
        let rendering = true;
        let olMap = that._echarts.olMap;
        let viewportRoot = api.getZr().painter.getViewportRoot();
        let coordSys = olMapModel.coordinateSystem;
        let moveHandler = (type, target) => {
          if (rendering) {
            return
          }
          let offsetEl = viewportRoot.parentNode.parentNode.parentNode;
          let mapOffset = [
            -parseInt(offsetEl.style.left, 10) || 0,
            -parseInt(offsetEl.style.top, 10) || 0
          ];
          viewportRoot.style.left = mapOffset[0] + 'px';
          viewportRoot.style.top = mapOffset[1] + 'px';
          coordSys.setMapOffset(mapOffset)
          olMapModel.__mapOffset = mapOffset
          api.dispatchAction({
            type: 'olMapRoam'
          })
        };
        function zoomEndHandler () {
          if (rendering) {
            return
          }
          api.dispatchAction({
            type: 'olMapRoam'
          })
        }

        // olMap.off('move', this._oldMoveHandler)
        // // FIXME
        // // Moveend may be triggered by centerAndZoom method when creating coordSys next time
        // // olMap.removeEventListener('moveend', this._oldMoveHandler)
        // olMap.off('zoomend', this._oldZoomEndHandler)
        // olMap.on('move', moveHandler)
        // // olMap.addEventListener('moveend', moveHandler)
        // olMap.on('zoomend', zoomEndHandler)
        olMap.getView().on('change:resolution', moveHandler);
        olMap.getView().on('change:center', moveHandler);
        olMap.on('moveend', moveHandler);

        this._oldMoveHandler = moveHandler
        this._oldZoomEndHandler = zoomEndHandler

        var roam = olMapModel.get('roam');
        if (roam && roam !== 'scale') {
          // todo 允许拖拽
        }else {
          // todo 不允许拖拽
        }
        if (roam && roam !== 'move') {
          // todo 允许移动
        }else {
          // todo 不允许允许移动
        }
        rendering = false
      }
    })
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