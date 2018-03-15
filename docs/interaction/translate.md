## 添加转换（移动）功能交互

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。

* 注：此功能要配置 ol.interaction.Translate() 使用  
  
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
  var select = new ol.interaction.Select();
  var translate = new ol.interaction.Translate({
    features: select.getFeatures()
  });
  Map.addInteraction(select)
  Map.addInteraction(translate)
```  

* ol.interaction.Translate 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| features | 要素级 | `ol.Collection` | 非必传 不指定 地图上的所有功能都将被翻译|
| layers | 要应用的图层列表 | `Array` | 非必传 |
| hitTolerance | 检查周围半径内的像素 | `Number` | 非必传 |
