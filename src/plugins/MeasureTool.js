import mix from '../utils/mixin'
import Layer from '../layer/Layer'
import { ol } from '../constants'
class MeasureTool extends mix(Layer) {
  constructor (map) {
    super()
    if (map && map instanceof ol.Map) {
      /**
       * 地图对象
       * @type {ol.Map}
       */
      this.map = map
      /**
       * 计算工具
       * @type {ol.Sphere}
       */
      this.wgs84Sphere = new ol.Sphere(6378137)
      /**
       * 测量类型（目前预制两种，测距和测面）
       * @type {{measureLength: string, measureArea: string}}
       */
      this.measureTypes = {
        measureLength: 'measureLength',
        measureArea: 'measureArea'
      }
      /**
       * 拖拽交互
       * @type {null}
       */
      this.dragPanInteraction = null
    } else {
      throw new Error('传入的不是地图对象或者地图对象为空！')
    }
  }

  /**
   * 初始设置
   * @param params
   */
  setUp (params) {
    /**
     * 当前设置
     * @type {*}
     */
    this.options = params || {}
    /**
     * 测量工具所处图层
     * @type {*}
     */
    this.layerName = this.options['layerName'] || 'measureTool'
    /**
     * 点击计数器
     * @type {number}
     */
    this.clickCount = 0
    /**
     * 测量结果
     * @type {null}
     */
    this.drawSketch = null
    /**
     * draw对象
     * @type {null}
     */
    this.draw = null

    /**
     * 移动事件处理
     * @type {null}
     */
    this.beforeMeasurePointerMoveHandler = null
    /**
     * 处理机
     * @type {null}
     */
    this.listener = null
    /**
     * 当前所画要素
     * @type {null}
     */
    this.drawSketch = null
    /**
     * 测量提示信息
     * @type {string}
     */
    this.measureHelpTooltip = ''

    /**
     * 面积测量提示
     * @type {null}
     */
    this.measureAreaTooltip = null

    this.measureAreaTooltipElement = null

    if (this.options['measureType'] === this.measureTypes.measureLength) {
      this.measureLengthClick = this.map.on('singleclick', event => {
        this.clickCount += 1
        if (this.clickCount === 1) {
          this.drawSketch.length = '起点'
        }
        this.addMeasureOverLay(event.coordinate, this.drawSketch.length)
        this.addMeasurecircle(event.coordinate)
      })
      this.beforeMeasurePointerMoveHandler = this.map.on('pointermove', this.beforeDrawPointMoveHandler, this)
    } else if (this.options['measureType'] === this.measureTypes.measureArea) {
      this.measureAreaClick = this.map.on('singleclick', event => {
      })
    }
    this.addDrawInteraction()
  }

  /**
   * 添加画笔交互
   */
  addDrawInteraction () {
    this.removeDrawInteraion()
    let type = ''
    if (this.options['measureType'] === this.measureTypes.measureLength) {
      type = 'LineString'
    } else if (this.options['measureType'] === this.measureTypes.measureArea) {
      type = 'Polygon'
    }
    this.options['create'] = true
    this.layer = this.creatVectorLayer(this.layerName, this.options)
    this.layer.setStyle(new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(67, 110, 238, 0.4)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(242,123,57,1)',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 4,
        stroke: new ol.style.Stroke({
          color: 'rgba(255,0,0,1)',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,255,255,1)'
        })
      })
    }))
    this.draw = new ol.interaction.Draw({
      source: this.layer.getSource(),
      type: type,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(254, 164, 164, 1)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(252, 129, 129, 1)',
          width: 3
        }),
        image: new ol.style.Circle({
          radius: 1,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      })
    })
    this.map.addInteraction(this.draw)
    this.drawListener()
    this.getDragPanInteraction().setActive(false)
  }
  /**
   * 移除交互工具
   */
  removeDrawInteraion () {
    if (this.draw) {
      this.map.removeInteraction(this.draw)
    }
    this.draw = null
  }

  /**
   * 点击之前的提示信息
   * @param event
   */
  beforeDrawPointMoveHandler (event) {
    if (!this.measureHelpTooltip) {
      let helpTooltipElement = document.createElement('label')
      helpTooltipElement.className = 'BMapLabel'
      helpTooltipElement.style.position = 'absolute'
      helpTooltipElement.style.display = 'inline'
      helpTooltipElement.style.cursor = 'inherit'
      helpTooltipElement.style.border = 'none'
      helpTooltipElement.style.padding = '0'
      helpTooltipElement.style.whiteSpace = 'nowrap'
      helpTooltipElement.style.fontVariant = 'normal'
      helpTooltipElement.style.fontWeight = 'normal'
      helpTooltipElement.style.fontStretch = 'normal'
      helpTooltipElement.style.fontSize = '12px'
      helpTooltipElement.style.lineHeight = 'normal'
      helpTooltipElement.style.fontFamily = 'arial,simsun'
      helpTooltipElement.style.color = 'rgb(51, 51, 51)'
      helpTooltipElement.style.webkitUserSelect = 'none'
      helpTooltipElement.innerHTML = "<span class='BMap_diso'><span class='BMap_disi'>单击确定起点</span></span>"
      this.measureHelpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [55, 20],
        positioning: 'center-center'
      })
      this.map.addOverlay(this.measureHelpTooltip)
    }
    this.measureHelpTooltip.setPosition(event.coordinate)
  }

  /**
   * 点击之后的事件处理
   * @param event
   */
  drawPointerMoveHandler (event) {
    if (this.measureTypes.measureLength === this.options['measureType']) {
      if (event.dragging) {
        return
      }
      let helpTooltipElement = this.measureHelpTooltip.getElement()
      helpTooltipElement.className = ' BMapLabel BMap_disLabel'
      helpTooltipElement.style.position = 'absolute'
      helpTooltipElement.style.display = 'inline'
      helpTooltipElement.style.cursor = 'inherit'
      helpTooltipElement.style.border = '1px solid rgb(255, 1, 3)'
      helpTooltipElement.style.padding = '3px 5px'
      helpTooltipElement.style.whiteSpace = 'nowrap'
      helpTooltipElement.style.fontVariant = 'normal'
      helpTooltipElement.style.fontWeight = 'normal'
      helpTooltipElement.style.fontStretch = 'normal'
      helpTooltipElement.style.fontSize = '12px'
      helpTooltipElement.style.lineHeight = 'normal'
      helpTooltipElement.style.fontFamily = 'arial,simsun'
      helpTooltipElement.style.color = 'rgb(51, 51, 51)'
      helpTooltipElement.style.backgroundColor = 'rgb(255, 255, 255)'
      helpTooltipElement.style.webkitUserSelect = 'none'
      helpTooltipElement.innerHTML = '<span>总长:<span class="BMap_disBoxDis"></span></span><br><span style="color: #7a7a7a">单击确定地点,双击结束</span>'
      this.measureHelpTooltip.setPosition(event.coordinate)
    }
  }

  /**
   * 画笔事件处理机
   */
  drawListener () {
    this.draw.on('drawstart', event => {
      this.drawSketch = event.feature
      this.drawSketch.set('uuid', Math.floor(Math.random() * 100000000 + 1))
      if (this.measureTypes.measureLength === this.options['measureType']) {
        ol.Observable.unByKey(this.beforeMeasurePointerMoveHandler)
        this.listener = this.drawSketch.getGeometry().on('change', evt => {
          let geom = evt.target
          if (geom instanceof ol.geom.LineString) {
            let output = this.formatData(geom)
            this.drawSketch.length = output
            this.measureHelpTooltip.getElement().firstElementChild.firstElementChild.innerHTML = output
          }
        })
        this.drawPointermove = this.map.on('pointermove', this.drawPointerMoveHandler, this)
      } else if (this.measureTypes.measureArea === this.options['measureType']) {
        let uuid = Math.floor(Math.random() * 100000000 + 1)
        this.createMeasureAreaTooltip()
        this.drawSketch.set('uuid', uuid)
        this.measureAreaTooltip.set('uuid', uuid)
        this.listener = this.drawSketch.getGeometry().on('change', evts => {
          let geom = evts.target
          let area = this.formatData(geom)
          if (this.measureAreaTooltip) {
            this.measureAreaTooltipElement.innerHTML = '面积' + area
            this.measureAreaTooltip.setPosition(geom.getInteriorPoint().getCoordinates())
          }
        })
      }
    })
    this.draw.on('drawend', ev => {
      this.getDragPanInteraction().setActive(true)
      this.map.getTargetElement().style.cursor = 'default'
      this.map.removeOverlay(this.measureHelpTooltip)
      this.measureHelpTooltip = null
      if (this.measureTypes.measureLength === this.options['measureType']) {
        this.addMeasureOverLay(ev.feature.getGeometry().getLastCoordinate(), this.drawSketch.length, '止点')
        this.addMeasurecircle(ev.feature.getGeometry().getLastCoordinate())
        ol.Observable.unByKey(this.listener)
        ol.Observable.unByKey(this.drawPointermove)
        ol.Observable.unByKey(this.measureLengthClick)
      } else if (this.options['measureType'] === this.measureTypes.measureArea) {
        ol.Observable.unByKey(this.listener)
        this.addMeasureRemoveButton(ev.feature.getGeometry().getCoordinates()[0][0])
      }
      this.listener = null
      this.drawSketch = null
      this.removeDrawInteraion()
    })
  }

  /**
   * 测量结果格式化
   * @param geom
   * @returns {*}
   */
  formatData (geom) {
    let output = 0
    if (geom) {
      if (this.options['measureType'] === this.measureTypes.measureLength) {
        let [coordinates, length] = [geom.getCoordinates(), 0]
        let sourceProj = this.map.getView().getProjection()
        for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
          let c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326')
          let c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326')
          length += this.wgs84Sphere.haversineDistance(c1, c2)
        }
        if (length > 100) {
          output = (Math.round(length / 1000 * 100) / 100) + ' ' + '公里'
        } else {
          output = (Math.round(length * 100) / 100) + ' ' + '米'
        }
      } else if (this.options['measureType'] === this.measureTypes.measureArea) {
        let sourceProj = this.getMap().getView().getProjection()
        let geometry = /** @type {ol.geom.Polygon} */(geom.clone().transform(
          sourceProj, 'EPSG:4326'))
        let coordinates = geometry.getLinearRing(0).getCoordinates()
        let area = Math.abs(this.wgs84Sphere.geodesicArea(coordinates))
        if (area > 10000000000) {
          output = (Math.round(area / (1000 * 1000 * 10000) * 100) / 100) + ' ' + '万平方公里'
        } else if (area > 1000000 || area < 10000000000) {
          output = (Math.round(area / (1000 * 1000) * 100) / 100) + ' ' + '平方公里'
        } else {
          output = (Math.round(area * 100) / 100) + ' ' + '平方米'
        }
      }
    }
    return output
  }

  /**
   * 添加点击测量时的圆圈
   * @param coordinate
   */
  addMeasurecircle (coordinate) {
    let feature = new ol.Feature({
      uuid: this.drawSketch.get('uuid'),
      geometry: new ol.geom.Point(coordinate)
    })
    this.layer.getSource().addFeature(feature)
  }

  /**
   * 添加测量结果Overlay
   * @param coordinate
   * @param length
   * @param type
   */
  addMeasureOverLay (coordinate, length, type) {
    let helpTooltipElement = document.createElement('label')
    helpTooltipElement.style.position = 'absolute'
    helpTooltipElement.style.display = 'inline'
    helpTooltipElement.style.cursor = 'inherit'
    helpTooltipElement.style.border = 'none'
    helpTooltipElement.style.padding = '0'
    helpTooltipElement.style.whiteSpace = 'nowrap'
    helpTooltipElement.style.fontVariant = 'normal'
    helpTooltipElement.style.fontWeight = 'normal'
    helpTooltipElement.style.fontStretch = 'normal'
    helpTooltipElement.style.fontSize = '12px'
    helpTooltipElement.style.lineHeight = 'normal'
    helpTooltipElement.style.fontFamily = 'arial,simsun'
    helpTooltipElement.style.color = 'rgb(51, 51, 51)'
    helpTooltipElement.style.webkitUserSelect = 'none'
    if (type === '止点') {
      helpTooltipElement.style.border = '1px solid rgb(255, 1, 3)'
      helpTooltipElement.style.padding = '3px 5px'
      helpTooltipElement.className = ' BMapLabel BMap_disLabel'
      helpTooltipElement.innerHTML = "总长<span class='BMap_disBoxDis'>" + length + '</span>'
      this.addMeasureRemoveButton(coordinate)
    } else {
      helpTooltipElement.className = 'BMapLabel'
      helpTooltipElement.innerHTML = "<span class='BMap_diso'><span class='BMap_disi'>" + length + '</span></span>'
    }
    let tempMeasureTooltip = new ol.Overlay({
      element: helpTooltipElement,
      offset: [10, -10],
      positioning: 'center-center'
    })
    this.map.addOverlay(tempMeasureTooltip)
    tempMeasureTooltip.setPosition(coordinate)
    tempMeasureTooltip.set('uuid', this.drawSketch.get('uuid'))
  }

  /**
   * 添加移除按钮
   * @param coordinate
   */
  addMeasureRemoveButton (coordinate) {
    let pos = [coordinate[0] - 5 * this.map.getView().getResolution(), coordinate[1]]
    let btnImg = document.createElement('img')
    btnImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEYzMzc1RDY3RDU1MTFFNUFDNDJFNjQ4NUUwMzRDRDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEYzMzc1RDc3RDU1MTFFNUFDNDJFNjQ4NUUwMzRDRDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0RjMzNzVENDdENTUxMUU1QUM0MkU2NDg1RTAzNENENiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0RjMzNzVENTdENTUxMUU1QUM0MkU2NDg1RTAzNENENiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsDx84AAAAC3SURBVHjavJIxDoMwDEV/ok5wDCbu0DvAdUBIwMLFSs/AxDXY6tZ2SCGVUikd+ifn20+2k5hHVd0AXJGmGQw+UyWMxY8KQGpbUNcB23aYHIsnuSgIy8dlAQ2DgwWSmD0YE5ReAq5pQOMIrKsDRByjKGC/dsxz2L7XQgU8JB7n4qDoY6SYF4J+p72T7/zeOXqr03SMx8XnsTUX7UgElKVCyDK3s8Tsae6sv/8ceceZ6jr1k99fAgwAsZy0Sa2HgDcAAAAASUVORK5CYII='
    btnImg.style.cursor = 'pointer'
    btnImg.title = '清除测量结果'
    btnImg.groupId = this.drawSketch.get('uuid')
    btnImg.pos = coordinate
    btnImg.onclick = evt => {
      this.RemoveMeasure(btnImg.groupId, coordinate)
    }
    let closeBtn = new ol.Overlay({
      element: btnImg,
      offset: [-2, -6],
      positioning: 'center-center'
    })
    this.map.addOverlay(closeBtn)
    closeBtn.setPosition(pos)
    closeBtn.set('uuid', this.drawSketch.get('uuid'))
  }

  /**
   * 面积测量结果
   */
  createMeasureAreaTooltip () {
    this.measureAreaTooltipElement = document.createElement('div')
    this.measureAreaTooltipElement.style.marginLeft = '-6.25em'
    this.measureAreaTooltipElement.className = 'measureTooltip hidden'
    this.measureAreaTooltip = new ol.Overlay({
      element: this.measureAreaTooltipElement,
      offset: [15, 0],
      positioning: 'center-left'
    })
    this.map.addOverlay(this.measureAreaTooltip)
  }

  /**
   * 移除测量结果
   * @param groupId
   * @param pos
   * @constructor
   */
  RemoveMeasure (groupId, pos) {
    let overlays = this.getMap().getOverlays().getArray()
    if (overlays && Array.isArray(overlays)) {
      let length = overlays.length
      // TODO 注意地图移除Overlay时数组长度会变化
      for (let j = 0, i = 0; j < length; j++) {
        i++
        if (overlays[length - i] && overlays[length - i] instanceof ol.Overlay && overlays[length - i].get('uuid') === groupId) {
          this.map.removeOverlay(overlays[length - i])
        }
      }
    }
    if (this.layer && this.layer.getSource()) {
      let source = this.layer.getSource()
      let features = source.getFeatures()
      features.forEach(function (feat) {
        let lastCoord = feat.getGeometry().getLastCoordinate()
        if ((lastCoord[0] === pos[0] && lastCoord[1] === pos[1]) || feat.get('uuid') === groupId) {
          source.removeFeature(feat)
        }
      }, this)
    }
  }

  /**
   * 获取地图拖拽漫游交互
   * @returns {ol.interaction.DragPan|*|null}
   */
  getDragPanInteraction () {
    if (!this.dragPanInteraction) {
      let items = this.getMap().getInteractions().getArray()
      items.forEach(item => {
        if (item && item instanceof ol.interaction.DragPan) {
          this.dragPanInteraction = item
        }
      })
    }
    return this.dragPanInteraction
  }

  /**
   * 返回当前地图对象
   * @returns {ol.Map}
   */
  getMap () {
    return this.map
  }
}
export default MeasureTool
