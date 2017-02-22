import ol from '../node_modules/openlayers'
class Map {
  constructor (mapDiv, params) {
    this._version = '1.0.0';
    let options = params || {};
    this.map = new ol.Map({
      target: mapDiv,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
          source: new ol.source.Vector({
            url: 'https://openlayers.org/en/v4.0.1/examples/data/geojson/countries.geojson',
            format: new ol.format.GeoJSON()
          })
        })
      ],
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });
  }

  getMap() {
    return this.map;
  }
}

export default Map