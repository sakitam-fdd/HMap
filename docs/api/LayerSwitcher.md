# 底图切换使用(plugins)

> * 地图必须初始化 `var Maps = new HMap.map('div', {}')`
> * 所有传入的图层必须有 `layerName`（图层名）
> * 初始化图层切换控件 `var layerSwitcher = new HMap.LayerSwitcher(Maps.map)`；
> * 传入图层名去控制图层 `layerSwitcher.switchLayer(layerName)`

## API

### `new HMap.LayerSwitcher(Maps.map)`

## Examples

[底图切换实例](../../example/LayerSwitcher.html)

<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>测试地图切换</title>
  <link rel="stylesheet" href="./lib/map/HMap.css" type="text/css">
  <script src="./lib/map/HMap.js"></script>
</head>
<body>
<button onclick="changeLayer('vector')">基本地图</button>
<button onclick="changeLayer('earth')">影像地图</button>
<button onclick="changeLayer('panorama')">地形图</button>
<div id="map"></div>
<script src="../dist/HMap.js"></script>
<script type="text/javascript">
  var cor = [
    {
      "level": 0,
      "resolution": 0.010986328383069278,
      "scale": 4617150
    },
    {
      "level": 1,
      "resolution": 0.005493164191534639,
      "scale": 2308575
    },
    {
      "level": 2,
      "resolution": 0.0027465809060368165,
      "scale": 1154287
    },
    {
      "level": 3,
      "resolution": 0.0013732916427489112,
      "scale": 577144
    },
    {
      "level": 4,
      "resolution": 6.866458213744556E-4,
      "scale": 288572
    },
    {
      "level": 5,
      "resolution": 3.433229106872278E-4,
      "scale": 144286
    },
    {
      "level": 6,
      "resolution": 1.716614553436139E-4,
      "scale": 72143
    },
    {
      "level": 7,
      "resolution": 8.582953794130404E-5,
      "scale": 36071
    },
    {
      "level": 8,
      "resolution": 4.291595870115493E-5,
      "scale": 18036
    },
    {
      "level": 9,
      "resolution": 2.1457979350577466E-5,
      "scale": 9018
    },
    {
      "level": 10,
      "resolution": 1.0728989675288733E-5,
      "scale": 4509
    },
    {
      "level": 11,
      "resolution": 5.363305107141452E-6,
      "scale": 2254
    },
    {
      "level": 12,
      "resolution": 2.681652553570726E-6,
      "scale": 1127
    }
  ];
  var resolutions = [];
  for (var i = 0; i < cor.length; i++) {
    resolutions.push(cor[i].resolution);
  }
  var Maps = new HMap.Map();
  Maps.initMap('map', {
    interactions: {
      altShiftDragRotate: true,
      doubleClickZoom: true,
      keyboard: true,
      mouseWheelZoom: true,
      shiftDragZoom: true,
      dragPan: true,
      pinchRotate: true,
      pinchZoom: true,
      zoomDelta: 1, // 缩放增量（默认一级）
      zoomDuration: 500 // 缩放持续时间
    },
    controls: {
      attribution: true,
      attributionOptions: {
        className: 'ol-attribution', // Default
        target: 'attributionTarget',
      },
      rotate: true,
      rotateOptions: {
        className: 'ol-rotate', // Default
        target: 'rotateTarget',
      },
      zoom: true,
      zoomOptions: {
        className: 'ol-zoom', // Default
        target: 'zoomTarget',
      },
      overViewMapVisible: false,
      scaleLineVisible: true
    },
    view: {
      center: [115.92466595234826, 27.428038204473552],
      resolutions: resolutions,
      fullExtent: [109.72859368643232, 24.010266905347684, 121.13105988819079, 30.76693489432357],
      tileSize: 256,
      origin: [-400, 399.9999999999998],
      enableRotation: true, // 是否允许旋转
      projection: 'EPSG:4326',
      rotation: 0,
      zoom: 1, // resolution
      zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
    },
    logo: {},
    baseLayers: [  // 不传时默认加载OSM地图。
      {
        layerName: 'vector', // 图层名，必传
        isDefault: true, // 是否是默认图层
        layerType: 'TileXYZ', // 图层类型（arcgis加载的为TileXYZ）
        layerUrl: 'http://171.34.40.68:6080/arcgis/rest/services/JXMAP_2016_2/MapServer',
      },
      {
        layerName: 'earth',
        layerType: 'TitleWMTS',
        layer: 'img',
        isDefault: false,
        layerUrl: 'http://t{0-6}.tianditu.cn/img_c/wmts',
        label: { // 对应的标注层
          layerName: 'TDTLabel',
          layerType: 'TitleWMTS',
          layer: 'cia',
          alias: 'earth', // 标注层所关联的图层
          isDefault: false,
          layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
        }
      },
      {
        layerName: 'panorama',
        layerType: 'TitleWMTS',
        layer: 'ter',
        isDefault: false,
        layerUrl: 'http://t{0-6}.tianditu.com/ter_c/wmts',
        label: {
          layerName: 'TDTLabel',
          layerType: 'TitleWMTS',
          layer: 'cia',
          alias: 'panorama',
          isDefault: false,
          layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
        }
      }
    ]
  });
  console.log(Maps);
  // 创建图层切换插件时map对象必传（new HMap.Map().map）
  var layerSwitcher = new HMap.LayerSwitcher(Maps.map);
  function changeLayer (type) {
    // type 对应的baseLayers图层组的layerName
    layerSwitcher.switchLayer(type)
  }
</script>
</body>
</html>

---

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>测试地图切换</title>
  <link rel="stylesheet" href="../dist/HMap.css" type="text/css">
</head>
<body>
<button onclick="changeLayer('vector')">基本地图</button>
<button onclick="changeLayer('earth')">影像地图</button>
<button onclick="changeLayer('panorama')">地形图</button>
<div id="map"></div>
<script src="../dist/HMap.js"></script>
<script type="text/javascript">
  var cor = [
    {
      "level": 0,
      "resolution": 0.010986328383069278,
      "scale": 4617150
    },
    {
      "level": 1,
      "resolution": 0.005493164191534639,
      "scale": 2308575
    },
    {
      "level": 2,
      "resolution": 0.0027465809060368165,
      "scale": 1154287
    },
    {
      "level": 3,
      "resolution": 0.0013732916427489112,
      "scale": 577144
    },
    {
      "level": 4,
      "resolution": 6.866458213744556E-4,
      "scale": 288572
    },
    {
      "level": 5,
      "resolution": 3.433229106872278E-4,
      "scale": 144286
    },
    {
      "level": 6,
      "resolution": 1.716614553436139E-4,
      "scale": 72143
    },
    {
      "level": 7,
      "resolution": 8.582953794130404E-5,
      "scale": 36071
    },
    {
      "level": 8,
      "resolution": 4.291595870115493E-5,
      "scale": 18036
    },
    {
      "level": 9,
      "resolution": 2.1457979350577466E-5,
      "scale": 9018
    },
    {
      "level": 10,
      "resolution": 1.0728989675288733E-5,
      "scale": 4509
    },
    {
      "level": 11,
      "resolution": 5.363305107141452E-6,
      "scale": 2254
    },
    {
      "level": 12,
      "resolution": 2.681652553570726E-6,
      "scale": 1127
    }
  ];
  var resolutions = [];
  for (var i = 0; i < cor.length; i++) {
    resolutions.push(cor[i].resolution);
  }
  var Maps = new HMap.Map();
  Maps.initMap('map', {
    interactions: {
      altShiftDragRotate: true,
      doubleClickZoom: true,
      keyboard: true,
      mouseWheelZoom: true,
      shiftDragZoom: true,
      dragPan: true,
      pinchRotate: true,
      pinchZoom: true,
      zoomDelta: 1, // 缩放增量（默认一级）
      zoomDuration: 500 // 缩放持续时间
    },
    controls: {
      attribution: true,
      attributionOptions: {
        className: 'ol-attribution', // Default
        target: 'attributionTarget',
      },
      rotate: true,
      rotateOptions: {
        className: 'ol-rotate', // Default
        target: 'rotateTarget',
      },
      zoom: true,
      zoomOptions: {
        className: 'ol-zoom', // Default
        target: 'zoomTarget',
      },
      overViewMapVisible: false,
      scaleLineVisible: true
    },
    view: {
      center: [115.92466595234826, 27.428038204473552],
      resolutions: resolutions,
      fullExtent: [109.72859368643232, 24.010266905347684, 121.13105988819079, 30.76693489432357],
      tileSize: 256,
      origin: [-400, 399.9999999999998],
      enableRotation: true, // 是否允许旋转
      projection: 'EPSG:4326',
      rotation: 0,
      zoom: 1, // resolution
      zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
    },
    logo: {},
    baseLayers: [  // 不传时默认加载OSM地图。
      {
        layerName: 'vector', // 图层名，必传
        isDefault: true, // 是否是默认图层
        layerType: 'TileXYZ', // 图层类型（arcgis加载的为TileXYZ）
        layerUrl: 'http://171.34.40.68:6080/arcgis/rest/services/JXMAP_2016_2/MapServer',
      },
      {
        layerName: 'earth',
        layerType: 'TitleWMTS',
        layer: 'img',
        isDefault: false,
        layerUrl: 'http://t{0-6}.tianditu.cn/img_c/wmts',
        label: { // 对应的标注层
          layerName: 'TDTLabel',
          layerType: 'TitleWMTS',
          layer: 'cia',
          alias: 'earth', // 标注层所关联的图层
          isDefault: false,
          layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
        }
      },
      {
        layerName: 'panorama',
        layerType: 'TitleWMTS',
        layer: 'ter',
        isDefault: false,
        layerUrl: 'http://t{0-6}.tianditu.com/ter_c/wmts',
        label: {
          layerName: 'TDTLabel',
          layerType: 'TitleWMTS',
          layer: 'cia',
          alias: 'panorama',
          isDefault: false,
          layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
        }
      }
    ]
  });
  console.log(Maps);
  // 创建图层切换插件时map对象必传（new HMap.Map().map）
  var layerSwitcher = new HMap.LayerSwitcher(Maps.map);
  function changeLayer (type) {
    // type 对应的baseLayers图层组的layerName
    layerSwitcher.switchLayer(type)
  }
</script>
</body>
</html>
```

### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`map`|`Object`| `地图对象（Maps.map）` |

### Methods

##### `switchLayer(layerName)`

> 切换图层

##### `getBaseLayerNames()`

> 返回所有底图的图层名（`Array`）

##### `setMap(map)`

> 设置地图对象

##### `getMap()`

> 返回地图对象

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`map`|`ol.Map`| 地图实例 |
