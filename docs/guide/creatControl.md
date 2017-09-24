## 添加控件

> 控制器为用户提供了和地图交互的入口。

所有的控制器都存在于ol.control对象上，可以在源码中查看。关于扩展你需要查看
``ol-extent`` 项目[ol-extent](https://github.com/sakitam-fdd/ol-extent), 
关于使用文档和如何实现一个自定义控件会在项目文档包含。

### 如何使用

> 假设我们已经定义了一个图层加载进度loading控件(具体代码实现：[loading](https://github.com/sakitam-fdd/ol-extent/blob/master/src/control/Loading.js))。
  此控件以实现并包含在HMap内部。所以你可以按照以下代码添加控件。
  
* 配置中开启, 直接在controls设置 ``loading`` 为true，若要添加自定义配置的话请设置
  参数为对象，包含对应的参数即可。具体查看[loading](api/control/loading.md)。

```javascript
var Map = new HMap('map', {
  controls: {
    loading: true
  },
  view: {
    center: [12118909.300259633, 4086043.1061670054],
    projection: 'EPSG:3857',
    zoom: 5, // resolution
  },
  baseLayers: [
    {
      layerName: 'openstreetmap',
      isDefault: true,
      layerType: 'OSM',
      opaque: true, //图层是否不透明
      layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  ]
})
```

#### 尝试编辑它
---
<iframe width="100%" height="430" src="//jsfiddle.net/sakitamfdd/pjz8cuxw/embedded/result,html,js/?bodyColor=fff" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的控件，然后调用 ``addControl()`` 方法添加控件。此添加方式也适合用户
  自定义的控件添加。
  
```javascript
var Map = new HMap('map', {
  view: {
    center: [12118909.300259633, 4086043.1061670054],
    projection: 'EPSG:3857',
    zoom: 5, // resolution
  },
  baseLayers: [
    {
      layerName: 'openstreetmap',
      isDefault: true,
      layerType: 'OSM',
      opaque: true, //图层是否不透明
      layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  ]
})
var loadingControl = new ol.control.Loading()
// 或者 new olControlLoading()
Map.addControl(loadingControl)
```

#### 尝试编辑它
---
<iframe width="100%" height="430" src="//jsfiddle.net/sakitamfdd/pjz8cuxw/embedded/result,html,js/?bodyColor=fff" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 内置提供的控件列表

| 控件 | 简介 | 文档 | 备注 |
| --- | --- | --- | --- |
| zoom | 放大缩小控件 | [zoom](api/control/zoom.md) | 支持单独配合openlayers使用 |
| contextMenu | 右键控件 | [contextMenu](api/control/contextMenu.md) | 支持单独配合openlayers使用 |
| compareLayer | 图层对比控件 | [compareLayer](api/control/compareLayer.md) | 支持单独配合openlayers使用 |
| RotateControl | 旋转控件 | [RotateControl](api/control/rotateControl.md) | 支持单独配合openlayers使用 |
| Loading | 图层加载进度控件 | [Loading](api/control/loading.md) | 支持单独配合openlayers使用 |
| BZoomSlider | 图层平移缩放控件 | [BZoomSlider](api/control/bZoomSlider.md) | 支持单独配合openlayers使用 |
| BZoomSlider | 图层平移缩放控件 | [BZoomSlider](api/control/bZoomSlider.md) | 支持单独配合openlayers使用 |
| FullScreen | 全屏控件 | [FullScreen](api/control/fullScreen.md) | 支持单独配合openlayers使用 |
| LayerSwitcher | 图层切换控件 | [LayerSwitcher](api/control/layerSwitcher.md) | 支持单独配合openlayers使用 |
| Attribution | 版权控件 | [Attribution](api/control/attribution.md) | 属于内置控件暂未重写 |
| ScaleLine | 比例尺控件 | [ScaleLine](api/control/scaleLine.md) | 属于内置控件暂未重写 |
| MousePosition | 鼠标位置显示控件 | [MousePosition](api/control/mousePosition.md) | 属于内置控件暂未重写 |
| Geolocation | 定位控件 | [Geolocation](api/control/geolocation.md) | 因为浏览器安全限制，暂时停用此控件 |
| OverviewMap | 鹰眼控件 | [OverviewMap](api/control/overviewMap.md) | 计划中 |
