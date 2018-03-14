# HMap  |  基于openlayers的封装组件

[![Build Status](https://travis-ci.org/sakitam-fdd/HMap.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/HMap)
[![NPM downloads](https://img.shields.io/npm/dm/hmap-js.svg)](https://npmjs.org/package/hmap-js)
[![](https://data.jsdelivr.com/v1/package/npm/hmap-js/badge)](https://www.jsdelivr.com/package/npm/hmap-js)
![JS gzip size](http://img.badgesize.io/https://unpkg.com/hmap-js/dist/hmap.js?compression=gzip&label=gzip%20size:%20JS)
[![Npm package](https://img.shields.io/npm/v/hmap-js.svg)](https://www.npmjs.org/package/hmap-js)
[![GitHub stars](https://img.shields.io/github/stars/sakitam-fdd/HMap.svg)](https://github.com/sakitam-fdd/HMap/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/sakitam-fdd/HMap/master/LICENSE)

- 采用mapbox配置式创建和管理地图
- 开发者无需关心gis地图相关原理就可以轻松创建地图
- 相比原生openlayers更易用，也更符合国内webgis应用场景

## 编译

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上 HMap 最新的源码，你需要自己构建。

```bash
git clone https://github.com/sakitam-fdd/HMap.git
npm install
npm run dev
npm run build
```

## 浏览器支持

支持在HTML5和ECMAScript 5的所有现代浏览器上运行。包括Chrome，Firefox，
Safari和Edge。对于旧版浏览器和平台，如Internet Explorer（至9版）和Android 4.x，
必须提供`requestAnimationFrame`和`Element.prototype.classList`的polyfill，
并且使用KML格式需要一个polyfill的URL。

### 安装

#### npm安装

```
npm install hmap-js --save
```

#### cdn

目前可通过 [unpkg.com/hmap-js](https://unpkg.com/hmap-js/dist/hmap.js) / [jsdelivr](https://cdn.jsdelivr.net/npm/hmap-js/dist/hmap.js) 获取最新版本的资源。

```bash
// jsdelivr (jsdelivr由于缓存原因最好锁定版本号，否则可能会出现意料之外的问题)
https://cdn.jsdelivr.net/npm/hmap-js@1.5.5/dist/hmap.js
https://cdn.jsdelivr.net/npm/hmap-js@1.5.5/dist/hmap.min.js
https://cdn.jsdelivr.net/npm/hmap-js@1.5.5/dist/hmap.css
https://cdn.jsdelivr.net/npm/hmap-js@1.5.5/dist/hmap.min.css
// npm
https://unpkg.com/hmap-js/dist/hmap.js
https://unpkg.com/hmap-js/dist/hmap.min.js
https://unpkg.com/hmap-js/dist/hmap.css
https://unpkg.com/hmap-js/dist/hmap.min.css
```

#### 示例

> 注意：ol类库已被打包，对于高级用户，可以直接使用ol来进行必要的操作。

```javascript
var Map = new HMap('map', {
    controls: {
      loading: true,
      zoomSlider: true,
      fullScreen: true
    },
    interactions: {
      shiftDragZoom: false
    },
    view: {
      center: [12118909.300259633, 4086043.1061670054],
      projection: 'EPSG:3857',
      zoom: 5, // resolution
    },
    baseLayers: [
      {
        layerName: 'openstreetmap',
        isDefault: true,
        layerType: 'OSM',
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });
```
