## 添加鼠标指针吸附要素交互

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
* 添加 ol.interaction.Snap() 必须在 ol.interaction.Draw() 和 ol.interaction.Modify()之后
  
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

  var draw = new ol.interaction.Draw({
    source: vector.getSource(),
    type: 'Point'
  })
  Map.addInteraction(draw)
  var modify = new ol.interaction.Modify({source: vector.getSource()});
  Map.addInteraction(modify);
  var snap = new ol.interaction.Snap({
    source: vector.getSource()
  })
  Map.addInteraction(snap)
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.interaction.Snap 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| features | 要素集 | `ol.Collection` | 非必传 |
| pixelTolerance | 捕捉发生的距离，像素数 | `Number` | 非必传 默认10 |
| edge | 是否对齐边缘 | `Boolean` | 非必传 |
| vertex | 是否对齐顶点 | `Boolean` | 非必传 |
| source | 具有捕捉功能的图层 | `ol.source.Vector` | 必传 |
