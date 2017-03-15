import { ol, proj4, config } from '../constants'
class View {
  _addView (params) {
    let option = params || {};
    return new ol.View({
      center: ((option['center'] && Array.isArray(option['center'])) ? option['center'] : [0, 0]),
      zoom: ((option['zoom'] && (typeof option['zoom'] == 'number')) ? option['zoom'] : 0),
      zoomFactor: ((option['zoomFactor'] && (typeof option['zoomFactor'] == 'number')) ? option['zoomFactor'] : 2),
      rotation: ((option['rotation'] && (typeof option['rotation'] == 'number')) ? option['rotation'] : 0),
      enableRotation: (option['enableRotation'] === false ? false : true),
      projection: (option['projection'] ? option['projection'] : 'EPSG:3857'),
      extent: ((option['extent'] && Array.isArray(option['extent']) && option['extent'].length == 4) ? option['extent'] : undefined),
      resolutions: ((option['resolutions'] && Array.isArray(option['resolutions']) && option['resolutions'].length > 0) ? option['resolutions'] : undefined)
    })
  }
}

export default View