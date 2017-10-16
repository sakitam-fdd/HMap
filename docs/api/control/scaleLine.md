## 使用比例尺控件

> 用户可使用openlayers内置进行设置

* 使用openlayers 内置方法进行添加

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
        layerName: 'openstreetmap',
        isDefault: true,
        layerType: 'OSM',
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });

  var controlScaleLine = new ol.control.ScaleLineH({
    className: 'ol-scale-line',
    minWidth: 64,
    units: 'metric_cn'
  })
  Map.addControl(controlScaleLine)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.control.ScaleLineH 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名，可自定义样式 | `String` | 非必传 默认使用封装好的 ```hmap-scale-line-control``` 样式 |
| minWidth | 容器宽度 | `Number` | 非必传 默认64|
| units	 | 单位 | `String` | 非必传 默认 'metric'|
| target | 控件的目标对象 | `Element` | 非必传 |
