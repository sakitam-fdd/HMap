### TileXYZ图层加载

> 用于在URL模板中定义以XYZ格式的瓦片数据图层。 默认遵循Google切片规则。 

```javascript
tileUrlFunction: function (coordinate) {
  return'http://mapserver.com/'+ coordinate [0] +'/'+ coordinate [1] +'/'+ coordinate [2] +'.png';
}
```

#### 使用(添加图层)

```javascript
var xyzLayer = Map.createXYZLayer ('XYZ', {
  create: true,
  layerName: 'XYZ',
  layerUrl: 'https://s5.geohey.com/s/mapping/midnight/all?x={x}&y={y}&z={z}&retina=&ak=MGUxMmI2ZTk4YTVhNDEzYmJhZDJkNDM3ZWI5ZDAwOGE'
});
Map.addLayer(xyzLayer)
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
| tileSize | 切片大小 | `Number Array` | 切片服务使用的切片尺寸。默认值为 `[256,256]` 像素 |
| visible | 是否可见 | `Boolean` | 设置图层是否可见 |
| opacity | 透明度 | `Number` | 设置图层透明度 |
| maxZoom | 最大层级 | `Number` | 默认 `18` |
| minZoom | 最小层级 | `Number` | 默认 `0` |
| projection | 图层投影 | `String ol.Projection` | 默认从地图视图获取 |
| crossOrigin | 透明度 | `null  string  undefined` | 跨域相关设置 |
| tilePixelRatio | 像素比 | `Number` | 瓦片服务使用的像素比例。 例如，如果磁贴服务通过256px 256px的贴片，但实际上会发送512像素512像素的图像（对于retina / hidpi设备），则tilePixelRatio应设置为2.默认值为1。 |
| opaque | 设置图层不透明 | `Boolean` | 部分发布图层可能是透明背景，设置为 `true` 时不透明部分会默认白色填充 |
| tileGrid | 切片图层渲染网络 | `Object` | 见下表 |

- tileGrid

| 配置项 | 简介 | 类型 | 备注 |
| --- | ---- |--- | --- |
| resolutions | 分辨率 | `Array` | 每个分辨率的阵列索引需要与缩放级别匹配。这意味着即使配置了minZoom，分辨率数组的长度也将为maxZoom + 1 |
| origin | 切片原点 | `Array` | 瓦片网格原点，即x和y轴相交（[z, 0, 0]）。平铺坐标从左到右增加。如果没有指定，必须提供 `extent` 或 `origins` |
| tileSize | 切片大小 | `Number Array` | 切片服务使用的切片尺寸。默认值为 `[256,256]` 像素 |
| extent | 图层范围 | `Array` | 图层的范围。 ol.source.Tile来源将不需要这个范围之外的图块。当没有配置原点或原点时，原点将被设置到范围的左上角 |
| minZoom | 最小级别 | `Number` | 允许的最小级别，小于此级别将不再显示 |
