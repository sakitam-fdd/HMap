## 添加鼠标基类操作

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
```javascript
  var interactionPointer = new ol.interaction.Pointer({
    handleDownEvent: handleDownEvent,
    handleDragEvent: handleDragEvent,
    handleMoveEvent: handleMoveEvent,
    handleUpEvent: handleUpEvent
  })
  function handleDownEvent(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature) {
        return feature;
      });

    if (feature) {
      this.coordinate_ = evt.coordinate;
      this.feature_ = feature;
    }

    return !!feature;
  }

  function handleDragEvent(evt) {
    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry());
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
  }

  function handleMoveEvent(evt) {
    if (this.cursor_) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
          return feature;
        });
      var element = evt.map.getTargetElement();
      if (feature) {
        if (element.style.cursor != this.cursor_) {
          this.previousCursor_ = element.style.cursor;
          element.style.cursor = this.cursor_;
        }
      } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
      }
    }
  }

  function handleUpEvent(evt) {
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
  }
  var pointFeature = new ol.Feature(new ol.geom.Point([0, 0]));

  var lineFeature = new ol.Feature(
    new ol.geom.LineString([[-1e7, 1e6], [-1e6, 3e6]]));

  var polygonFeature = new ol.Feature(
    new ol.geom.Polygon([[[-3e6, -1e6], [-3e6, 1e6],
      [-1e6, 1e6], [-1e6, -1e6], [-3e6, -1e6]]]));


  var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.TileJSON({
          url: 'https://api.tiles.mapbox.com/v3/mapbox.geography-class.json?secure'
        })
      }),
      new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [pointFeature, lineFeature, polygonFeature]
        }),
        style: new ol.style.Style({
          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 0.95,
            src: 'https://openlayers.org/en/v4.4.1/examples/data/icon.png'
          })),
          stroke: new ol.style.Stroke({
            width: 3,
            color: [255, 0, 0, 1]
          }),
          fill: new ol.style.Fill({
            color: [0, 0, 255, 0.6]
          })
        })
      })
    ],
    target: 'map',
    view: new ol.View({
      center: [0, 0],
      zoom: 2
    })
  });

  map.addInteraction(interactionPointer)
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.interaction.Pointer 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| handleDownEvent | 处理down事件 | `Function` | 返回true则启动拖拽 |
| handleDragEvent | 处理drag事件 | `Function` | 拖拽期间移动功能 |
| handleEvent | 地图调用来通知交互 | `Function` | 返回false 防止交互链中的其他交互 |
| handleMoveEvent | 处理move事件 | `Function` | 功能处理'移动'事件 |
| handleUpEvent | 处理up事件 | `Function` | 返回false则当前拖动停止 |
