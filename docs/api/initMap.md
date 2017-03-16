## 加载一个简单的地图
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
<script type="text/javascript">
  var Maps = new HMap.Map();
  Maps.initMap('map', {
    view: {
      center: [0, 0], // 视图中心点（必须）
      enableRotation: true, // 是否允许旋转
      projection: 'EPSG:3857', // 视图投影坐标系（不传时默认3857）
      rotation: 0, // 视图旋转角（不传默认为0）
      zoom: 0, // resolution
      zoomFactor: 2 // 用于约束分变率的缩放因子（高分辨率设备需要注意）
    },
    logo: {},
//    baseLayers: [] // 不传时默认加载OSM地图。
  });
  console.log(Maps);
</script>
</body>
</html>
```