## 添加要素旋转交互

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
```javascript
  var point = new ol.Feature({
      name: 'point',
      geometry: new ol.geom.Point([ 2384267.0573564973, 7557371.884852641 ])
    })
  var line = new ol.Feature({
    name: 'line',
    geometry: new ol.geom.LineString([ [ -603697.2100018249, -239432.60826165066 ], [ 4190433.20404443, 2930563.8287811787 ] ])
  })
  var polygon = new ol.Feature({
    name: 'polygon',
    geometry: new ol.geom.Polygon([ [
      [ -14482348.171434438, 6661491.741627443 ],
      [ -9541458.663080638, 6221214.458704827 ],
      [ -11473786.738129886, 3300708.4819848104 ],
      [ -14482348.171434438, 6661491.741627443 ]
    ] ])
  })
  
  var map = new ol.Map({
    view: new ol.View({
      center: [ 0, 0 ],
      zoom: 2
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Vector({
        source: new ol.source.Vector({
          projection: 'EPSG:33857',
          features: [ point, line, polygon ]
        })
      })
    ],
    target: 'map',
    projection: 'EPSG:3857'
  })
  
  var select = new ol.interaction.Select()
  select.getFeatures().extend([ point, line, polygon ])

  var rotate = new ol.interaction.RotateFeature({
    features: select.getFeatures(),
    angle: -1.5708
  })

  rotate.on('rotatestart', evt => console.log('rotate start', evt))
  rotate.on('rotating', evt => console.log('rotating', evt))
  rotate.on('rotateend', evt => console.log('rotate end', evt))

  map.addInteraction(select)
  map.addInteraction(rotate)
```  

* ol.interaction.Pointer 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| features | 要处理的要素 | `ol.Feature` | -- |
| style | 样式 | `ol.style.Style` | -- |
| angle | 旋转角度 | `_number &#124; undefined` | -- |
| anchor | 锚点 | `number[] &#124; ol.Coordinate &#124; undefined` | 旋转中心点所在的坐标，要素将围绕此点旋转 |

### 方法

#### setAngle(angle : number)

设置要素的旋转角度。

```js
// Set current angle of interaction features.
RotateFeatureInteraction.prototype.setAngle(angle : number)
```

#### getAngle() : number

获取要素当前的旋转角度。

```js
// Returns current angle of interaction features.
RotateFeatureInteraction.prototype.getAngle() : number
```

#### setAnchor(anchor? : number[] | ol.Coordinate)

设置当前旋转锚点。

```js
// Set current anchor position.
RotateFeatureInteraction.prototype.setAnchor(anchor? : number[] | ol.Coordinate)
```

#### getAnchor() : number[] | ol.Coordinate | undefined 

获取当前的旋转锚点。

```js
// Returns current anchor position.
RotateFeatureInteraction.prototype.getAnchor() : number[] | ol.Coordinate | undefined 
```

### Events

#### 参数

- **features**    _ol.Collection_     处于交互状态中的要素.
- **angle**       _number_            当前旋转角度.
- **anchor**      _ol.Coordinate_     当前锚点位置.

| Event       | Arguments            | Description                          |
|:------------|:---------------------|:-------------------------------------|
| rotatestart | _RotateFeatureEvent_ | 当要素开始旋转时触发. |
| rotating    | _RotateFeatureEvent_ | 旋转过程中触发（实时）.     |
| rotateend   | _RotateFeatureEvent_ | 旋转交互结束触发. |

#### 示例

```js
rotate.on('rotateend', evt => {
    // get total angle in degrees
    console.log(evt.angle + ' is '+ (-1 * evt.angle * 180 / Math.PI ) + '°')
    // get last anchor coordinates
    console.log(evt.anchor)
})
```
