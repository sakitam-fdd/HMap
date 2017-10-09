## 添加右键菜单控件

> 为用户提供了单独的右键菜单控件，可配置使用，也可手动添加，也可单独配合openlayers使用

### 如何使用

> 右键菜单控件(具体代码实现：[contextMenu](https://github.com/sakitam-fdd/ol-extent/blob/master/src/control/contextMenu.js))。
  此控件以实现并包含在HMap内部。所以你可以按照以下代码添加控件。
  
### 引入API

```html
<link rel="stylesheet" href="https://unpkg.com/ol-extent@1.1.1/dist/olControlContextMenu.min.css" type="text/css">
<script src="https://unpkg.com/ol-extent@1.1.1/dist/olControlContextMenu.min.js"></script>
```  

> contextMenu控件配置,以下实现均使用此配置示例

```javascript
var contextMenu = {
     itemWidth: 130,
     itemHeight: 30,
     items: [
       {
         name: "测面",
         alias: "measureArea",
         iconType: "iconfont",
         icon: "icon-cemian",
         iconColor: "#1AD3EF",
         showLine: true,
         items: [
           {
             name: "测规则面",
             alias: "measureLength",
             iconType: "iconfont",
             icon: "icon-ceju",
             iconColor: "#2994EF"
          }
         ]
       },
       {
         name: "清空地图",
         alias: "clearMap",
         iconType: "iconfont",
         icon: "icon-map",
         iconColor: "#F05849"
       }
     ] 
  }
```

* 配置中使用，`contextMenu` 中添加相关配置

```javascript

 var Map = new HMap('map', {
    controls: {
      contextMenu: contextMenu
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5,
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        layerType: 'OSM',
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
          layerName: 'openstreetmap',
          layerType: 'OSM',
          layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      ]
    });
    var olControlContextMenu = new ol.control.ContextMenu(contextMenu)
    Map.map.addControl(olControlContextMenu)
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

* 控件单独使用,配合openlayers 单独使用，通过 ``` new control.ContextMenu() ``` 使用右键菜单控件

```html
<link rel="stylesheet" href="https://unpkg.com/openlayers@4.3.3/dist/ol.css" type="text/css">
<script src="https://unpkg.com/openlayers@4.3.3/dist/ol.js"></script>

<link rel="stylesheet" href="https://unpkg.com/ol-extent@1.1.1/dist/olControlContextMenu.min.css" type="text/css">
<script src="https://unpkg.com/ol-extent@1.1.1/dist/olControlContextMenu.min.js"></script>
```

```javascript
  var base = new ol.layer.Tile({
    layerName: 'Google',
    isBaseLayer: true,
    source: new ol.source.GOOGLE()
  })
  var map = new ol.Map({
    layers: [
      base
    ],
    target: 'map',
    view: new ol.View({
      projection: 'EPSG:3857',
      center: [12118909.300259633, 4086043.1061670054],
      zoom: 5
    })
  })
  var menu = new ol.control.ContextMenu(contextMenu)
  map.addControl(menu)
  menu.on('item-click', function (event, data) {
    console.log(event, data)
  })
```

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>


配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| itemWidth | 菜单宽度 | `Number` | 可不传 默认值 160 |
| itemHeight | 菜单高度 | `Number` | 可不传 默认值 30 |
| className | CSS类名 可自定义 | `String` | 可不传 默认class ```hmap-context-menu-content``` |
| target | 控件的目标对象 | `Element` | 可不传 |
| items | 菜单项 | `Array` | 必传 至少包含一个菜单项，item `Object`详情配置 见下方 |


item `Object` 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| name | 菜单名称 | `String` | 必传 |
| alias | 自定义 data-name 属性 | `String` | 必传 |
| icon | 菜单图标CSS类名或图片路径 | `String` | 非必传 |
| iconType | 菜单图标类型 | `String` | 可传方向为 `iconfont` 字体图标，其他图片路径 |
| iconColor | 字体图标颜色 | `String` | 菜单图标类型为`iconfont`时，可设置图标颜色 |
| showLine | 是否显示间隔线 | `Boolean` | 非必传 true 显示 |
| items | 下级菜单 | `Array` | 非必传 可继续展示下级菜单 |
| callback | 点击该菜单方法 | `Function` | 非必传 |
