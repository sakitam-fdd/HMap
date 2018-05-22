### 矢量图层加载

> 用于在 

```javascript

```

#### 使用(添加图层)

```javascript

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
| cacheSize | 缓存大小 | `Number` | 缓存大小 默认值`128` |
| crossOrigin | 透明度 | `null  string  undefined` | 跨域相关设置 |
| overlaps | 是否有重叠 | `Boolean` | 这个源可能有重叠的几何图形 渲染器可优化填充 |
| tilePixelRatio |  | `无` |  |
| layerUrl | 网址 | `String` | 网址 |
| tileGrid | 切片图层渲染网络 | `Object` | 见下表 |

- tileGrid

| 配置项 | 简介 | 类型 | 备注 |
| --- | ---- |--- | --- |
| tileSize | 切片大小 | `Number Array` | 切片服务使用的切片尺寸。默认值为 `[256,256]` 像素 |
| extent | 图层范围 | `Array` | 图层的范围。 ol.source.Tile来源将不需要这个范围之外的图块。当没有配置原点或原点时，原点将被设置到范围的左上角 |
| minZoom | 最小级别 | `Number` | 允许的最小级别，小于此级别将不再显示 |
| maxZoom | 最大级别 | `Number` | 允许的最大级别，大于此级别将不再显示 |
