## 添加Loading进度条加载控件

> 为用户提供了单独的Loading进度条加载控件，可配置开启，也可手动添加，也可单独配合openlayers使用

### 如何使用

> Loading进度条加载控件(具体代码实现：[Loading](https://github.com/sakitam-fdd/ol-extent/blob/master/src/control/Loading.js))。
  此控件以实现并包含在HMap内部。所以你可以按照以下代码添加控件。

* 配置中开启, 直接在controls设置loading 为true。

```javascript
  var Map = new HMap('map', {
    controls: {
      loading: true
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5,
    },
    baseLayers: [
      {
        layerName: 'firstLayer',
        layerType: 'OSM',
        isDefault: true,
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的控件，然后调用 ``addControl()`` 方法添加控件。此添加方式也适合用户
  自定义的控件添加。

```javascript
    var Map = new HMap('map', {
        view: {
          center: [12118909.300259633, 4086043.1061670054],
          zoom: 5,
        },
        baseLayers: [
          {
            layerName: 'firstLayer',
            layerType: 'OSM',
            isDefault: true,
            layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        ]
    });
    var olControlLoading = new ol.control.Loading({
        className: 'hmap-loading-panel',
        widget: 'progressBar',
    })
    Map.map.addControl(olControlLoading)
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

> loading控件配置

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| widget | 窗口挂件类型 | `String` | 非必传 可选值为`animatedGif`,`progressBar` 默认 `animatedGif`|
| progressMode | 进度条模式 | `String` | 非必传 可选值为 `tile`,`layer` |
| showPanel | 是否显示loading面板 | `Boolean` | 非必传 |
| className | CSS类名 可自定义 | `String` | 非必传 默认 ```hmap-loading-panel``` |
| onStart | 开始加载 | `Function` | 非必传 |
| onProgress | 加载进行 | `Function` | 非必传 |
| onEnd | 加载结束 | `Function` | 非必传 |
| target | 控件的目标对象 | `Element` | 非必传 |
