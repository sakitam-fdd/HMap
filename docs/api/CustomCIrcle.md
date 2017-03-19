#周边搜索

> 注意事项:
> * 地图必须初始化 `var Maps = new HMap.map('div', {}')`
> * 必须传输圆的中心点坐标和圆的半径
> * 必须初始化周边搜索类

## API

### `var CustomCircle = new HMap.CustomCircle(Maps.map,options)`
> 创建周边搜索实例

### `CustomCircle.initCustomCircle('map', options)`

## Examples
[开启周边搜索实例](../../example/CustomCircle.html)

<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>周边搜索（自定义圆）</title>
  <link rel="stylesheet" href="./lib/map/HMap.css" type="text/css">
  <script src="./lib/map/HMap.js"></script>
</head>
<body>
<button onclick="customCircle()">开启周边搜索</button>
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

  function customCircle() {
    Maps.map.once("click", function (evt) {
      addCircle(evt.coordinate);
    })
  }
  function addCircle(coordinate) {
    var options = {
      center: coordinate,
      distance: 5000,
      successCallback: function (geometry, center, radius) {

      },
      centerPoint:{
        src:"./images/marker.png"
      }
    }
    var customCircle = new HMap.CustomCircle(Maps.map, options);
    customCircle.initCustomCircle()
  }
</script>
</body>
</html>

---
```html
<div id="map"></div>
```

```javascript
function addCircle(coordinate) {
    var options = {
      center: coordinate,
      distance: 5000,
      successCallback: function (geometry, center, radius) {

      }
    };
    var customCircle = new HMap.CustomCircle(Maps.map, options);
    customCircle.initCustomCircle();
}
```

### Parameters:

####constructor Parameters:
|Name|Type|Description|
|:---|:---|:----------|
|`map`|`ol.Map`| `地图对象` |
|`options`|`Object`| `相关参数` |

####options Parameters:
|Name|Type|Description|
|:---|:---|:----------|
|`center`|`Array`| `中心点坐标（必传）` |
|`distance`|`number`| `圆的半径（必传）` |
|`style`|`ol.style.Style`| `圆的样式` |
|`centerPoint.src`|`string`| `中心点图标` |
|`successCallback`|`Funtion`| `加载成功事件` |

### Methods
##### `_getGeometry()`
> 返回geometry对象 return ol.geom.Circle() 
##### `_getWKT()`
> 返回标准WKT数据
##### `_getCenter()`
> 返回中心点坐标  return Array
##### `_getRadius()`
> 返回圆的半径 return string
##### `_getFirstCoordinate()`
> 返回圆的第一个坐标 return Array
##### `_getLastCoordinate()`
> 返回圆的最后一个坐标 return Array
##### `_setRadius(radius)`
> 设置圆的半径

###### Parameters:
|Name|Type|Description|
|:---|:---|:----------|
|`radius`|`number`| `圆的半径` |

##### `_setCenter(center)`
> 设置圆的中心点
##### Parameters:
|Name|Type|Description|
|:---|:---|:----------|
|`center`|`Array`| `圆的中心点` |

##### `_setCenterPoint(src)`
> 设置圆的中心点样式
##### Parameters:
|Name|Type|Description|
|:---|:---|:----------|
|`src`|`String`| `图片路径` |

###Event
##### `successCallback(geometry,center,radius)`
> 执行结束事件
##### Parameters:
|Name|Type|Description|
|:---|:---|:----------|
|`geometry`|`WKT`| `标准WKT数据` |
|`center`|`Array`| `圆的中心点` |
|`radius`|`number`| `圆的半径` |