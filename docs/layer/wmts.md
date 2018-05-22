### WMTS图层加载

> 用于在

```javascript

```

#### 使用(添加图层)

```javascript
var wmtsLayer =   Map.createWMTSLayer('WMTS', {
   layerName: 'tianditu',
   isDefault: true,
   layerType: 'TileWMTS',
   projection: 'EPSG:4326',
   levels: 19,
   layer: 'vec',
   format: 'tiles',
   matrixSet: 'c',
   layerUrl: 'http://t{0-6}.tianditu.com/vec_c/wmts',
   create: true
});
Map.addLayer(wmtsLayer)
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
| addLayer | 是否叠加到地图上 | `Boolean` | 主要用于配置是否叠加地图，部分分析是只需要图层不需要叠加 |
| create | 是否创建图层 | `Boolean` | 此参数主要主要用作配置是否强制创建图层（为false时是查找图层返回）|
| levels | 图层级别 | `Number` | 最终加载的图层级别 |
| projection | 图层投影 | `String ol.Projection` | 默认为 `EPSG:3857` |
| extent | 图层范围 | `Array` | 图层的范围 |
| zIndex | 堆叠顺序 | `Number` | 设置图层的堆叠顺序 |
| matrixSet | 矩阵集 | `String` | 矩阵集 |
| format | 数据格式 | `String` | 数据格式 默认为`image/png` |
| crossOrigin | 透明度 | `null  string  undefined` | 跨域相关设置 |
| version | 版本号 | `String` | 查询服务版本号 默认`1.0.0` |
| dimensions |  | `无` |  |
| style | 样式名称 | `String` | 发布的样式名称 |

