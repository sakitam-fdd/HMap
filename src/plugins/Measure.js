/**
 * Created by changjn on 2017/3/16.
 */
import { ol } from '../constants'
class Measure {
  constructor (map) {
    this.inr = null;
    this.map = map;
  }
  ranging () {
    this.addEvent();
    this.addInteraction();
  }

  addInteraction () {
    if (this.inr) {
      this.map.removeInteraction(this.inr);
    }
    this.inr = new ol.interaction.Draw({
      type: 'Point',
      source: this.map.getLayers()[1].getSource()    // 注意设置source，这样绘制好的线，就会添加到这个source里
    });
    this.map.addInteraction(this.inr);
  }
  addEvent () {
    this.map.on('click', event => {
      // 在地图上添加一个圆
      console.log(event)
      debugger
      var circle = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform(
          [104, 30], 'EPSG:4326', 'EPSG:3857'))
      })
      circle.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({
            color: 'red'
          })
        })
      }));

      this.map.getLayers()[1].getSource().addFeature(circle);
    })
  }

}
export default Measure