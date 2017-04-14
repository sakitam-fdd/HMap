# 加载简单地图

###  引用
  
```html
  <script src='../dist/HMap.min.js'></script>
```

### 创建

```html
  <div id='map'></div>
```

```js
  var Maps = new HMap.Map()
```

### 初始化
```js
  Maps.initMap('map', {})
```


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

## 示例

[加载简单地图](../../example/loadSimpleMap.html)

{% raw %}
<link rel="stylesheet" href="./lib/map/HMap.css" type="text/css">
<script src="./lib/map/HMap.js"></script>
<style>
.map {
  width: 100%;
  height: 300px;
}
</style>
<div id="map" class="map"></div>
<script type="text/javascript">
  var Maps = new HMap.Map();
  Maps.initMap('map', {
    view: {
      center: [0, 0],
      enableRotation: true, // 是否允许旋转
      projection: 'EPSG:3857',
      rotation: 0,
      zoom: 5, // resolution
      zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
    },
    logo: {},
    baseLayers: [] // 不传时默认加载OSM地图。
  });
  console.log(Maps);
</script>
{% endraw %}

```html
<link rel="stylesheet" href="./lib/map/HMap.css" type="text/css">
<script src="./lib/map/map/HMap.js"></script>
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

### 参数:

|Name|Type|Description|
|:---|:---|:----------|
|`element`|`Element`| 元素id |
|`params`|`Object`| 包含视图`view`,控制器`controls`,交互工具`interactions`,版权`logo`,底图`baseLayers` |

### 方法

##### `initMap(mapDiv, params)`

> 初始化

##### `getMap()`
> 返回地图实例

### `setMap()`
> 设置地图实例

### `addControl(control)`
> 添加控制器（control instanceof ol.control.Control）

### 继承


