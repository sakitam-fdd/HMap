## 使用版权控件

> openlayers内置的版权控件，可配置开启，也可通过openlayers添加


* 配置中开启, 在相关图层中配置 attribution 相关信息

```javascript
 var Map = new HMap('map', {
     controls: {
       zoomSlider: false,
       zoom: false,
       rotate: false
     },
     view: {
       center: [12118909.300259633, 4086043.1061670054],
       zoom: 5,
     },
     baseLayers: [
       {
         layerName: 'firstLayer',
         isDefault: true,
         layerType: 'OSM',
         layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
         attribution: {
           url: 'https://aurorafe.github.io',
           title: '恒达时讯',
           messages: '版权所有'
         }
       }
     ]
 });
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| url | 连通路径 | `String` | 必传 |
| title | 所属版权方 | `String` | 必传 |
| messages | 备注信息 | `String` | 必传 |

* 使用openlayers 内置方法进行添加

```javascript
  var layer = Map.getLayerByLayerName('openstreetmap')
  let attribution = new ol.Attribution({
    html: '<a href="https://www.opencyclemap.org/">OpenCycleMap</a>',
  })
  layer.getSource().setAttributions(attribution)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.Attribution配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| html | 展示的html文本标签 | `String` | 非必传 |


```javascript
  let controlAttribution = new ol.control.Attribution({
    collapsible: true,
    collapsed: true,
    label: 'ii'
  })
  Map.addControl(controlAttribution)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.control.Attribution配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名，可自定义样式 | `String` | 非必传 默认使用封装好的 ```ol-attribution``` 样式 |
| collapsible | 是否可折叠 | `Boolean` | 非必传 |
| collapsed | 是否显示折叠按钮 | `Boolean` | 非必传 |
| tipLabel | 按钮提示标签 | `String` | 非必传 |
| label | 折叠按钮的文字标签 | `String` | 非必传 |
| collapseLabel | 展开按钮的文字标签 | `String` | 非必传 |
| target | 控件的目标对象 | `Element` | 非必传 |
