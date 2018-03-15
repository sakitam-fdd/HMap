## 添加测量工具

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。

* 注：在添加交互后 需要激活工具 可选某种类型的测量工具
  
```javascript
  var Map = new HMap('map', {
    view: {
      center: [0, 0],
      zoom: 6
    }
  })
  var measureTool = new ol.interaction.MeasureTool()
  Map.addInteraction(measureTool)
  measureTool.setTool(true, 'measureCircle', false) // 激活测量圆面积
  measureTool.setTool(false) // 移除测量
```  

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| sphere | 计算工具 | `Number` | 非必传 默认 6378137 |
| isGeodesic | 是否使用地理测量方式 | `Boolean` | 非必传 默认true |
| layerName | 图层名 | `String` | 非必传 默认```measureTool``` |
| drawStyle | 绘制时样式 | `Object` | 非必传 |
| finshStyle | 绘制结束样式 | `Object` | 非必传 |

drawStyle 和 finshStyle 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| fill | 填充样式 | `Object` | 非必传 |
| stroke | 边框样式 | `Object` | 非必传 |
| image | 中心点样式 | `Object` | 非必传 |


fill 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| fillColor | 填充颜色 | `String` | 非必传 |


stroke 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| strokeColor | 边框颜色 | `String` | 非必传 |
| strokeWidth | 边框粗细 | `Number` | 非必传 |


image 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| type | 类型 | `String` | 非必传 |
| image | 图层配置 | `Object` | 非必传 详见下方image配置|

image中image 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| fill | 填充样式 | `Object` | 非必传 |
| points | points | `Infinity` | 非必传 Infinity|
| radius | 圆心点半径 | `Number` | 非必传 默认4 |
| stroke | 边框样式 | `Object` | 非必传 |


### Methods

##### `setTool(active,key,freehand)`
> 激活测量工具

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`active`|`Boolean`| 是否确认激活 |
|`key`|`String`| 激活测量工具的类型 |
|`freehand`|`Boolean`| 是否自由画笔 |

##### `removeLastInteraction_()`
> 移除上一次激活工具
