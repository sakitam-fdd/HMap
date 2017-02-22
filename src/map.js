import ol from '../node_modules/openlayers'
class Map {
  constructor (mapDiv, params) {
    this._version = '1.0.0';
    let options = params || {};
    let urlTemplate = tileUrl + '/tile/{z}/{y}/{x}';
    let tileArcGISXYZ = new ol.source.XYZ({
      wrapX: false,
      projection: this.projection,
      tileUrlFunction: function (tileCoord) {
        let url = urlTemplate.replace('{z}', (tileCoord[0]).toString())
          .replace('{x}', tileCoord[1].toString())
          .replace('{y}', (-tileCoord[2] - 1).toString());
        return url
      }
    });
    let baseLayer = new ol.layer.Tile({
      isBaseLayer: true,
      isCurrentBaseLayer: true,
      layerName: options.layerName,
      source: tileArcGISXYZ
    });
    this.map = new ol.Map({
      target: mapDiv,
      layers: [baseLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat(options.center, this.projection),
        zoom: options.zoom
      })
    })
  }
}

module.exports = Map