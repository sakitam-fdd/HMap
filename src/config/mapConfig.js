const mapConfig = {
  center: [109.15169990462329, 31.74108365827285],
  resolution: 0.05406145033589252,
  zoom: 5,
  projection: 'EPSG:102100',
  overViewMapVisible: false,
  scaleLineVisible: true,
  baseLayers: [
    {
      layerName: 'vector',
      isDefault: true,
      layerType: 'TileXYZ',
      opaque: true, //图层是否不透明
      layerUrl: 'http://10.254.123.75:8080/OneMapServer/rest/services/World2ChinaMapBG/MapServer',
      label: { //地图图层是否对应的有标注层
        layerName: 'vectorLabel',
        isDefault: true,
        layerType: 'TileXYZ',
        layerUrl: 'http://10.254.123.75:8080/OneMapServer/rest/services/World2ChinaMapLabel/MapServer'
      }
    },
    {
      layerName: 'earth',
      layerType: 'TitleWMTS',
      layer: 'img',
      isDefault: false,
      layerUrl: 'http://t{0-6}.tianditu.cn/img_c/wmts',
      label: {
        layerName: 'TDTLabel',
        layerType: 'TitleWMTS',
        layer: 'cia',
        isDefault: false,
        layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
      }
    },
    {
      layerName: 'panorama',
      layerType: 'TitleWMTS',
      layer: 'ter',
      isDefault: false,
      layerUrl: 'http://t{0-6}.tianditu.com/ter_c/wmts',
      label: {
        layerName: 'TDTLabel',
        layerType: 'TitleWMTS',
        layer: 'cia',
        isDefault: false,
        layerUrl: 'http://t{0-6}.tianditu.cn/cia_c/wmts'
      }
    }
  ]
};
export default mapConfig