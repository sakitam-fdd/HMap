## 添加交互

> 交互功能是一个地图基本的功能，这些功能直接面向用户

所有的控制器都存在于ol.interaction对象上，可以在源码中查看, 
关于使用文档和如何实现一个自定义交互会在项目文档包含。

### 如何使用

> 添加双击放大交互：
  此控件以实现并包含在HMap内部。所以你可以按照以下代码添加交互。
  
* 配置中开启, 直接在interaction设置 ``doubleClickZoom`` 为true，若要添加自定义配置的话请设置
  参数为对象，包含对应的参数即可。具体查看[doubleClickZoom](api/interaction/doubleClickZoom.md)。
  
  > 但是注意：部分交互不需要再初始化的时候添加，此示例只做演示。

```javascript
var Map = new HMap('map', {
  interactions: {
    doubleClickZoom: true
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
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
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
var DoubleClickZoom = new ol.interaction.DoubleClickZoom()
Map.addInteraction(DoubleClickZoom)
```

#### 尝试编辑它
---
<iframe width="100%" height="430" src="//jsfiddle.net/sakitamfdd/pjz8cuxw/embedded/result,html,js/?bodyColor=fff" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 内置提供的交互功能列表

| 配置项 | 简介 | 文档 | 备注 |
| --- | --- | --- | --- |
| interaction | 所有交互的基类，不可添加 | 详细配置见 [interaction](api/interaction/interaction.md) | 不可添加 |
| dragRotate | Alt-Shift拖动旋转视图 | 详细使用见 [dragRotate](api/interaction/dragRotate.md) | 内置 |
| doubleClickZoom | 双击放大交互 | 详细使用见 [doubleClickZoom](api/interaction/doubleClickZoom.md) | 内置 |
| dragPan | 地图漫游 | 详细使用见 [dragPan](api/interaction/dragPan.md) | 内置 |
| pinchZoom | 触摸操作，双指放大缩小 | 详细使用见 [pinchZoom](api/interaction/pinchZoom.md) | 内置 |
| pinchRotate | 触摸操作，双指旋转视图 | 详细使用见 [pinchRotate](api/interaction/pinchRotate.md) | 内置 |
| keyboardPan | 键盘控制平移 | 详细使用见 [keyboardPan](api/interaction/keyboardPan.md) | 内置 |
| keyboardZoom | 键盘控制缩放 | 详细使用见 [keyboardZoom](api/interaction/keyboardZoom.md) | 内置 |
| mouseWheelZoom | 鼠标滚轮缩放 | 详细使用见 [mouseWheelZoom](api/interaction/mouseWheelZoom.md) | 内置 |
| dragZoom | Shift + 鼠标拖动缩放 | 详细使用见 [dragZoom](api/interaction/dragZoom.md) | 内置 |
| dragAndDrop | 通过拖放处理向量数据的输入 | 详细使用见 [dragAndDrop](api/interaction/dragAndDrop.md) | 内置 |
| dragBox | 允许用户通过在地图上单击并拖动来绘制一个矢量要素，通常结合一个ol.events.condition，将其限制为当shift或其他键被按下时 | 详细使用见 [dragBox](api/interaction/dragBox.md) | 内置 |
| dragRotateAndZoom | 拖拽旋转缩放 | 详细使用见 [dragRotateAndZoom](api/interaction/dragRotateAndZoom.md) | 内置 |
| modify | 用于修改特征几何的交互 | 详细使用见 [modify](api/interaction/modify.md) | 内置 |
| pointer | 鼠标事件的基类 | 详细使用见 [pointer](api/interaction/pointer.md) | 内置 |
| select | 要素选择交互 | 详细使用见 [select](api/interaction/select.md) | 内置 |
| snap | 鼠标指针吸附要素交互 | 详细使用见 [snap](api/interaction/snap.md) | 内置 |
| translate | 转换（移动）功能的交互| 详细使用见 [translate](api/interaction/translate.md) | 内置 |
| extent | 绘制矢量要素框 | 详细使用见 [extent](api/interaction/extent.md) | 内置 |
| draw | 画笔交互(重要) | 详细使用见 [draw](api/interaction/draw.md) | 内置 |
| layerMagnify | 地图放大镜功能 | 详细使用见 [layerMagnify](api/interaction/layerMagnify.md) | 扩展实现 |
| layerSpyglass | 图层滤镜功能 | 详细使用见 [layerSpyglass](api/interaction/layerSpyglass.md) | 扩展实现 |
| freeHandCircle | 自由圆创建（主要用于周边搜索） | 详细使用见 [freeHandCircle](api/interaction/freeHandCircle.md) | 扩展实现 |
| measureTool | 测量工具 | 详细使用见 [measureTool](api/interaction/measureTool.md) | 扩展实现 |

