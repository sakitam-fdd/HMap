## 添加绘制矢量要素框

> 用户可使用openlayers内置方式进行添加

* 手动添加，在创建地图完成后你可以获取一个地图对象，先实例化
  你的交互，然后调用 ``addInteraction()`` 方法添加交互。此添加方式也适合用户
  自定义交互添加。
* 注：允许用户通过在地图上单击并拖动来绘制矢量框  
  
```javascript
  var Map = new HMap('map', {
    view: {
      center: [0, 0],
      zoom: 2
    }
  })
  var extent = new ol.interaction.Extent({})
  Map.addInteraction(extent)
```  

#### 尝试编辑它
---
<iframe width="100%" height="430"></iframe>

ol.interaction.Extent 配置项说明

| 配置项 | 简介 | 类型 | 备注 |
| --- | --- |--- | --- |
| extent | 初始范围 | `ol.Extent` | 非必传 |
| boxStyle | 范围框样式 | `ol.style.Style` | 非必传 |
| pointerStyle | 游标样式 | `ol.style.Style` | 非必传 |
| wrapX | 是否水平覆盖 | `Boolean` | 非必传 |
