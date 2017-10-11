## 添加Alt-Shift拖动旋转视图交互

> 用户可使用openlayers内置方法进行设置

* 使用openlayers 内置方法进行添加
* 注：该功能默认开启

```javascript
  var Map = new HMap('map', {
    interactions: {
      DragRotate: false
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5,
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
  });

  var interactionDragRotate = new ol.interaction.DragRotate({})
  Map.map.addInteraction(interactionDragRotate)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.interaction.DragRotate 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| condition | 键盘选择 | `	ol.EventsConditionType` | 非必传 默认 `ol.events.condition.altShiftKeysOnly` |
| duration | 动画持续时间 | `Number` | 非必传 默认250 |
