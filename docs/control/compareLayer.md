### 添加图层对比控件

> 为用户提供了单独的图层对比控件，可手动添加，也可单独配合openlayers使用

#### 如何使用

> 图层对比控件(具体代码实现：[compareLayer](https://github.com/sakitam-fdd/ol-extent/blob/master/src/control/compareLayer.js))。
  此控件以实现并包含在HMap内部。所以你可以按照以下代码添加控件。

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的控件，然后调用 ``addControl()`` 方法添加控件。此添加方式也适合用户
  自定义的控件添加。
  
```javascript
  var firstLayer = {
    layerName: 'firstLayer',
    layerType: 'OSM',
    layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    addLayer: true,
    create: true
  }
  var secLayer = {
    layerName: 'secLayer',
    layerType: 'OSM',
    layerUrl: 'http://tile-{a-c}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    addLayer: true,
    create: true
  }
  var Map = new HMap('map', {
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5,
    }
  });

  var layer1 = Map.createOSMLayer(firstLayer['layerName'], firstLayer)
  var layer2 = Map.createOSMLayer(secLayer['layerName'], secLayer)
  var olControlCompareLayer = new ol.control.CompareLayer(layer1, layer2)
  Map.addControl(olControlCompareLayer)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>  

参数项说明

| 参数项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| beforeMap | 对比图层之一 | `ol.Layer` | 必传 |
| afterMap | 对比图层之一 | `ol.Layer` | 必传 |
| options | 配置项 | `Object` | 非必传 |


配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名 可自定义 | `String` | 非必传传 默认class ```hmap-compare``` |
| initPosition | 当前截取位置占整个视图宽度的比例 | `Number` | 非必传 默认 0.5 |
| target | 控件的目标对象 | `Element` | 非必传 |

