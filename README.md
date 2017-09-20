# HMap  |  基于openlayers的封装组件

[![Build Status](https://travis-ci.org/sakitam-fdd/HMap.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/HMap)
[![NPM downloads](https://img.shields.io/npm/dm/hmap-js.svg)](https://npmjs.org/package/hmap-js)
![JS gzip size](https://img.badgesize.io/https://unpkg.com/hmap-js/lib/index.js?compression=gzip&label=gzip%20size:%20JS)
[![Npm package](https://img.shields.io/npm/v/hmap-js.svg)](https://www.npmjs.org/package/hmap-js)
[![GitHub stars](https://img.shields.io/github/stars/sakitam-fdd/HMap.svg)](https://github.com/sakitam-fdd/HMap/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/sakitam-fdd/HMap/master/LICENSE)

- 采用mapbox配置式创建和管理地图
- 开发者无需关心地图的具体操作

## 编译

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上 HMap 最新的源码，你需要自己构建。

## 浏览器支持

<p align="center">
  <img src="https://github.com/sakitam-fdd/HMap/raw/V1.0/asset/brow.png"/> 
</p>

---

```bash
git clone https://github.com/sakitam-fdd/HMap.git
npm install
npm run dev
npm run build
```

### 安装

#### npm安装

```
npm install hmap-js --save
```

#### cdn

```bash
https://unpkg.com/hmap-js@1.5.0/dist/hmap.js
https://unpkg.com/hmap-js@1.5.0/dist/hmap.min.js
https://unpkg.com/hmap-js@1.5.0/dist/hmap.css
https://unpkg.com/hmap-js@1.5.0/dist/hmap.min.css
```

#### 示例

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
        opaque: true, //图层是否不透明
        layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
    ]
  });
```
