## 添加图层平移缩放控件

> 为用户提供了单独的图层平移缩放控件，可配置开启，也可手动添加，也可单独配合openlayers使用

### 如何使用

> 图层平移缩放控件(具体代码实现：[bZoomSlider](https://github.com/sakitam-fdd/ol-extent/blob/master/src/control/BZoomSlider.js))。
  此控件以实现并包含在HMap内部。所以你可以按照以下代码添加控件。


### 引入API

```html
<link rel="stylesheet" href="https://unpkg.com/ol-extent@1.1.1/dist/css/olControlBZoomSlider.min.css" type="text/css">
<script src="https://unpkg.com/ol-extent@1.1.1/dist/olControlBZoomSlider.min.js"></script>
```

* 配置中开启, 直接在controls设置zoomSlider 为true。

```javascript
var Map = new HMap('map', {
    controls: {
      zoomSlider: true
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5,
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        layerType: 'OSM',
        isDefault: true,
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的控件，然后调用 ``addControl()`` 方法添加控件。此添加方式也适合用户
  自定义的控件添加。
  
```javascript
    var Map = new HMap('map', {
        view: {
          center: [12118909.300259633, 4086043.1061670054],
          zoom: 5,
        },
        baseLayers: [
          {
            layerName: 'firstLayer',
            layerType: 'OSM',
            isDefault: true,
            layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        ]
    });
    
    var olControlZoomSlider = new ol.control.BZoomSlider()
    Map.map.addControl(olControlZoomSlider)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>  

* 控件单独使用,配合openlayers 单独使用，通过 ``` new ol.control.BZoomSlider() ``` 开启平移缩放控件

```html
<link rel="stylesheet" href="https://unpkg.com/openlayers@4.3.3/dist/ol.css" type="text/css">
<script src="https://unpkg.com/openlayers@4.3.3/dist/ol.js"></script>

<link rel="stylesheet" href="https://unpkg.com/ol-extent@1.1.1/dist/css/olControlBZoomSlider.min.css" type="text/css">
<script src="https://unpkg.com/ol-extent@1.1.1/dist/olControlBZoomSlider.min.js"></script>
```

```javascript
    var map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        target: 'map',
        controls: [
          new ol.control.BZoomSlider()
        ],
        view: new ol.View({
          center: [0, 0],
          zoom: 2
        })
    });
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

> bZoomSlider控件配置

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| duration | 动画持续时间 | `Number` |  非必传  单位毫秒 默认200毫秒|
| pixelDelta | 移动增益 | `Number` | 非必传 默认128 |
| className | CSS类名| `String` | 非必传 默认 ```hmap-zoom-slider``` |
| render | 当控件重新呈现时调用的函数 | `Function` | 非必传 |
| target | 控件的目标对象 | `Element` | 可不传 |
