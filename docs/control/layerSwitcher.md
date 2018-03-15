### 添加图层切换控件

> 为用户提供了单独的图层切换控件，可配置添加，也可手动添加，也可单独配合openlayers使用

#### 如何使用
 
  
* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的控件，然后调用 ``addControl()`` 方法添加控件。此添加方式也适合用户
  自定义的控件添加。

```javascript
  var Map = new HMap('map', {
    controls: {
      zoom: false,
      rotate: false
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5,
    },
    baseLayers: [
      {
        layerName: 'OSM',
        layerType: 'OSM',
        isDefault: true,
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      },
      {
        layerName: 'Google',
        layerType: 'Google',
        isDefault: false,
        layerUrl: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
      },
      {
        layerName: 'GaoDe',
        layerType: 'GaoDe',
        isDefault: false,
        layerUrl: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
      }
    ]
  });
  Map.on('loadMapSuccess', function (event) {
    if (event) {
      var config_ = [
        {
          layerName: 'GaoDe',
          name: '高德',
          icon: '../assets/images/maptype_vector.png'
        },
        {
          layerName: 'OSM',
          name: 'OSM',
          icon: '../assets/images/maptype_pano.png'
        },
        {
          layerName: 'Google',
          name: '谷歌',
          icon: '../assets/images/maptype_yunran.png'
        }
      ]
      var LayerSwitcher = new ol.control.LayerSwitcher({
        itemWidth: 86,
        itemHeight: 60,
        layers: config_
      })
      Map.addControl(LayerSwitcher)
    }
  })
```

> layerSwitcher控件配置

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| className | CSS类名，可自定义样式 | `String` | 非必传 默认使用封装好的 ```hmap-layer-switcher``` 样式 |
| itemWidth | 切换框整体宽度 | `Number` | 非必传 默认 86 |
| itemHeight | 切换框整体高度 | `Number` | 非必传 默认60 | 
| baseLayerKey | 标识底图的关键字 | `String` | 非必传 默认 `isBaseLayer` |
| isDefaultKey | 标识当前底图的关键字 | `String` | 非必传 默认 `isDefault` |
| labelAlias | 关联图层关键字 | `String` | 非必传 默认 `layerName` |
| labelLayerKey | 标准labelLayer关键字 | `String` | 非必传 默认 `isLabelLayer` |
| forcedUpdate | 是否每次操作前强制更新图层 | `Boolean` | 非必传 |  
| key | 图层关键字 | `Number` | 非必传 默认`layerName` | 
| target | 控件的目标对象 | `Element` | 非必传 |
| layers | 切换图层的数据 | `Array` | 非必传 每个object对象详细查看 layer配置项说明 |


layer 配置项说明
| itemWidth | 单项框宽度 | `Number` | 非必传 默认 86 |
| itemHeight | 单项框高度 | `Number` | 非必传 默认60 | 
| key | 单项内容显示的关键字 | `String` | 必传 | 
| icon | 单项显示的图片路径 | `String` | 必传 | 
| layerName | 对比图层的layerName值 | `String` | 必传 | 
  
