# 添加点要素

> * 地图必须初始化 `var Maps = new HMap.map('div', {}')`

## Examples

[要素面添加实例](../../example/addPolygons.html)

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>测试添加面</title>
  <link rel="stylesheet" href="./lib/map/HMap.css" type="text/css">
  <script src="./lib/map/HMap.js"></script>
</head>
<body>
<button onclick="addPolygon()">添加面</button>
<button onclick="addPolygons()">添加多面</button>
<button onclick="removePolygonById()">通过ID移除标绘面</button>
<button onclick="removePolygonByLayerName()">通过LayerName移除标绘面</button>
<div id="map"></div>
<script src="./lib/axios/axios.js"></script>
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
        layerName: 'vector',
        isDefault: true,
        layerType: 'TileXYZ',
        opaque: false, //图层是否不透明
        layerUrl: 'http://171.34.40.68:6080/arcgis/rest/services/JXMAP_2016_2/MapServer',
      }
    ]
  });
  console.log(Maps);
  function addPolygon () {
    // Make a request for a user with a given ID
    axios.get('./json/polygons.json')
      .then(function (response) {
        var polygon = response['data']['data']['features'][0];
        Maps.addPolygon(polygon, {
          layerName: 'test',
          zoomToExtent: true
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  function addPolygons () {
    axios.get('./json/polygons.json')
      .then(function (response) {
        var polygons = response['data']['data']['features'];
        Maps.addPolygons(polygons, {
          layerName: 'test',
          zoomToExtent: true
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  function removePolygonById () {
    Maps.removeFeatureById('ecc9f2ba-f899-4adb-a86a-284d81bf2911')
  }
  function removePolygonByLayerName () {
    Maps.removeFeatureByLayerName('test')
  }
</script>
</body>
</html>

---

```html
<div id="map"></div>
```
```javascript
function addPolygon () {
    // Make a request for a user with a given ID
    axios.get('./json/polygons.json')
      .then(function (response) {
        var polygon = response['data']['data']['features'][0];
        Maps.addPolygon(polygon, {
          layerName: 'test',
          zoomToExtent: true
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  function addPolygons () {
    axios.get('./json/polygons.json')
      .then(function (response) {
        var polygons = response['data']['data']['features'];
        Maps.addPolygons(polygons, {
          layerName: 'test',
          zoomToExtent: true
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  function removePolygonById () {
    Maps.removeFeatureById('ecc9f2ba-f899-4adb-a86a-284d81bf2911')
  }
  function removePolygonByLayerName () {
    Maps.removeFeatureByLayerName('test')
  }
```

### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`polygon`|`Object`| `标准空间要素` |
|`polygons`|`Array`| `标准空间要素` |
|`params`|`Object`| `相关参数` |

### Methods

##### `addPolygon(polygon, params)`

> 添加面

##### `addPolygons(polygons, params)`

> 添加多面

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`map`|`ol.Map`| 地图实例 |
