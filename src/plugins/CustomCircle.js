/**
 * 周边搜索 插件
 */
import {ol} from '../constants'
class CustomCircle {
  constructor(map, options) {
    this.map = map; //当前map对象
    this.sphere = new ol.Sphere(6378137);
    this.center = options.center; //中心点
    this.projection = this.map.getView().getProjection(); //投影
    this.minRadius = 500; //最小半径
    this.maxRadius = 5000000; //最大半径
    this.distance = options.distance ? this.transformRadius(this.center, options.distance) : this.transformRadius(this.center, this.minRadius);
    this.unit = options.distance ? options.distance : this.minRadius; //显示距离
    this.mouseIng = false;  //移动状态 false (未移动)true (移动中)
    this.feature = this.addRangeCircle();   //圆的feature
    this.editor = this.addEditor(); //编辑器 overlay
  }

  addCustomCircle() {
    //创建周边搜索插件
    // 创建一个临时图层 目前先写着 之后调用另一个里的 创建图层的方法
    let layer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      layerName: "CustomCircle"
    });
    // 在map里添加该图层
    this.map.addLayer(layer);

    //创建中心点
    layer.getSource().addFeature(this.feature);
    this.map.addOverlay(this.editor);

    this.dragEditor(); // 开启拖拽事件

  }

  addRangeCircle() {
    //创建范围圆
    let feature = new ol.Feature({
      geometry: new ol.geom.Circle(this.center, this.distance)
    });
    return feature;
  }

  /**
   * 添加中心点
   * @returns {ol.Overlay}
   */
  addCenterPoint() {
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
    editor.appendChild(text);
    let overlay = new ol.Overlay({
      element: editor
    });
    overlay.setPosition(this.feature.getGeometry().getLastCoordinate());
    return overlay;

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
      unit = this.maxRadius;
      radius = this.transformRadius(this.center, this.maxRadius);
    } else if (radius < this.minRadius) {
      unit = this.minRadius;
      radius = this.transformRadius(this.center, this.minRadius);
    }
    return {unit: unit, radius: radius};
  }

  /**
   * 对编辑器进行拖拽操作
   */
  dragEditor() {
    var self = this;
    //拖拽编辑器
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
        self.featureM.getGeometry().setRadius(radius["radius"]);
        //重新设置 text值
        let text = document.getElementById("range");
        text.innerHTML = parseInt(radius["unit"]) + "m";
        //重新设置overlay位置
        self.editor.setPosition(self.featureM.getGeometry().getLastCoordinate());
      }
    })
  }

  /**
   * 坐标和半径的转换
   * @param center 中心点
   * @param meterRadius 半径
   * @returns {number}
   */
  transformRadius(center, meterRadius) {
    let transformRadius = 0;
    switch (this.projection.getCode()) {
      case 'EPSG:4326':
        let coordinate = this.sphere.offset(center, meterRadius, (270 / 360) * 2 * Math.PI); //计算偏移量
        let dx = center[0] - coordinate[0];
        let dy = center[1] - coordinate[1];
        transformRadius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        break;
      case 'EPSG:3857':
      case 'EPSG:102100':
        transformRadius = meterRadius;
        break;
    }
    return transformRadius
  }
}
export default CustomCircle