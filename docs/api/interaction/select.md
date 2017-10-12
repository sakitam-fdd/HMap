## 添加要素选择交互

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
```javascript
  var vectorSource = new ol.source.Vector({
    url: 'https://openlayers.org/en/v4.4.1/examples/data/geojson/countries.geojson',
    format: new ol.format.GeoJSON()
  });

  var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Vector({
        source: vectorSource
      })
    ],
    target: 'map',
    view: new ol.View({
      center: [0, 0],
      zoom: 2
    })
  });
  var select = new ol.interaction.Select();
  map.addInteraction(select);
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.interaction.Select 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| addCondition | 使用键盘（toggle） | `ol.EventsConditionType` | 非必传 |
| condition | 使用键盘（toggle、add、remove） | `ol.EventsConditionType` | 非必传 |
| layers | 选择功能的图层列表 | `Array` | 非必传 |
| style | 样式 | `ol.style.Style` | 非必传 |
| removeCondition | 使用键盘（toggle） | `	ol.EventsConditionType` | 非必传 |
| toggleCondition | 使用键盘（add、remove） | `	ol.EventsConditionType` | 非必传 |
| multi | 确认所选择的地图位置仅选择单个要素或全部要素 | `Boolean` | 非必传 |
| features | 矢量要素 | `ol.Features` | 非必传 |
| filter | 如果该功能可以被选择或以其他方式返回 | `Function` | 非必传 |
| wrapX | 是否水平平铺 | `Boolean` | 非必传 |
| hitTolerance | 检查周围半径内的像素 | `Number` | 非必传 |
