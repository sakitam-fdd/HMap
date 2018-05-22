## 添加图层滤镜功能

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
```javascript
  var key = 'As1HiMj1PvLPlqc_gtM7AqZfBL8ZL3VrjaS3zIb22Uvb9WKhuJObROC-qUpa81U5';

  var firstLayer = new ol.layer.Tile({
    source: new ol.source.BingMaps({key: key, imagerySet: 'Road'})
  });

  var sec = new ol.layer.Tile({
    visible: false,
    source: new ol.source.BingMaps({key: key, imagerySet: 'Aerial'})
  });
  var map = new ol.Map({
    layers: [firstLayer, sec],
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat([-109, 46.5]),
      zoom: 6
    })
  });

  var LayerSpyglass = new ol.interaction.LayerSpyglass({
    spyLayer: sec
  });
  map.addInteraction(LayerSpyglass); // 添加滤镜
  map.removeInteraction(LayerSpyglass); // 移除滤镜
```  

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| spyLayer | 应用滤镜的图层 | `ol.Layer` | 必传 |
| radius | 滤镜半径 | `Number` | 非必传 默认75 |
| minRadius | 滤镜最大半径 | `Number` | 非必传 默认150 |
| maxRadius | 滤镜最小半径 | `Number` | 非必传 默认25 |
| lineWidth | 滤镜边框宽度 | `Number` | 非必传 默认5 |
| strokeStyle | 滤镜边线颜色 | `String` | 非必传 默认rgba(0, 0, 0, 0.5) |
| zoomInKeyCode | 滤镜放大对应键值 | `Number` | 非必传 默认38 'Up' |
| zoomOutKeyCode | 滤镜缩小对应键值 | `Number` | 非必传 默认40 'Down' |
