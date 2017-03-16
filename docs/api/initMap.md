# 加载简单地图

## API

### `var Maps = new HMap.Map()`
> 创建地图实例

### `Maps.initMap('map', params)`
> 接收两个参数
> * 元素id `<div id='map'></div>`
> * 地图参数
```javascript
var params = { // 简单参数说明
  view: {
    center: [0, 0],
    projection: 'EPSG:3857', // 可不传默认EPSG:3857
    zoom: 1, // resolution
  },
  logo: {},
  baseLayers: [] // 不传时默认加载OSM地图。
}
```

## Examples

[加载简单地图](../../example/loadSimpleMap.html)

<html lang="en">
<head>
	<link rel="stylesheet" href="./lib/map/HMap.css" type="text/css">
  <script src="./lib/map/HMap.js"></script>
  <style>
    .map {
      width: 100%;
      height: 300px;
    }
  </style>
</head>
<div id="map" class="map"></div>
<script type="text/javascript">
  var Maps = new HMap.Map();
  Maps.initMap('map', {
    view: {
      center: [0, 0],
      enableRotation: true, // 是否允许旋转
      projection: 'EPSG:3857',
      rotation: 0,
      zoom: 0, // resolution
      zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
    },
    logo: {},
    baseLayers: [] // 不传时默认加载OSM地图。
  });
  console.log(Maps);
</script>
</body>
</html>

```html
<link rel="stylesheet" href="https://smilefdd.github.io/public/scripts/map/HMap.css" type="text/css">
<script src="https://smilefdd.github.io/public/scripts/map/HMap.js"></script>
<div id="map" class="map"></div>
```
```javascript
var Maps = new HMap.Map();
  Maps.initMap('map', {
    view: {
      center: [0, 0],
      enableRotation: true, // 是否允许旋转
      projection: 'EPSG:3857',
      rotation: 0,
      zoom: 0, // resolution
      zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
    },
    logo: {},
    baseLayers: [] // 不传时默认加载OSM地图。
  });
  console.log(Maps);
```

### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`element`|`Element`| 元素id |
|`params`|`Object`| 包含视图`view`,控制器`controls`,交互工具`interactions`,版权`logo`,底图`baseLayers` |

### Methods

##### `initMap(mapDiv, params)`

> 初始化

##### `getMap()`
> 返回地图实例

### `setMap()`
> 设置地图实例

### `addControl(control)`
> 添加控制器（control instanceof ol.control.Control）

### Inherited


