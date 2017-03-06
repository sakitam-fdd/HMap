import { ol } from '../constants'

export const getStyleByPoint = attr => {
  let style = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, -1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 0.75,
      src: ''
    })
  });
  return style;
};
