### 图层添加 addLayer(layer)

> 将指定的图层添加到该地图的*顶部*。 如果需要获取其他图层可以调用getLayers()

### 现有直接支持的图层类型

| 图层 | 简介 | 文档 | 备注 |
| --- | --- | --- | --- |
| VectorLayer | 矢量图层 | [VectorLayer](api/layer/vector.md) | 主要用于矢量要素渲染 |
| OSM | OSM图层 | [OSM](api/layer/OSM.md) | 主要用于加载OSM图层 |
| BaiDu | 百度地图相关图层加载 | [BaiDu](api/layer/BaiDu.md) | 主要用于加载百度地图相关图层 |
| GaoDe | 高德地图相关图层加载 | [GaoDe](api/layer/GaoDe.md) | 主要用于加载高德地图相关图层 |
| Google | 谷歌地图相关图层加载 | [Google](api/layer/Google.md) | 主要用于加载谷歌地图相关图层 |
| TileXYZ | XYZ图层 | [XYZ](api/layer/XYZ.md) | 主要用于加载XYZ图层（一般所有切片图层都可以变换到XYZ方式加载） |
| ArcGIS | ArcGIS切片图层加载 | [XYZ](api/layer/XYZ.md) | 内置使用的XYZ方式加载 |
| TileArcGISRest | TileArcGISRest图层加载 | [TileArcGISRest](api/layer/TileArcGISRest.md) | ArcGIS的动态渲染图层 |
| VectorTileLayer | 矢量切片图层 | [VectorTile](api/layer/vectorTile.md) | 主要用于矢量图层渲染 |
| MapboxVectorTileLayer | MapBox矢量切片图层 | [MapboxVectorTile](api/layer/MapboxVectorTile.md) | MapBox矢量切片图层加载 |
| WMTS | OGC标准的WMTS图层 | [WMTS](api/layer/wmts.md) | 标准图层加载方式 |
| TileWMS | OGC标准的WMS图层 | [TileWMS](api/layer/TileWMS.md) | 标准图层加载方式(切片方式) |
| ImageWMS | OGC标准的WMS图层 | [ImageWMS](api/layer/ImageWMS.md) | 标准图层加载方式(切片方式) |
| WfsVector | WFS方式请求的矢量要素图层 | [WfsVector](api/layer/WfsVector.md) | 主要用于WFS矢量要素的渲染请求 |
| VectorFeature | 矢量要素图层 | [VectorFeature](api/layer/VectorFeature.md) | 主要用于矢量要素的渲染请求 |
| ImageLayer | 静态图片 | [ImageLayer](api/layer/ImageLayer.md) | 对应的是一整张图，而不像瓦片那样很多张图，从而无需切片，也可以加载一些地图，适用于一些小场景地图 |
