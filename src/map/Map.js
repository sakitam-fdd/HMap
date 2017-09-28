/**
 * Created by FDD on 2017/9/28.
 * @ 添加实例化后的方法
 */

class Map {
  /**
   * 添加控件
   * @param control
   */
  addControl (control) {
    if (this.map && control instanceof ol.control.Control) {
      this.map.addControl(control)
    } else {
      throw new Error('不存在地图或者传入控件对象有误！')
    }
  }

  /**
   * 添加交互
   * @param interaction
   */
  addInteraction (interaction) {
    if (this.map && interaction instanceof ol.interaction.Interaction) {
      this.map.addInteraction(interaction)
    } else {
      throw new Error('不存在地图或者传入交互对象有误！')
    }
  }

  /**
   * 添加图层
   * @param layer
   */
  addLayer (layer) {
    this.map.addLayer(layer)
  }

  /**
   * 添加overlay
   * @param overlay
   */
  addOverlay (overlay) {
    this.map.addOverlay(overlay)
  }

  /**
   * 增加修订计数器并调用change事件
   */
  changed () {
    this.map.changed()
  }

  /**
   * 触发事件
   * @param event
   * @returns {boolean|undefined}
   */
  dispatchEvent (event) {
    return this.map.dispatchEvent(event)
  }

  /**
   * 查找像素位置最近的要素
   * @param pixel
   * @param callback
   * @param options
   * @returns {T|undefined}
   */
  forEachFeatureAtPixel (pixel, callback, options) {
    return this.map.forEachFeatureAtPixel(pixel, callback, options)
  }

  /**
   * 查找像素位置的图层
   * @param pixel
   * @param callback
   * @param optThis
   * @param optLayerFilter
   * @param optThis2
   * @returns {T|undefined}
   */
  forEachLayerAtPixel (pixel, callback, optThis, optLayerFilter, optThis2) {
    return this.map.forEachLayerAtPixel(pixel, callback, optThis, optLayerFilter, optThis2)
  }

  /**
   * 获取set的属性值
   * @param key
   */
  get (key) {
    return this.map.get(key)
  }

  /**
   * 获取使用的控件
   * @returns {ol.Collection.<ol.control.Control>}
   */
  getControls () {
    return this.map.getControls()
  }

  /**
   * 获取开启的所有交互
   * @returns {ol.Collection.<ol.interaction.Interaction>}
   */
  getInteractions () {
    return this.map.getInteractions()
  }

  /**
   * 获取像素位置对应的坐标
   * @param pixel
   * @returns {ol.Coordinate}
   */
  getCoordinateFromPixel (pixel) {
    return this.map.getCoordinateFromPixel(pixel)
  }

  /**
   * 获取坐标对应的像素
   * @param coordinate
   * @returns {ol.Pixel}
   */
  getPixelFromCoordinate (coordinate) {
    return this.map.getPixelFromCoordinate(coordinate)
  }

  /**
   * 返回事件触发位置的坐标
   * @param event
   * @returns {ol.Coordinate}
   */
  getEventCoordinate (event) {
    return this.map.getEventCoordinate(event)
  }

  /**
   * 返回事件触发位置的像素
   * @param event
   * @returns {ol.Pixel}
   */
  getEventPixel (event) {
    return this.map.getEventPixel(event)
  }

  /**
   * 获取像素位置的所有要素
   * @param pixel
   * @param options
   * @returns {Array.<ol.Feature|ol.render.Feature>}
   */
  getFeaturesAtPixel (pixel, options) {
    return this.map.getFeaturesAtPixel(pixel, options)
  }

  /**
   * 获取图层组
   * @returns {ol.layer.Group}
   */
  getLayerGroup () {
    return this.map.getLayerGroup()
  }

  /**
   * 获取地图上所有图层
   * @returns {!ol.Collection.<ol.layer.Base>}
   */
  getLayers () {
    return this.map.getLayers()
  }

  /**
   * 根据id获取Overlay
   * @param id
   * @returns {ol.Overlay}
   */
  getOverlayById (id) {
    return this.map.getOverlayById(id)
  }

  /**
   * 获取地图上所有的overlay
   * @returns {ol.Collection.<ol.Overlay>}
   */
  getOverlays () {
    return this.map.getOverlays()
  }

  /**
   * 获取属性
   * @returns {Object.<string, *>}
   */
  getProperties () {
    return this.map.getProperties()
  }

  /**
   * 获取修订计数器
   * @returns {number}
   */
  getRevision () {
    return this.map.getRevision()
  }

  /**
   * 获取地图尺寸
   * @returns {ol.Size|undefined}
   */
  getSize () {
    return this.map.getSize()
  }

  /**
   * 获取初始化地图的要素对象
   * @returns {Element|string|undefined}
   */
  getTarget () {
    return this.map.getTarget()
  }

  /**
   * 获取目标对象
   * @returns {Element}
   */
  getTargetElement () {
    return this.map.getTargetElement()
  }

  /**
   * 获取对象属性名称列表。
   * @returns {Array.<string>}
   */
  getKeys () {
    return this.map.getKeys()
  }

  /**
   * 获取视图对象
   * @returns {ol.View}
   */
  getView () {
    return this.map.getView()
  }

  /**
   * 获取用作地图视口的元素
   * @returns {Element}
   */
  getViewport () {
    return this.map.getViewport()
  }

  /**
   * 所在像素是否有要素
   * @param pixel
   * @param options
   * @returns {boolean}
   */
  hasFeatureAtPixel (pixel, options) {
    return this.map.hasFeatureAtPixel(pixel, options)
  }

  /**
   * 移除控件
   * @param control
   * @returns {ol.control.Control|undefined}
   */
  removeControl (control) {
    return this.map.removeControl(control)
  }

  /**
   * 移除交互
   * @param interaction
   * @returns {ol.interaction.Interaction|undefined}
   */
  removeInteraction (interaction) {
    return this.map.removeInteraction(interaction)
  }

  /**
   * 手动调用渲染器
   */
  render () {
    this.map.render()
  }

  /**
   * 以同步方式请求（立即渲染）
   * @param key
   * @param value
   * @param silent
   */
  renderSync (key, value, silent) {
    this.map.renderSync(key, value, silent)
  }

  /**
   * 设置图层组
   * @param layerGroup
   */
  setLayerGroup (layerGroup) {
    this.map.setLayerGroup(layerGroup)
  }

  /**
   * 设置属性值
   * @param values
   * @param silent <更新而不触发事件>
   */
  setProperties (values, silent) {
    this.map.setProperties(values, silent)
  }

  /**
   * 设置地图大小
   * @param size
   */
  setSize (size) {
    this.map.setSize(size)
  }

  /**
   * 设置地图所在目标元素
   * @param target
   */
  setTarget (target) {
    this.map.setTarget(target)
  }

  /**
   * 获取当前地图
   * @returns {ol.Map|*}
   */
  getMap () {
    return this.map
  }

  /**
   * 设置地图实例
   * @param map
   */
  setMap (map) {
    if (map && map instanceof ol.Map) {
      this.map = map
    }
  }

  /**
   * 重新设置视图
   * @param view
   */
  setView (view) {
    if (this.map && view instanceof ol.View) {
      this.map.setView(view)
    } else {
      throw new Error('不存在地图或者传入视图对象有误！')
    }
  }

  /**
   * 取消属性
   * @param key
   * @param silent
   */
  unset (key, silent) {
    this.map.unset(key, silent)
  }

  /**
   * 更新地图大小
   * @returns {ol.Map|*|null|_openlayers2.Map.default}
   */
  updateSize () {
    if (this.map) {
      this.map.updateSize()
      return this.map
    } else {
      throw new Error('未实例化地图对象！')
    }
  }
}

export default Map
