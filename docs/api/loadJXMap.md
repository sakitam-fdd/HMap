# 加载江西地图

> 注意事项：
> * 配置项相关,详见配置项详解
> * 地图中心点 `[115.92466595234826, 27.428038204473552]`
> * 投影坐标系（projection）为 `EPSG:4326`。
> * 切片原点（origin）必须设置正确，江西为 `[-400, 399.9999999999998]`
> * 相关图层配置见下方

## Examples

[加载江西地图](../../example/loadJXMap.html)

<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>加载江西地图（arcgis服务）</title>
  <link rel="stylesheet" href="./lib/map/HMap.css" type="text/css">
  <script src="./lib/map/HMap.js"></script>
</head>
<body>
<div id="map"></div>
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
      altShiftDragRotate: true, // 是否允许`alt + shift`拖拽旋转（默认允许）
      doubleClickZoom: true, // 是否允许双击放大（默认允许）
      mouseWheelZoom: true, // 是否允许滚轮缩放（默认允许）
      shiftDragZoom: true,  // 是否允许`shift`加拖拽缩放（默认允许）
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
        layerName: 'vector',
        isDefault: true,
        layerType: 'TileXYZ',
        opaque: false, //图层是否不透明
        layerUrl: 'http://171.34.40.68:6080/arcgis/rest/services/JXMAP_2016_2/MapServer',
      }
    ]
  });
  console.log(Maps);
</script>
</body>
</html>

---
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>加载江西地图（arcgis服务）</title>
  <link rel="stylesheet" href="https://smilefdd.github.io/public/scripts/map/HMap.css" type="text/css">
  <script src="https://smilefdd.github.io/public/scripts/map/HMap.js"></script>
</head>
<body>
<div id="map"></div>
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
      altShiftDragRotate: true, // 是否允许`alt + shift`拖拽旋转（默认允许）
      doubleClickZoom: true, // 是否允许双击放大（默认允许）
      mouseWheelZoom: true, // 是否允许滚轮缩放（默认允许）
      shiftDragZoom: true,  // 是否允许`shift`加拖拽缩放（默认允许）
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
        layerName: 'vector',
        isDefault: true,
        layerType: 'TileXYZ',
        opaque: false, //图层是否不透明
        layerUrl: 'http://171.34.40.68:6080/arcgis/rest/services/JXMAP_2016_2/MapServer',
      }
    ]
  });
  console.log(Maps);
</script>
</body>
</html>
```