/**
 * 周边搜索 插件
 */
import {ol} from '../constants'
class CustomCircle {
  constructor(map, options) {
    this.map = map; //当前map对象
    this.sphere = new ol.Sphere(6378137);
    this.center = options.center;
    this.projection = this.map.getView().getProjection();
    this.minRadius = 500; //最小半径
    this.maxRadius = 5000000; //最大半径
    this.distance = options.distance ? this.transformRadius(this.center, options.distance) : this.transformRadius(this.center, this.minRadius);
    this.unit = options.distance ? options.distance : this.minRadius;
    this.mouseIng = false;  //移动状态 false (未移动)true (移动中)
    this.feature = this.addRangeCircle();   //圆的feature
    this.editor = this.addEditor(); //编辑器 overlay
  }

  addCustomCircle(src) {
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

    //添加编辑器
    this.map.addOverlay(this.editor);

    // 开启拖拽事件
    this.dragEditor();

  }

  /**
   * 创建范围圆
   */
  addRangeCircle() {
    let feature = new ol.Feature({
      geometry: new ol.geom.Circle(this.center, this.distance)
    });
    return feature;
  }

  /**
   * 创建中心点
   * @param src
   * @returns {ol.Overlay}
   */
  addCenterPoint(src) {
    let element = document.createElement("image");
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
    editor.style.width = "100px";
    editor.style.height = "20px";
    editor.style.position = "relative";
    editor.style.left = "-18px";
    editor.style.top = "-7px";
    editor.style.overflow = "hidden";
    let icon = document.createElement("img");
    icon.setAttribute("id", "icon");
    icon.src = src;
    editor.appendChild(icon);
    editor.appendChild(this.addText());
    let overlay = new ol.Overlay({
      element: editor
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
    text.style.width = "63px";
    text.style.height = "18px";
    text.style.lineHeight = "18px";
    text.style.border = "1px solid black";
    text.style.color = "black";
    text.style.background = "white";
    text.style.float = "left";
    text.style.marginLeft = "5px";
    text.style.textAlign = "center";
    text.style.position = "relative";
    text.style.left = "30px";
    text.style.top = "-24px";
    text.style.fontSize = "12px";
    return text;
  }

  /**
   * 求取半径值
   * @param coordinate 当前移动到的位置的坐标
   * @returns {number} 返回圆的半径
   */
  getRadius(coordinate) {
    let radius = this.sphere.haversineDistance(this.center, coordinate);
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
   * 创建编辑器
   */
  dragEditor() {
    var self = this;
    document.onmouseup = function (evt) {
      self.mouseIng = false;
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

}

export default CustomCircle