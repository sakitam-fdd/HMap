## 安装

### 开发版本

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上 HMap 最新的源码，你需要自己构建。

```bash
git clone https://github.com/smileFDD/HMap.git
npm install
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