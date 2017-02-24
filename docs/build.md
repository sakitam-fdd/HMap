## 修改ol.js
```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.ol = factory();
  }
})
```

## 修改 proj4里面的两个保持路径正确

```javascript
var proj4 = require('./core');
proj4.defaultDatum = 'WGS84'; //default datum
proj4.Proj = require('./Proj');
proj4.WGS84 = new proj4.Proj('WGS84');
proj4.Point = require('./Point');
proj4.toPoint = require('./common/toPoint');
proj4.defs = require('./defs');
proj4.transform = require('./transform');
proj4.mgrs = require('../../mgrs');
proj4.version = require('./version');
require('./includedProjections')(proj4);
module.exports = proj4;

```