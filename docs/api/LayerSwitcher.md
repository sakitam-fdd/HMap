# 底图切换使用(plugins)
---

> * 地图必须初始化（var Maps = new HMap.map('div', {}')）
> * 所有传入的图层必须有layerName（图层名）
> * 初始化图层切换控件（var layerSwitcher = new HMap.LayerSwitcher(Maps.map)）；
> * 传入图层名去控制图层（layerSwitcher.switchLayer(layerName)）

## API

### `new HMap.LayerSwitcher(Maps.map)`

## Examples

```bash
HMap/example/LayerSwitcher.html
```

#### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`map`|`Object`| `地图对象（Maps.map）` |

#### Methods

##### `switchLayer(layerName)`

切换图层

##### `getBaseLayerNames()`

返回所有底图的图层名（`Array`）

##### `setMap(map)`

设置地图对象

##### `getMap()`

返回地图对象

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`map`|`ol.Map`| 地图实例 |
