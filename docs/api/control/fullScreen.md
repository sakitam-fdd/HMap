## 添加全屏控件

> 为用户提供了单独的全屏控件，可配置开启，也可手动添加，也可单独配合openlayers使用

### 如何使用

> 放大缩小控件(具体代码实现：[fullScreen](https://github.com/sakitam-fdd/ol-extent/blob/master/src/control/FullScreen.js))。
  此控件以实现并包含在HMap内部。所以你可以按照以下代码添加控件。

### 引入API

```html
<link rel="stylesheet" href="https://unpkg.com/ol-extent@1.1.1/dist/css/olControlFullScreenMenu.min.css" type="text/css">
<script src="https://unpkg.com/ol-extent@1.1.1/dist/olControlFullScreenMenu.min.js"></script>
```

* 配置中开启, 直接在controls设置fullScreen 为true。

```javascript
var Map = new HMap('map', {
    controls: {
      fullScreen: true
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
          layerName: 'openstreetmap',
          layerType: 'OSM',
          isDefault: true,
          layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      ]
    });
    var olControlFullScreenMenu = new ol.control.FullScreenMenu()
    Map.map.addControl(olControlFullScreenMenu)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

* 控件单独使用,配合openlayers 单独使用，通过 ``` new ol.control.FullScreenMenu() ``` 开启全屏控件

```html
<link rel="stylesheet" href="https://unpkg.com/openlayers@4.3.3/dist/ol.css" type="text/css">
<script src="https://unpkg.com/openlayers@4.3.3/dist/ol.js"></script>

<link rel="stylesheet" href="https://unpkg.com/ol-extent@1.1.1/dist/css/olControlFullScreenMenu.min.css" type="text/css">
<script src="https://unpkg.com/ol-extent@1.1.1/dist/olControlFullScreenMenu.min.js"></script>
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
          new ol.control.FullScreenMenu()
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

> fullScreen控件配置

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名，可自定义样式 | `String` | 非必传 默认使用封装好的 ```hmap-control-full-screen``` 样式 |
| label | 字体图标值 | `String` | 非必传 默认 `\u2922` |
| labelActive | 选中字体图标值 | `String` | 非必传 默认 `\u00d7` |
| keys | 快捷键设置 | `Boolean` | 非必传 |
| size | 图标大小 | `Array` | 非必传 默认 [16, 16] |
| source | 要放大的容器 | `Elment` | 非必传 |
| target | 控件的目标对象 | `Element` | 非必传 |
