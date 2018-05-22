## 添加拉框绘制矢量要素

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
* 一般配合 ```ol.events.condition``` 使用
  
```javascript
  var Map = new HMap('map', {
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      projection: 'EPSG:3857',
      zoom: 5
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        isDefault: true,
        layerType: 'OSM',
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  })
  var interactionDragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.platformModifierKeyOnly
  })
  Map.addInteraction(interactionDragBox)
```  

* ol.interaction.DragBox 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名 可自定义 | `String` | 非必传 默认 ```ol-dragbox``` |
| condition | 键盘选择 | `ol.EventsConditionType` | 非必传 |
| minArea | 最小区域 | `Number` | 非必传 默认64 |
| boxEndCondition | 指示是否`boxend`触发事件 | `Function` | 非必传 |
