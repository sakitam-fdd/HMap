### 添加放大缩小控件

!> 为用户提供了单独的放大缩小控件，可配置开启，也可手动添加，也可单独配合openlayers使用。具体方法和事件继承自 `ol.control.Control`，[查看](/control/control.md)。

#### 如何使用

> 放大缩小控件(具体代码实现参照 `src/control/zoom.js`)。

* 配置中开启, 直接在controls设置zoom 为true。
* 注：放大缩小控件默认即开启

```javascript
var Map = new HMap('map', {
    controls: {
      zoom: true
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5,
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        layerType: 'OSM',
        isDefault: true,
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });
```

#### 尝试编辑它

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
          layerName: 'openstreetmap',
          layerType: 'OSM',
          isDefault: true,
          layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      ]
    });
    var olControlZoomMenu = new ol.control.ZoomMenu()
    Map.addControl(olControlZoomMenu)
```

#### 尝试编辑它

* 控件单独使用,配合openlayers 单独使用，通过 ``` new ol.control.ZoomMenu() ``` 开启放大缩小控件

> zoomMenu控件配置

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名，可自定义样式 | `String` | 非必传 默认使用封装好的 ```hmap-control-zoom``` 样式 |
| delta | 每次点击缩放增减 | `Number` | 非必传 默认为1 传值1或-1 |
| duration | 动画持续时间 | `Number` | 非必传 单位毫秒 默认250毫秒 |
| target | 控件的目标对象 | `Element` | 非必传 |

