## 添加创建自定义圆

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
  
* 注：在添加交互后 需要激活工具
  
```javascript
  var Map = new HMap('map', {
    view: {
      center: [0, 0],
      zoom: 2
    }
  })
  var freeHandCircle = new ol.interaction.FreeHandCircle()
  Map.addInteraction(freeHandCircle)
  freeHandCircle.initDrawInteraction()  // 激活工具
  freeHandCircle.removeLastInteraction_()  // 取消激活
  Map.removeInteraction(freeHandCircle)  // 移除交互
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| sphere | 计算工具 | `Number` | 非必传 默认6378137 |
| layerName | 图层名 | `String` | 非必传 默认 ```FREE_HAND_CIRCLE``` |
| centerStyle | 中心点样式 | `Object` | 非必传 |
| style | 自定义圆样式 | `Object` | 非必传 |


centerStyle 和 style 配置项说明

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

##### `initDrawInteraction()`
> 激活自定义圆工具

##### `removeLastInteraction_()`
> 取消激活工具

##### `createCircle(center,radius)`
> 创建自定义圆

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`center`|`Array`| 自定义圆中心点 |
|`radius`|`Number`| 自定义圆半径 |

##### `destroy()`
> 销毁自定义圆
