### 要素 (ol.Feature)

阅读这一节文档之前你必须知道的是

* 如何创建一个地图。[创建地图](guide/creatMap.md)
* 如何创建一个矢量图层。[创建矢量图层](layer/vector.md)
* 如何指定图层和要素样式。[创建样式](guide/style.md)
* 了解空间数据标准，OGC标准，GeoJSON，EsriJSON，WKT等。

> 具有几何图形和其他属性属性的地理要素矢量对象，类似于像GeoJSON这样的矢量文件格式的要素。
  `features` 可以使用setStyle单独设置其样式，如果不进行设置则会使用其矢量图层的样式。

!> 请注意: 要素属性在 `feature` 对象上 继承自 `ol.Object`，因此它们是可观察的（修改时可以监听到对应属性的变化），
   并且可以使用 `set / get` 设置或者读取属性。
  
> 通常，一个要素具有单个几何属性。 
  你可以使用 `setGeometry` 方法设置几何数学，并且可以使用 `getGeometry` 获取它。
  可以使用属性在要素上存储多个几何图形。 默认情况下，用于渲染的几何体由属性名称几何体标识。
  如果要使用其他几何属性进行渲染，请使用 `setGeometryName` 方法更改与该几何特征关联的属性属性。
  例如：

```javascript
var feature = new ol.Feature({
  geometry: new ol.geom.Polygon(polyCoords),
  labelPoint: new ol.geom.Point(labelCoords),
  name: 'My Polygon'
});

// 使用 `labelPoint` 中的坐标将该要素渲染为点
var poly = feature.getGeometry();

// 设置要素渲染的空间数据
feature.setGeometryName('labelPoint');

// get the point geometry
var point = feature.getGeometry();
```

#### new ol.Feature(options)

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| geometry | 几何属性 | `ol.geom.Geometry or undefined ` | 构造要素时注意需要检查 `geometry` 属性不可为空 |

#### Methods

##### changed()

手动触发变化事件（尽量少用）。

##### clone()

对当前要素克隆，得到一个新要素（一般用在需要保持原始要素的整体属性，但是后续还有可能操作此要素时）。

##### dispatchEvent(event)

触发一个自定义事件。例如：

```javascript
feature.dispatchEvent('featuremove');
feature.on('featuremove', function(event) {
  console.log(event);
});
```

##### get(key) / set(key, value)

获取或者设置属性值。

```javascript
feature.set('mykey', 'key');
feature.get('mykey'); // key
```

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| key | 要素属性键名 | `string` |  |
| value | 要素属性键值 | `*` |  |

##### getGeometry()

获取几何属性。

##### setGeometry(geometry)

设置几何属性。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| geometry | 几何属性 | `ol.geom.Geometry or undefined` |  |

##### getGeometryName()

获取该要素的默认几何属性的名称。

##### setGeometryName(name)

设置几何属性名称。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| name | 属性名称 | `string` |  |

##### getId()

获取唯一标识。可以直接从数据源中读取，也可以通过调用 setId 设置。

##### setId(id)

设置唯一标识。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| id | 属性名称 | `number | string | undefined` |  |

##### getKeys()

获取对象属性名称的列表。

##### getRevision()

获取此要素被修改的次数。

##### getStyle()

获取该要素的样式。

##### setStyle(style)

设置要素的样式。这可以是单个样式对象，样式数组或一个需要解析并返回样式数组的函数。如果它为null，则该要素没有样式（空样式）

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| style | 样式 | `ol.style.Style | Array.<ol.style.Style> | ol.FeatureStyleFunction | ol.StyleFunction` |  |

##### getStyleFunction()

获取该要素的样式函数。

##### setProperties(values, silent)

设置键值对的集合。请注意，这会更改任何现有属性并添加新属性（它不会删除任何现有属性）。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| values | 属性集合 | `Object.<string, *>` |  |
| silent | 更新而不触发事件 | `boolean` |  |

##### unset(key, silent)

取消设置属性。

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| key | 属性键名 | `string` |  |
| silent | 更新而不触发事件 | `boolean` |  |

#### Event

* on(type, listener, this)
* once(type, listener, this)
* un(type, listener, this)

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| type | 事件类型或事件类型的数组 | `string | Array.<string>` |  |
| listener | 监听函数 | `function` |  |
| this | 监听函数需要绑定的上下文 | `Object` |  |

##### change
##### change:geometry
##### propertychange

```javascript
feature.on('change', function(event) {
  console.log(event)
})
feature.on('change:geometry', function(event) {
  console.log(event)
})
feature.on('propertychange', function(event) {
  console.log(event)
})
```
