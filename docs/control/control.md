### 控件(`ol.control`)
  控件是一个可见的小部件，它在屏幕上的固定位置具有DOM元素，控件提供的是控制地图的行为，比如缩放，全屏，坐标控件等一些工具项。控件基类 `ol.control.Control` 
不负责实例化特定的控件，它的主要作用是让其他具体的种类的控件类实现继承（高阶控件扩展放到最后）。而且将这些`dom`作为控件
而不是普通`dom`处理的好处是可以不用考虑控件事件和地图事件的冲突。目前包含
的控件见 [控件创建](/guide/creatControl.md)。
  当创建地图未提供具体控件时，会默认添加 `zoom` 和 `rotate` 控件。

### 如何扩展自定义控件

> 默认提供的 13 类控件基本满足需求，但是有时需要一些定制控件就只能靠自己扩展了。

  阅读此部分之前你需要了解：

* `javascript` 继承。
* `openlayers` 在添加一个控件做了哪些操作。
* 如何绑定事件去控制地图。
* 接口如何设计。

#### `javascript` 继承

  上面提到所有控件都是继承自 `ol.control.Control` ，所以需要了解什么是继承。[mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)。
了解过什么是继承，现在来看下 `openlayers` 控件是如何实现继承的。

打开 `src/control/zoom.js` #line 39

```javascript
ol.inherits(ol.control.ZoomMenu, ol.control.Control)
```

  我们可以看到实际上我们的控件是通过 `ol.inherits` 这个方法实现的继承关系，下面我们来看下这个方法做了哪些操作：

```javascript
ol.inherits = function(childCtor, parentCtor) {
  childCtor.prototype = Object.create(parentCtor.prototype);
  childCtor.prototype.constructor = childCtor;
};
```

实际上是将基类的 `prototype` 复制到当前控件，并将当前控件的构造函数指向基类。

而且正常来说构造新控件时基类接收三个参数：

```javascript
ol.control.Control.call(this, {
  element: element_,
  target: target,
  render: render
})
```

| 参数 | 简介 | 类型 | 备注 |
| --- | --- | --- | --- |
| element | 当前控件的 `dom` | `Element or undefined` | 一般所有控件最终都渲染为 `dom`, 此参数就是为构造的 `dom` 元素。  |
| target | 右键控件 | `	Element or string or undefined` | 将控件渲染到地图容器之外的目标容器（此时你需要自己处理与地图交互的事件冲突） |
| render | 右键控件 | `function or undefined` | 当控件应该被重新渲染时调用的函数。这在requestAnimationFrame回调中被调用. |

另外如果需要监听控件被添加至地图的事件在执行某些操作时可以采用 ``call`` 方法：

```javascript
ol.control.myControl.prototype.setMap = function (map) {
  // do something
  ol.control.Control.prototype.setMap.call(this, map)
}
```

#### 方法

##### changed()

手动触发变化事件。

##### dispatchEvent(event)

触发一个自定义事件。例如：

```javascript
control.dispatchEvent('changePosition');
control.on('changePosition', function(event) {
  console.log(event);
});
```

##### get(key) / set(key, value, silent)

获取或者设置属性值。

```javascript
control.set('mykey', 'key');
control.get('mykey'); // key
```

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| key | 控件属性键名 | `string` | `` |
| value | 控件属性键值 | `*` | `` |
| silent | 更新而不触发事件 | `Boolean` | `` |

##### getMap() / setMap(map)

```javascript
control.setMap(map);
control.getMap(); // map
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

##### setTarget(target)

用于重新设置控件所在的目标容器。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| target | 目标容器 | `Element or string or undefined` | 如果未设置或者设置为 `undefined` 控件默认会被添加到 `overlay container` |

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
##### propertychange

```javascript
control.on('change', function(event) {
  console.log(event)
})
control.on('propertychange', function(event) {
  console.log(event)
})
```

