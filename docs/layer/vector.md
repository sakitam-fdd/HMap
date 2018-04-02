### 矢量图层加载

> 用于在 

```javascript
tileUrlFunction: function (tileCoord) {
  return 'http://192.168.0.226:8089/geoserver/gwc/service/tms/1.0.0/lwjk:roadSituation' + '@EPSG%3A4326@pdf/' + (tileCoord[0] - 1) + '/' + tileCoord[1] + '/' + (Math.pow(2, tileCoord[0] - 1) + tileCoord[2]) + '.geojson'
}
```

#### 使用(添加图层)

```javascript
var vectorTileLayer = Map.createVectorTileLayer('vectorTile', {
   create: true,
   addLayer: true,
   layerUrl: 'http://192.168.0.226:8089/geoserver/gwc/service/tms',
   projection: new ol.proj.Projection({
     code: 'EPSG:4326',
     units: 'degrees'
   }),
   format: 'GeoJSON',
   tileGrid: {
     extent: [-180, -90, 180, 90],
     gridType: 'XYZ',
     maxZoom: 22
   },
   style: function (features, resolution) {
     return new ol.style.Style({
       stroke: new ol.style.Stroke({
         color: '#18BF00',
         width: 3
       })
     })
   },
   tileUrlFunction: function (tileCoord) {
     return 'http://192.168.0.226:8089/geoserver/gwc/service/tms/1.0.0/lwjk:roadSituation' + '@EPSG%3A4326@pdf/' + (tileCoord[0] - 1) + '/' + tileCoord[1] + '/' + (Math.pow(2, tileCoord[0] - 1) + tileCoord[2]) + '.geojson'
   }
});
Map.addLayer(vectorTileLayer)
```

#### 尝试编辑它

---

<iframe width="100%" height="430"></iframe>

#### 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| layerName | 图层名 | `String` | 需要进行图层管理时必传 |
| layerParams | 图层参数 | `Object` | 见下表 |

- layerParams

| 配置项 | 简介 | 类型 | 备注 |
| --- | ---- |--- | --- |
| layerUrl | 图层服务地址 | `String` | 主要传入的是切片服务地址，必须包含 `{x} {y} {z}` |
| create | 是否创建图层 | `Boolean` | 此参数主要主要用作配置是否强制创建图层（为false时是查找图层返回） |
| addLayer | 是否叠加到地图上 | `Boolean` | 主要用于配置是否叠加地图，部分分析是只需要图层不需要叠加 |
| visible | 是否可见 | `Boolean` | 设置图层是否可见 |
| projection | 图层投影 | `String ol.Projection` | 默认从地图视图获取 |
| zIndex | 图层的堆叠顺序 | `Number` | 设置图层的堆叠顺序 |
| renderBuffer | 缓冲区 | `Number` | 渲染器使用的缓冲区周围的缓冲区 默认值为`100` |
| renderMode | 渲染方式 | `Number` | 渲染方式 值为`image，hybrid，vector`，性能由高到低 |
| extent | 渲染方式 | `Array ol.Extent` | 图层渲染的边界范围 |
| opacity | 透明度 | `Number` | 设置图层透明度 |
| minResolution | 最小分辨率 | `Number` | 最小分辨率 |
| maxResolution | 最大分辨率 | `Number` | 最大分辨率 |
| preload | 预加载 | `Number` | 默认值为`0` 这意味着没有预加载 |
| format | 数据格式 | `String` | 数据格式 详细内容 值 见下表 |
| cacheSize | 缓存大小 | `Number` | 缓存大小 默认值`128` |
| crossOrigin | 透明度 | `null  string  undefined` | 跨域相关设置 |
| state | 源状态 | `ol.source.State` | 源状态 |
| overlaps | 是否有重叠 | `Boolean` | 这个源可能有重叠的几何图形 渲染器可优化填充 |
| tileClass | 类 | `Funciton` | 实例化矢量块的类 默认值为 `ol.VectorTile` |
| tilePixelRatio |  | `无` |  |
| layerUrl | 网址 | `String` | 网址 |
| layerUrls | 一组网址 | `Array` | 一组 |
| tileUrlFunction | 获得瓦片坐标和投影 | `ol.TileUrlFunctionType` | 可以获得给定瓦片坐标和投影的瓦片URL |
| tileLoadFunction | 加载图块 | `ol.TileLoadFunctionType ` | 可以在给定URL的情况下加载图块 |
| style | 样式函数 | `Function` | 样式函数 |
| tileGrid | 切片图层渲染网络 | `Object` | 见下表 |

- format 矢量数据格式化类型

| 参数 | 对应 |
| --- | ---- |
| MVT | `new ol.format.MVT()` |
| GeoJSON | `new ol.format.GeoJSON()` |
| EsriJSON | `new ol.format.EsriJSON()` |
| TopoJSON | `new ol.format.TopoJSON()` |
| IGC | `new ol.format.IGC()` |
| Polyline | `new ol.format.Polyline()` |
| WKT | `new ol.format.WKT()` |
| GMLBase | `new ol.format.GMLBase()` |
| GPX | `new ol.format.GPX()` |
| KML | `new ol.format.KML()` |
| OSMXML | `new ol.format.OSMXML()` |
| WFS | `new ol.format.WFS()` |
| WMSGetFeatureInfo | `new ol.format.WMSGetFeatureInfo()` |

- tileGrid

| 配置项 | 简介 | 类型 | 备注 |
| --- | ---- |--- | --- |
| gridType | tileGrid类型 | `String` | tileGrid类型 `XYZ WMTS` |
| tileSize | 切片大小 | `Number Array` | 切片服务使用的切片尺寸。默认值为 `[256,256]` 像素 |
| resolutions | 分辨率 | `Array` | 每个分辨率的阵列索引需要与缩放级别匹配。这意味着即使配置了minZoom，分辨率数组的长度也将为maxZoom + 1 |
| extent | 图层范围 | `Array` | 图层的范围。 ol.source.Tile来源将不需要这个范围之外的图块。当没有配置原点或原点时，原点将被设置到范围的左上角 |
| origin | 切片原点 | `Array` | 瓦片网格原点，即x和y轴相交（[z, 0, 0]）。平铺坐标从左到右增加。如果没有指定，必须提供 `extent` 或 `origins` |
| matrixIds | 矩阵集 | `String` | 矩阵集 |
| widths | 每级对应的图块列数 | `Number` | 每级对应的图块列数 即每个分辨率都有对应匹配的条目 |
| minZoom | 最小级别 | `Number` | 允许的最小级别，小于此级别将不再显示 |

