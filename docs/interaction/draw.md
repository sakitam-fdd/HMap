## 添加画笔交互

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
```javascript
  var Map = new HMap('map', {
    view: {
      center: [0, 0],
      zoom: 2
    }
  })
  var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'https://openlayers.org/en/v4.4.1/examples/data/geojson/countries.geojson',
      format: new ol.format.GeoJSON()
    })
  });
  Map.addLayer(vector)
  var draw = new ol.interaction.Draw({
    source: vector.getSource(),
    type: 'Circle'
  })
  Map.addInteraction(draw)
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.interaction.Draw 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| clickTolerance | 最大距离，单位像素 | `Number` | 非必传 |
| features | 要素集 | `ol.Collection` | 非必传 |
| source | 绘制特征的目的图层 | `ol.source.Vector` | 必传 |
| snapTolerance | 捕捉到绘图完成的像素距离 | `Number` | 非必传 默认12 |
| type | 绘图类型 | `String` | 必传 可传值有  `Point`  `LineString`  `Polygon`  `MultiPoint`  `MultiLineString`  `MultiPolygon`  `Circle`|
| maxPoints | 绘制多边形最大可绘制点数（绘制完成前） | `Number` | 非必传 默认 没有限制 |
| minPoints | 绘制多边形最小可绘制点数（绘制开始） | `Number` | 非必传 多边形（3） 线（2） |
| finishCondition | 指示绘图是否可以完成 | `ol.EventsConditionType` | 非必传 |
| style | 绘图样式 | `ol.style.Style` | 非必传 |
| geometryFunction | 坐标更新时调用函数 | `Function` | 非必传 |
| geometryName | 创建几何的交互名称 | `String` | 非必传 |
| condition | 指示是否处理该事件（添加顶点或取消激活手绘） | `ol.EventsConditionType` | 非必传 |
| freehand | 多边形和圆形的手写模式操作 | `Boolean` | 非必传 |
| freehandCondition | 激活线条和多边形手写绘制条件 | `ol.EventsConditionType` | 非必传 |
| wrapX | 是否水平覆盖 | `Boolean` | 非必传 |
