define(function (require) {
  let echarts = require('echarts')
  return echarts.extendComponentView({
    type: 'HMap',
    render: function (MapModel, echartModel, api) {
      let rendering = true
      let Map = echarts.Map
      let viewportRoot = api.getZr().painter.getViewportRoot()
      let coordSys = MapModel.coordinateSystem
      let moveHandler = function (type, target) {
        if (rendering) {
          return
        }
        let offsetEl = viewportRoot.parentNode.parentNode.parentNode
        let mapOffset = [
          -parseInt(offsetEl.style.left, 10) || 0,
          -parseInt(offsetEl.style.top, 10) || 0
        ]
        viewportRoot.style.left = mapOffset[0] + 'px'
        viewportRoot.style.top = mapOffset[1] + 'px'
        coordSys.setMapOffset(mapOffset)
        MapModel.mapOffset = mapOffset
        api.dispatchAction({
          type: 'MapRoam'
        })
      }
      let zoomEndHandler = function () {
        if (rendering) {
          return
        }
        api.dispatchAction({
          type: 'MapRoam'
        })
      }
      this._oldMoveHandler = moveHandler
      this._oldZoomEndHandler = zoomEndHandler
      Map.getView().on('change:resolution', moveHandler)
      Map.getView().on('change:center', moveHandler)
      Map.getView().on('change:rotation', moveHandler)
      Map.on('moveend', moveHandler)
      let roam = MapModel.get('roam')
      if (roam && roam !== 'scale') {
        // todo 允许拖拽
      } else {
        // todo 不允许拖拽
      }
      if (roam && roam !== 'move') {
        // todo 允许移动
      } else {
        // todo 不允许允许移动
      }
      rendering = false
    }
  })
})
