# WEBGIS地图类库
[![Build Status](https://www.travis-ci.org/sakitam-fdd/HMap.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/HMap)
[![NPM](https://nodei.co/npm/hmap-js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/hmap-js/)

## build

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上 HMap 最新的源码，你需要自己构建。

## 浏览器支持

<p align="center">
  <img src="https://github.com/sakitam-fdd/HMap/raw/master/asset/brow.png"/> 
</p>

---

```bash
git clone https://github.com/sakitam-fdd/HMap.git
npm install
npm run dev
npm run build
```

## 引用方式

### CDN引用

```bash
https://unpkg.com/hmap-js@1.3.6/dist/HMap.js
https://unpkg.com/hmap-js@1.3.6/dist/HMap.min.js
https://unpkg.com/hmap-js@1.3.6/dist/HMap.css
https://unpkg.com/hmap-js@1.3.6/dist/HMap.min.css
```

### NPM包管理

```bash
npm install hmap-js --save
import HMap from 'hmap-js'
```

### AMD-模块加载器

> 独立下载版本已用 UMD 包装，因此它们可以直接用作 AMD 模块。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>加载一个简单地图</title>
  <link rel="stylesheet" href="../dist/HMap.css" type="text/css">
</head>
<body>
<div id="map"></div>
<script src="../dist/HMap.js"></script>
</body>
</html>
```

### ES6方式引入

> vue和angular2搭配es6使用时可以采用

```javascript
var Maps = new HMap.Map();
  Maps.initMap('map', {
    view: {
      center: [12118909.300259633, 4086043.1061670054],
//      center: [115.92466595234826, 27.428038204473552],
      projection: 'EPSG:3857',
//      projection: 'EPSG:4326',
      zoom: 5, // resolution
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        isDefault: true,
        layerType: 'OSM',
        opaque: true, //图层是否不透明
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  })
```

## 截图示例

![散点图](https://raw.githubusercontent.com/sakitam-fdd/HMap/master/asset/demo/rr.png)

![迁徙图](https://raw.githubusercontent.com/sakitam-fdd/HMap/master/asset/demo/flay.gif)

![热力图](https://raw.githubusercontent.com/sakitam-fdd/HMap/master/asset/demo/heatMap.png)

![军事标绘](https://raw.githubusercontent.com/sakitam-fdd/HMap/master/asset/demo/plot.png)

其他示例请参看example文件夹

## 文档生成和查看

> 首先安装gitbook

```bash
npm install // 或者
npm install -g gitbook
```
> 安装相关插件

```bash
gitbook install
```

> 启动本地服务

```bash
gitbook serve
```

> 浏览器打开
```bash
http://localhost:4000
```
