### 添加右键菜单控件

> 为用户提供了单独的右键菜单控件，可配置使用，也可手动添加，也可单独配合openlayers使用

#### 如何使用

> 具体方法和事件继承自 `ol.control.Control`，[查看](/control/control.md)。

contextMenu控件配置,以下实现均使用此配置示例

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
        isDefault: true,
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });  
```

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
    var olControlContextMenu = new ol.control.ContextMenu(contextMenu)
    Map.addControl(olControlContextMenu)
```  

##### 配置项说明

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

##### 方法 Methods

- setMap(map)

> 设置地图方法，一般在addControl时会内置调用

| 参数 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| map | 当前地图实例 | `ol.Map` | '' |

- pop()

> 移除菜单最后一项

- push(item)

> 向菜单末尾添加一项

| 参数 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| item | 菜单项 | `Object` | 可嵌套 |

- shift()

> 移除菜单第一项

- reverse()

> 倒序菜单项

- unshift(item)

> 向菜单开头添加一项

| 参数 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| item | 菜单项 | `Object` | 可嵌套 |

- update(items)

> 更新当前显示菜单，（不更新原始菜单数据，只在当前有效）

- updateOption(items)

> 更新当前显示菜单，（更新原始菜单数据）

##### 事件响应

> 响应用户操作时的事件

| 事件名 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| item-click | 菜单项点击事件响应 | `String` | 响应当前点击项item和当前右键坐标和屏幕位置 |
| before-show | 菜单显示之前触发事件 | `String` | 响应事件event |
| show | 响应菜单显示事件 | `String` | 事件响应在before-show事件之后 |
| hide | 响应菜单隐藏事件 | `String` | '' |

- 示例代码(可针对右键的位置不同更新不同的菜单项)

```javascript
var olControlContextMenu = new ol.control.ContextMenu(contextMenu)
Map.addControl(olControlContextMenu)
olControlContextMenu.on('before-show', function (event) {
  olControlContextMenu.update([{
    name: "测距",
    alias: "measureLength",
    iconType: "iconfont",
    icon: "icon-ceju",
    iconColor: "#398DF5"
  }])
})
```
