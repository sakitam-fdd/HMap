## 添加Shift + 鼠标拖动缩放

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。

* 使用 通过shift键 + 鼠标进行使用
  
```javascript
  var Map = new HMap('map', {
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      projection: 'EPSG:3857',
      zoom: 5, // resolution
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        isDefault: true,
        layerType: 'OSM',
        opaque: true, //图层是否不透明
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  })

  var interactionDragZoom = new ol.interaction.DragZoom({})
  Map.addInteraction(interactionDragZoom)
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.interaction.DragZoom 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名 可自定义 | `String` | 非必传 默认 ```ol-dragzoom``` |
| condition | 键盘选择 | `ol.EventsConditionType` | 非必传 默认 `ol.events.condition.shiftKeyOnly` |
| duration | 动画持续时间 | `Number` | 非必传 单位毫秒 默认400毫秒 |
| out | 使用互动来缩小zoom | `Boolean` | 非必传 |
