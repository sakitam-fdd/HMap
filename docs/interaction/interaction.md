### 交互类

!> 和控件基类类似，通常只用于创建子类，而不是直接实例化此构造函数，可以看做是没有 `dom` 的地图控件，也是直接用于
用户来操作地图的入口。例如：`ol.interaction.KeyboardZoom` 在功能上与`ol.control.Zoom`相同，但是由键盘事件触发
而不是按钮元素事件。

  当创建地图未定义具体添加的控件时，会默认添加以下交互：

* `altShiftDragRotate` : Alt-Shift 拖拽控制地图旋转。
* `doubleClickZoom`: 地图双击缩放交互。
* `keyboard`: 允许键盘交互事件（例如方向键控制地图平移，加减控制地图缩放）。
* `mouseWheelZoom`: 鼠标滚轮控制地图缩放。
* `shiftDragZoom`: Shift + 拖拽缩放地图交互。
* `dragPan`: 鼠标拖拽地图平移（地图漫游）。
* `pinchRotate`: 允许双指旋转地图（移动端）。
* `pinchZoom`: 触摸缩放地图（移动端）。

#### 交互的扩展实现（高阶）

和控件扩展类似，所有的交互都是继承自 `ol.interaction.Interaction`。

需要控制的一般为事件处理，继承自 `ol.interaction.Pointer`, 处理四类事件：

* `handleDownEvent`: 鼠标(指针)按下事件。
* `handleUpEvent`: 鼠标(指针)抬起事件。
* `handleDragEvent`: 鼠标(指针)拖拽事件。
* `handleMoveEvent`: 鼠标(指针)移动事件。

通过这几类事件和图层渲染事件，基本上就能完成对地图的控制交互操作。

#### 方法

##### changed()

手动触发变化事件。

##### dispatchEvent(event)

触发一个自定义事件。例如：

```javascript
interaction.dispatchEvent('changex');
interaction.on('changex', function(event) {
  console.log(event);
});
```

##### get(key) / set(key, value, silent)

获取或者设置属性值。

```javascript
interaction.set('mykey', 'key');
interaction.get('mykey'); // key
```

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| key | 控件属性键名 | `string` | `` |
| value | 控件属性键值 | `*` | `` |
| silent | 更新而不触发事件 | `Boolean` | `` |

##### getActive() / setActive(active)

激活或停用交互工具。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| active | 是否激活 | `boolean` | `` |

##### getMap() / setMap(map)

```javascript
interaction.setMap(map);
interaction.getMap(); // map
```

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| map | 地图对象实例 | `ol.Map` | `` |

获取或者设置控件指向的地图对象。

##### getProperties() / setProperties(values, silent)

获取或者设置键值对的集合。请注意，这会更改任何现有属性并添加新属性（它不会删除任何现有属性）。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| values | 属性集合 | `Object.<string, *>` | `` |
| silent | 更新而不触发事件 | `boolean` | `` |

##### getKeys()

获取对象属性名称的列表。

##### getRevision()

获取此控件被修改的次数。

##### unset(key, silent)

取消设置属性。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| key | 属性键名 | `string` | `` |
| silent | 更新而不触发事件 | `boolean` | `` |

#### Event

* on(type, listener, this)
* once(type, listener, this)
* un(type, listener, this)

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| type | 事件类型或事件类型的数组 | `string or Array.<string>` | `` |
| listener | 监听函数 | `function` | `` |
| this | 监听函数需要绑定的上下文 | `Object` | `` |

##### change
##### change:active
##### propertychange

```javascript
interaction.on('change', function(event) {
  console.log(event)
})

interaction.on('change:active', function(event) {
  console.log(event)
})

interaction.on('propertychange', function(event) {
  console.log(event)
})
```
