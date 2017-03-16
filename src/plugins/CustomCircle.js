/**
 * 周边搜索 插件
 */
import {ol} from '../constants'
class CustomCircle {
  constructor(map, options) {
    this.map = map; //当前map对象
    this.center = options.center;
    this.minRadius = 500; //最小半径
    this.maxRadius = 50000; //最大半径
    this.distance = options.distance ? options.distance : this.minRadius;
    this.mouseIng = false;  //移动状态 false (未移动)true (移动中)
    this.feature = this.addRangeCircle();   //圆的feature
    this.editor = this.addEditor(); //编辑器 overlay
    this.text = this.distance + "m"; //text文本默认显示

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
    //distance = distance ? distance : this.minRadius;

    //创建中心点
    //let centerPoint = this.addCenterPoint(src, this.center);
    //this.map.addOverlay(centerPoint);
    layer.getSource().addFeature(this.feature);

    //创建编辑器
    //this.editor = this.addEditor(this.feature.getGeometry().getLastCoordinate(), distance);

    //this.map.addOverlay(this.editor);

    //this.dragEditor(); // 开启拖拽事件

  }

  addRangeCircle() {
    //创建范围圆
    let feature = new ol.Feature({
      geometry: new ol.geom.Circle(this.center, this.distance)
    });
    return feature;
  }

  addCenterPoint(src) {
    //添加中心点
    let element = document.createElement("image");
    element.src = src;
    let centerPoint = new ol.Overlay({
      element: element
    });
    centerPoint.setPosition(this.center);
    return centerPoint;
  }

  addEditor() {
    //创建编辑器
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
    text.innerHTML = this.distance + "m";
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
    this.text = text;
    editor.appendChild(text);

    console.info(this.feature.getGeometry().getLastCoordinate())
    let overlay = new ol.Overlay({
      element: editor
    });
    overlay.setPosition(this.feature.getGeometry().getLastCoordinate());
    return overlay;

  }

  /**
   * 设置半径值
   * @param center 圆的中心点
   * @param coordinate 当前移动到的位置的坐标
   * @returns {number} 返回圆的半径
   */
  getRadius(coordinate) {
    var radius = Math.sqrt(Math.pow(coordinate[0] - this.center[0], 2) + Math.pow(coordinate[1] - this.center[1], 2));
    if (radius > this.maxRadius) {
      radius = this.maxRadius;
    } else if (radius < this.minRadius) {
      radius = this.minRadius;
    }
    return radius;
  }

  dragEditor() {
    var self = this;
    //let mouseIng = this.mouseIng;
    //let feature = this.feature;
    //let text = this.text;
    //let editor = this.editor;
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
        self.feature.getGeometry().setRadius(radius);  //全局方法和全局对象如何调用
        //重新设置 text值
        self.text.innerHTML = parseInt(radius) + "m";
        //重新设置overlay位置
        self.editor.setPosition(self.feature.getGeometry().getLastCoordinate());
      }
    })
  }

}

export default CustomCircle