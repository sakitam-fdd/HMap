## 安装

### 开发版本

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上 HMap 最新的源码，你需要自己构建。

```bash
git clone https://github.com/sakitam-fdd/HMap.git
npm install
npm run dev
npm run build
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
import HMap from '../dist/HMap'
let Maps = new HMap.Map()
Maps.initMap('map', {
  view: {
    center: [0, 0],
    // constrainRotation: false, // 旋转角度约束
    enableRotation: true, // 是否允许旋转
//      extent: [],
//      maxResolution: 0, // 非必须参数
//      minResolution: 0, // 非必须参数
//      maxZoom: 19, // 非必须参数
//      minZoom: 0, // 非必须参数
    projection: 'EPSG:3857',
    rotation: 0,
    zoom: 0, // resolution
    zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
  }
})
console.log(Maps)
```

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