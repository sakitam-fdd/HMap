### 点要素

!> 了解此章节之前请先阅读 [要素](feature/index.md)，了解要素的组成和原生要素的属性方法和相关事件。阅读 [OGC]()了解OGC标准
  数据，了解常用 ``EsriJSON | GeoJSON``等常用数据。
  
  点的添加共封装了两个方法 `addPoint | addPoints`, 通过这两个方法基本可以满足项目中点要素的操作。
添加时你将不需要再去了解 `layer(图层) | feature(要素) | style(样式) | interaction(用户交互)` 这些附加操作，
只需要配置相关配置即可。

#### 添加一个点要素

* 准备数据(默认支持['GeoJSON', 'EsriJSON', 'Polyline', 'Array',
 'MVT', 'TopoJSON', 'IGC', 'GMLBase', 'GPX', 'KML', 'OSMXML',
  'WFS', 'WMSGetFeatureInfo', 'WKT'])

```javascript
var point = {
  "attributes": {
    "OBJECTID": "45",
    "ID": "{393C392E-17FE-46EF-B39B-91433EB01AB6}",
    "XZQHMC": "于都县"
  },
  "geometry": "POINT (115.54225923 26.06633778)",
  "geometryType": "Point"
};
map.addPoint(point, {
  layerName: 'point',
  zoomToExtent: true,
  selectable: true,
  style: {
    image: {
      type: 'icon',
      image: {
        imageSrc: '../assets/images/point2.png',
        imageAnchor: [0.5, 1]
      }
    }
  },
  selectStyle: {
    image: {
      type: 'icon',
      image: {
        imageSrc: '../assets/images/point2o.png',
        imageAnchor: [0.5, 1]
      }
    }
  }
})
```

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| point | 点类型的标准数据结构 | `Object` | {attributes:{}, geometry: *} |
| params | 渲染配置项 | `Object` | {} |

point数据说明

* 必须为空属对象。（包含空间和属性数据）
* 属性数据需要包含唯一标识 `id`, 现在默认不允许为空。（因为现在渲染时会通过id去重和获取属性值）
* 如果为其他数据类型时需要标识 `geomType` 字段，允许单一数据标识或者在 `params` 统一标识。

eg:

```json
{
  "attributes": {
    "OBJECTID": "45",
    "ID": "{393C392E-17FE-46EF-B39B-91433EB01AB6}",
    "XZQHMC": "于都县"
  },
  "geometry": {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [125.6, 10.1]
    },
    "properties": {}
  },
  "geomType": "GeoJSON"
}
```

样式配置- `style | selectStyle`

> 支持标准 ``jsonStyle``

* 支持在 `params` 中统一标识，见上面示例。
* 支持在属性中标识（应当注意字段冲突）。

eg:

```json
{
  "attributes": {
    "OBJECTID": "45",
    "ID": "{393C392E-17FE-46EF-B39B-91433EB01AB6}",
    "XZQHMC": "于都县",
    "style": {
      "image": {
        "type": "icon",
        "image": {
          "imageSrc": "../assets/images/point2.png",
          "imageAnchor": [0.5, 1]
        }
      }
    },
     "selectStyle": {
        "image": {
          "type": "icon",
          "image": {
            "imageSrc": "../assets/images/point2.png",
            "imageAnchor": [0.5, 1]
          }
        }
     }
  },
  "geometry": {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [125.6, 10.1]
    },
    "properties": {}
  },
  "geomType": "GeoJSON"
}
```

渲染配置项 - `params`

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| `layerName` | 图层名 | `String` | 如果不配置图层名，添加的点将不会渲染，直接返回要素实例 |
| `zoomToExtent` | 是否缩放视图到当前要素范围 | `Boolean or Object` | 可配置缩放视图的范围参数，具体见示例 |
| `selectable` | 是否可选择 | `Boolean` | 主要配置鼠标选择状态，过滤要素事件 |
| `moveable` | 是否拖动要素 | `Boolean` | 主要配置要素的可编辑状态 |
| `style` | 要素默认样式 | `Object` | 优先级低于属性配置 |
| `selectStyle` | 要素选中样式 | `Object` | 优先级低于属性配置 |
