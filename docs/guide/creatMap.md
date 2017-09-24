## 如何创建一个地图

> 我们在创建一个地图之前虽然我们不需要深厚的GIS知识，但是至少
我们应该了解一个地图应该包含那些东西。

*核心组成部分：*

- 视图(`View`): 主要用于控制地图中心`center`、投影 `projection`、显示范围 `extent`、分辨率 `resolution`、
  旋转角度 `rotation`和默认显示层级 `zoom`。详细配置见 [视图配置项](api/view/view-options.md)

- 图层(`Layer`)：图层类是一个很重要的概念，不管是叠加的底图还是叠加的影像或者矢量图层都属于一个图层。在HMap里面一定要有层的概念，
  所有图层都可以看成一张画布，按规则叠放起来的。而且一般我们业务系统会有不同的业务图层，所以分层管理是一种图形显示和管理的有效方式。
  应用这种方式能有效处理地图数据来源的多样性和复杂性问题。详细见 [图层](api/layer/layer.md)
  
- 数据源(`Source`): 图层数据源，使用在图层Layer的内置实现上。渲染引擎支持多种多样在线
  或离线的数据源；可以是静态图或者瓦片图；也可以是栅格化的或者矢量的。如果你想在地图上
  加载某种格式的数据，或者某种服务提供的数据必须提供对应的数据源实现。详细见 [Source](api/source/source.md)

- 控件(`Control`)：本api提供了工具条、比例尺、视图旋转、鹰眼、基本图层切换等常用的控件。 
  它为用户提供了和地图交互的入口。所有内置控件可以通过配置开启，也可以自定义添加，同样支持
  openlayers原生控件使用。详细见 [控件](api/control/control.md)

- 交互(`Interaction`): 交互功能是一个地图基本的功能，这些功能是直接面向用户，如果没有交互你就没法完成地图漫游，放大缩小等基础
  操作。控件的相关实现也是基于交互的层级之上实现的，相关交互的可以通过配置开启，也可以自定义添加，同样支持
  openlayers原生实现的交互类的调用。详细见 [交互](api/interaction/interaction.md)


### 引入API


```html
<link rel="stylesheet" href="https://unpkg.com/hmap-js@1.5.0/dist/hmap.min.css">
<script type="text/javascript" src="https://unpkg.com/hmap-js@1.5.0/dist/hmap.min.js"></script>
```

### 创建地图容器
    
```html
<div id="map"></div>
``` 

### 指定地图容器

```javascript
var Map = new HMap('map');
```

### 地图加载配置

> var Map = new HMap('map', options)

#### 控件

> 控件类配置 `controls`, 如果不传默认加载 `zoom`, `rotate`, `attribution`

```javascript
var controls = {
  loading: true,
  zoomSlider: true,
  rotate: true,
  attribution: true,
  scaleLine: true
}
```

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- | --- | --- |
| loading | 地图图层加载进度条 | `Boolean ` or `Object` | 默认不开启，控件详细配置见 [loading](api/control/loading.md) |
| zoomSlider | 仿百度缩放平移控制面板 | `Boolean ` or `Object` | 默认不开启，控件详细配置见 [zoomSlider](api/control/zoomSlider.md) |
| rotate | 视图旋转控件 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [rotate](api/control/rotate.md) |
| attribution | 版权控件 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [attribution](api/control/attribution.md) |
| scaleLine | 比例尺控件 | `Boolean ` or `Object` | 默认不开启，控件详细配置见 [scaleLine](api/control/scaleLine.md) |

#### 交互配置

> 交互类配置 `interactions`, 如果不传默认开启以下交互

```javascript
var interactions = {
  dragRotate: true,
  doubleClickZoom: true,
  dragPan: true,
  pinchZoom: true,
  pinchRotate: true,
  keyboardPan: true,
  keyboardZoom: true,
  mouseWheelZoom: true,
  dragZoom: true
}
```

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- | --- | --- |
| dragRotate | Alt-Shift拖动旋转视图 | `Boolean ` or `Object` | 默认开启，详细配置见 [dragRotate](api/interaction/dragRotate.md) |
| doubleClickZoom | 双击放大交互 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [doubleClickZoom](api/interaction/doubleClickZoom.md) |
| dragPan | 地图漫游 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [dragPan](api/interaction/dragPan.md) |
| pinchZoom | 触摸操作，双指放大缩小 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [pinchZoom](api/interaction/pinchZoom.md) |
| pinchRotate | 触摸操作，双指旋转视图 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [pinchRotate](api/interaction/pinchRotate.md) |
| keyboardPan | 键盘控制平移 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [keyboardPan](api/interaction/keyboardPan.md) |
| keyboardZoom | 键盘控制缩放 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [keyboardZoom](api/interaction/keyboardZoom.md) |
| mouseWheelZoom | 鼠标滚轮缩放 | `Boolean ` or `Object` | 默认开启，控件详细配置见 [mouseWheelZoom](api/interaction/mouseWheelZoom.md) |
| dragZoom | Shift + 鼠标拖动缩放 | `Boolean ` or `Object` | 默认开启，详细配置见 [dragZoom](api/interaction/dragZoom.md) |

#### 底图加载配置

> baseLayers <Array>, 接受一个数组类型的配置。为什么是数组呢？ 因为我们知道一般GIS应用
  一般会有一个默认底图，附带影像，地形等图层，所以一般底图会是一组图层，而且这样也便于图层
  管理。（*注意*：不传时默认加载OSM图层）

```javascript
var baseLayers = [
 {
   layerName: 'openstreetmap',
   isDefault: true,
   layerType: 'OSM',
   layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
 },
 {
   layerName: 'WMSLayer',
   isDefault: false,
   layerType: 'TileWMS',
   layerUrl: 'http://211.101.37.234:8097/hdmapserver/jxdx/wms',
   layers: 'jxdx',
   styles: '',
   projection: 'EPSG:4326',
   srs: 'EPSG:4326',
   bbox: '113.23591752485795, 24.389814897017047, 118.64119096235795, 30.256514115767047',
   tiled: true,
   tiledsorrigin: '113.23591752486,24.389814897017'
 },
 {
   layerName: 'ArcGIS',
   isDefault: false,
   layerType: 'TileXYZ',
   layerUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
 },
 {
   layerName: 'tianditu',
   isDefault: false,
   layerType: 'TitleWMTS',
   opaque: true, //图层是否不透明
   layerUrl: 'http://t3.tianditu.cn/vec_w/wmts',
   levels: 14,
   layer: 'vec',
   matrixSet: 'w',
   format: 'tiles',
   projection: 'EPSG:3857',
 }
]
```

基础配置项说明：

> 其他具体图层配置项参考 [图层](api/layer/layer.md)

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- | --- | --- |
| layerName | 图层唯一标识（注意不要重复） | `String` | 必传，用于做图层关联 |
| isDefault | 是否为当前底图 | `Boolean` | 必传，注意底图只能有一个默认 |
| layerType | 图层类型 | `String` | 必传，标识当前图层类型，内置会跟据此参数调用不同的图层加载方法 |
| layerUrl | 图层服务地址 | `String` | 必传 |
