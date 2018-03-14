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
| target | 右键控件 | `	Element or string or undefined` | 支持单独配合openlayers使用 |
| render | 右键控件 | `function or undefined` | 支持单独配合openlayers使用 |
