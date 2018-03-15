## 添加修改特征几何的交互

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
    source: new ol.source.Vector()
  })
  var feature1 = new ol.Feature({
    geometry: new ol.geom.Point([100, 100])
  })
  var style1 = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 10,
      fill: new ol.style.Fill({
        color: 'red'
      })
    })
  })
  feature1.setStyle(style1)
  vector.getSource().addFeature(feature1)
  Map.addLayer(vector)

  var modify = new ol.interaction.Modify({source: vector.getSource()});
  Map.addInteraction(modify);
```  

* ol.interaction.Modify 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| condition | 键盘选择 | `ol.EventsConditionType` | 非必传 |
| deleteCondition | 键盘选择（顶点缺失） | `ol.EventsConditionType` | 非必传 |
| insertVertexCondition | 键盘选择（添加新顶点） | `ol.EventsConditionType` | 非必传 |
| pixelTolerance | 像素容差 | `Number` | 非必传 默认10 |
| style | 编辑样式 | `ol.style.Style` | 非必传 |
| source | 数据源 | `ol.source.Vector` | 非必传 |
| features | 矢量数据 | `ol.Feature` | 非必传 |
| wrapX | 是否水平覆盖 | `Boolean` | 非必传 |
