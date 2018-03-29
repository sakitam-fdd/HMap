### WMS图层加载

> 用于在

```javascript

```

#### 使用(添加图层)

```javascript
var WMSLayer =  Map.createTileWMSLayer('WMS', {
   layerName: 'WMS',
   layerUrl: 'http://211.101.37.253:8089/geoserver/waio_jx/wms',
   layers: 'waio_jx:waio_weather_ss_fc',
   style: 'waio_weather_visibilitys',
   projection: 'EPSG:4326',
   tiled: true,
   tiledsorrigin: '109.716316223145,39.0473251342773',
   create: true,
   viewparams: 'lx:10010105'
});
Map.addLayer(WMSLayer)
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
| layerUrl | 图层服务地址 | `String` | 传入的是wms图层服务发布的地址 此值必传 |
| layers | 图层名称 | `String` | 发布服务时图层的名称 此值必传 |
| style | 图层样式 | `String` | 对应发布的图层样式名称 |
| width | 宽度 | `Number` | 切片宽度 |
| height | 高度 | `Number` | 切片高度 |
| bbox | 范围 | `Array` | 查询的图层范围 |
| src | 投影坐标系 | `String` | 投影坐标系 默认为`EPSG:3857` |
| tiled | 是否切片 | `Boolean` | 是否切片加载 |
| format | 数据格式 | `String` | 加载的数据格式 默认为 `image/png` |
| viewparams | 查询参数 | `String` | 查询参数 格式为 `field1:value1,field2:value2` |
| zIndex | 堆叠顺序 | `Number` | 设置图层的堆叠顺序 |
| crossOrigin | 透明度 | `null  string  undefined` | 跨域相关设置 |
| create | 是否创建图层 | `Boolean` | 此参数主要主要用作配置是否强制创建图层（为false时是查找图层返回）|
| addLayer | 是否叠加到地图上 | `Boolean` | 主要用于配置是否叠加地图，部分分析是只需要图层不需要叠加 |
| visible | 是否可见 | `Boolean` | 设置图层是否可见 |
| opacity | 透明度 | `Number` | 设置图层透明度 |
