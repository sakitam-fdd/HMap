/**
 * 周边搜索 插件
 */
import {ol} from '../constants'
class CustomCircle {
  constructor(map, options) {
    this.map = map; //当前map对象
    this.options = options; //当前传输参数
    this.sphere = new ol.Sphere(6378137);
    this.center = options.center;
    this.projection = this.map.getView().getProjection();
    this.minRadius = 500; //最小半径
    this.maxRadius = 5000000; //最大半径
    this.defaultSrc = "../example/images/marker.png"; //默认中心点src样式
    this.centerPoint = this.addCenterPoint(options.centerPoint ? (options.centerPoint.src ? options.centerPoint.src : this.defaultSrc) : this.defaultSrc); //中心点
    this.distance = options.distance ? (options.distance > this.minRadius && options.distance < this.maxRadius) ? this.transformRadius(this.center, options.distance) : this.transformRadius(this.center, this.minRadius) : this.transformRadius(this.center, this.minRadius);
    this.unit = options.distance ? ((options.distance > this.minRadius && options.distance < this.maxRadius) ? options.distance : this.minRadius) : this.minRadius;
    this.mouseIng = false;  //移动状态 false (未移动)true (移动中)
    this.defaultStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(71, 129, 217, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(71, 129, 217, 1)',
        width: 1
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: 'rgba(71, 129, 217, 0.2)'
        })
      })
    }); //默认样式
    this.style = options.style ? options.style : this.defaultStyle; //圆的样式
    this.feature = this.addRangeCircle();   //圆的feature
    this.editor = this.addEditor(); //编辑器 overlay

  }

  initCustomCircle() {
    //创建周边搜索插件
    // 创建一个临时图层 目前先写着 之后调用另一个里的 创建图层的方法
    let layer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      layerName: "CustomCircle"
    });
    // 在map里添加该图层
    this.map.addLayer(layer);
    //添加范围圆
    layer.getSource().addFeature(this.feature);
    this.map.addOverlay(this.centerPoint);

    //添加编辑器
    this.map.addOverlay(this.editor);
    // 开启拖拽事件
    this.dragEditor();
    //默认设置地图范围
    this.setSuitableExtent();
    //对overlay中心点进行偏移处理
    let self = this;
    this.centerPoint.getElement().onload = function (evt) {
      let x = -parseInt(self.centerPoint.getElement().width / 2);
      let y = -parseInt(self.centerPoint.getElement().height / 2);
      self.centerPoint.setOffset([x, y])
    }
  }

  /**
   * 创建范围圆
   */
  addRangeCircle() {
    let feature = new ol.Feature({
      geometry: new ol.geom.Circle(this.center, this.distance)
    });
    feature.setStyle(this.style);
    return feature;
  }

  /**
   * 创建中心点
   * @param src
   * @returns {ol.Overlay}
   */
  addCenterPoint(src) {
    let element = document.createElement("img");
    element.src = src;
    let centerPoint = new ol.Overlay({
      element: element
    });
    centerPoint.setPosition(this.center);
    return centerPoint;
  }

  /**
   * 创建编辑器
   * @returns {ol.Overlay}
   */
  addEditor() {
    let src = "http://webmap0.map.bdstatic.com/wolfman/static/common/images/nbsearch_366e590.png";
    let editor = document.createElement("div");
    editor.setAttribute("id", "editor");
    let icon = document.createElement("img");
    icon.setAttribute("id", "icon");
    icon.src = src;
    icon.style.maxWidth = "none";
    icon.style.float = "left";
    editor.appendChild(icon);
    editor.appendChild(this.addText());
    let overlay = new ol.Overlay({
      element: editor,
      offset: [-15, -10]
    });
    overlay.setPosition(this.feature.getGeometry().getLastCoordinate());
    return overlay;

  }

  /**
   * 创建text文本器
   * @returns {Element}
   */
  addText() {
    let text = document.createElement("div");
    text.setAttribute("id", "range");
    text.innerHTML = this.unit + "m";
    text.style.width = "85px";
    text.style.height = "18px";
    text.style.lineHeight = "18px";
    text.style.border = "1px solid black";
    text.style.color = "black";
    text.style.background = "white";
    text.style.float = "left";
    text.style.marginLeft = "5px";
    text.style.textAlign = "center";
    text.style.position = "absolute";
    text.style.left = "30px";
    text.style.fontSize = "12px";
    return text;
  }

  /**
   * 求取半径值
   * @param coordinate 当前移动到的位置的坐标
   * @returns {number} 返回圆的半径
   */
  getRadius(coordinate) {
    let radius = null;
    switch (this.projection.getCode()) {
      case "EPSG:4326":
        radius = this.sphere.haversineDistance(this.center, coordinate);
        break;
      case "EPSG:3857":
      case "EPSG:102100":
        radius = Math.sqrt(Math.pow(coordinate[0] - this.center[0], 2) + Math.pow(coordinate[1] - this.center[1], 2));
        break;
    }
    let unit = radius;
    radius = this.transformRadius(this.center, radius);
    if (unit > this.maxRadius) {
      radius = this.transformRadius(this.center, this.maxRadius);
      unit = this.maxRadius;
    } else if (unit < this.minRadius) {
      radius = this.transformRadius(this.center, this.minRadius);
      unit = this.minRadius;
    }
    return {unit: unit, radius: radius};
  }

  /**
   * 拖拽编辑器
   */
  dragEditor() {
    var self = this;
    document.onmouseup = function (evt) {
      self.mouseIng = false;
      self.options.successCallback(self._getWKT(), self._getCenter(), self._getRadius())
    };
    this.editor.getElement().onmousedown = function (evt) {
      self.mouseIng = true;
    };
    this.map.on("pointermove", function (event) {
      if (self.mouseIng) {
        let radius = self.getRadius(event.coordinate);
        //重新设置圆的半径
        self.feature.getGeometry().setRadius(radius["radius"]);
        //重新设置 text值
        let text = document.getElementById("range");
        text.innerHTML = parseInt(radius["unit"]) + "m";
        //重新设置overlay位置
        self.editor.setPosition(self.feature.getGeometry().getLastCoordinate());
      }
    })
  }

  /**
   * 半径和坐标间的转换
   * @param center
   * @param meterRadius
   * @returns {number}
   */
  transformRadius(center, meterRadius) {
    let transformRadiu = 0;
    switch (this.projection.getCode()) {
      case 'EPSG:4326':
        let lastcoord = new ol.Sphere(6378137).offset(center, meterRadius, (270 / 360) * 2 * Math.PI); //计算偏移量
        let dx = center[0] - lastcoord[0];
        let dy = center[1] - lastcoord[1];
        transformRadiu = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        break;
      case 'EPSG:3857':
      case 'EPSG:102100':
        transformRadiu = meterRadius;
        break;
    }
    return transformRadiu
  }


  /**
   * 将地图缩放到合适的范围
   */
  setSuitableExtent() {
    let extent = this._getGeometry().getExtent();
    let size = this.map.getSize();
    this.map.getView().fit(extent, size)
  }

  /**
   * 获取圆的geometry
   * @private
   */
  _getGeometry() {
    return this.feature.getGeometry()
  }

  /**
   * 获取圆的中心点
   * @returns {ol.Coordinate|ol.Coordinate|undefined|*}
   * @private
   */
  _getCenter() {
    return this._getGeometry().getCenter()
  }

  /**
   * 获取圆的半径
   * @returns {number|*}
   * @private
   */
  _getRadius() {
    return this._getGeometry().getRadius()
  }

  /**
   * 获取圆的第一个坐标
   * @returns {*}
   * @private
   */
  _getFirstCoordinate() {
    return this._getCoordinates()[0]
  }

  /**
   * 获取圆的最后一个坐标
   * @returns {*}
   * @private
   */
  _getLastCoordinate() {
    return this._getCoordinates()[this._getCoordinates().length - 1]
  }

  /**
   * 设置圆的半径
   * @param radius 半径长度
   * @private
   */
  _setRadius(radius) {
    this._getGeometry().setRadius(radius)
  }

  /**
   * 设置圆的圆心
   * @param center 圆心坐标[x,y]
   * @private
   */
  _setCenter(center) {
    this._getGeometry().setCenter(center)
  }

  /**
   * 设置中心点 样式
   * @param src 图片的路径
   * @private
   */
  _setCenterPoint(src) {
    let element = this.centerPoint.getElement();
    element.src = src;
  }

  /**
   * 获取标准WKT数据
   * @returns {string}
   * @private
   */
  _getWKT() {
    let polygon = ol.geom.Polygon.fromCircle(this._getGeometry());
    let wkt = new ol.format.WKT().writeGeometry(polygon);
    return wkt;
  }
}

export default CustomCircle