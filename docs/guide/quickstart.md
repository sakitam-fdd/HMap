## 快速开始

本文将带你迅速了解hmap javascript API的基本使用，学习如何基于hmap javascript api
开始地图应用的开发，使您在最短时间内成为webgis的开发者。

## 第一个示例

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>Title</title>
  <!--<link rel="stylesheet" href="../dist/hmap.css">-->
  <link rel="stylesheet" href="https://unpkg.com/hmap-js/dist/hmap.min.css">
  <style type="text/css">
    html, body, #map{
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
<div id="map"></div>
<!--<script src="../dist/hmap.js"></script>-->
<script src="https://unpkg.com/hmap-js/dist/hmap.min.js"></script>
<script type="text/javascript">
  var Map = new HMap('map', {
    controls: {
      loading: true,
      zoomSlider: true,
      fullScreen: true
    },
    interactions: {
      shiftDragZoom: false
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      projection: 'EPSG:3857',
      zoom: 5, // resolution
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        isDefault: true,
        layerType: 'OSM',
        opaque: true, //图层是否不透明
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });
</script>
</body>
</html>
```

### 尝试编辑它

<iframe width="100%" height="430" src="//jsrun.net/yUiKp/embedded/all/light/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### 分步剖析上面示例

* 在页面中引入hmap javascript API入口脚本和样式外链

注意：如果需要指定版本需要在 `hmap-js` 后加入 `@版本号`，比如 `https://unpkg.com/hmap-js@1.5.8/dist/hmap.min.js`

```html
<link rel="stylesheet" href="https://unpkg.com/hmap-js/dist/hmap.min.css">
<script type="text/javascript" src="https://unpkg.com/hmap-js/dist/hmap.min.js"></script>
```

* 创建地图容器

注意：容器必须存在

```html
<div id="map"></div>
``` 

* 指定地图容器大小

```css
html, body, #map{
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
```

* 创建地图

> 默认需要传入两个参数，第一个为上面创建的容器id，第二个参数为地图参数配置，配置详细说明见[配置项](api/map/map-options.md)

```javascript
var Map = new HMap('map', {
  controls: {
    loading: true,
    zoomSlider: true,
    fullScreen: true
  },
  interactions: {
    shiftDragZoom: false
  },
  view: {
    center: [12118909.300259633, 4086043.1061670054],
    projection: 'EPSG:3857',
    zoom: 5, // resolution
  },
  baseLayers: [
    {
      layerName: 'openstreetmap',
      isDefault: true,
      layerType: 'OSM',
      opaque: true, //图层是否不透明
      layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  ]
});
```

## 关于插件的使用说明(支持openlayers原生扩展的控件)

> HMap JavaScript API在核心功能之外提供了自定义控件扩展支持，可以按需使用，
  或者通过配置开启，比如工具条、比例尺、气泡，loading，标绘，测量工具等等，详细清单见下方总览，
  上面我们在页面开启了loading，缩放控制条，全屏控件，禁用了shiftDragZoom交互。
   

| 插件 | 简介 | 地址 | 备注 |
| --- | --- | --- | --- |
| 标绘 | 支持军事标绘功能扩展 | `https://github.com/sakitam-fdd/ol-plot` | 支持单独配合openlayers使用 |
| Echarts | Echarts图表的地图扩展 | `https://github.com/sakitam-fdd/ol3Echarts` | 支持单独配合openlayers使用 |
| wind-layer | 动态风向图层 | `https://github.com/sakitam-fdd/wind-layer` | 支持单独配合openlayers使用 |
| mapv | 百度出品的地图可视化工具 | `https://github.com/huiyan-fe/mapv` | 支持单独配合openlayers使用 |
