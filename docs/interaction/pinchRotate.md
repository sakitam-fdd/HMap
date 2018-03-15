## 添加触摸操作，双指旋转视图

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
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
  var interactionPinchRotate = new ol.interaction.PinchRotate({})
  Map.addInteraction(interactionPinchRotate)
```  

* ol.interaction.PinchRotate 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| duration | 动画持续时间 | `Number` | 非必传 单位毫秒 默认250毫秒 |
| threshold | 旋转角度 | `Number` | 非必传 默认0.3 |
