## 添加放大镜

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。

```html
```  
  
```javascript
  var Map = new HMap('map', {
    view: {
      center: [0, 0],
      zoom: 6
    },
    baseLayers: [
      {
        layerType: 'OSM',
        layerName: 'OSM',
        isDefault: true,
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  })

  var firstLayer = Map.getLayerByLayerName('OSM')
  var LayerMagnify = new ol.interaction.LayerMagnify({
    magnifyLayer: firstLayer
  });
  Map.addInteraction(LayerMagnify); // 添加放大镜
  Map.removeInteraction(LayerMagnify); // 移除放大镜
```  

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| magnifyLayer | 应用放大的图层 | `ol.Layer` | 必传 |
| radius | 放大镜半径 | `Number` | 非必传 默认75 |
| minRadius | 放大镜最大半径 | `Number` | 非必传 默认150 |
| maxRadius | 放大镜最小半径 | `Number` | 非必传 默认25 |
| lineWidth | 放大镜边框宽度 | `Number` | 非必传 默认2 |
| strokeStyle | 放大镜边线颜色 | `String` | 非必传 默认rgba(0, 0, 0, 0.5) |
| zoomInKeyCode | 滤镜放大对应键值 | `Number` | 非必传 默认38 'Up' |
| zoomOutKeyCode | 滤镜缩小对应键值 | `Number` | 非必传 默认40 'Down' |
