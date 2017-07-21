/**
 * Created by FDD on 2017/6/14.
 * @desc Controls
 */
import {ol} from '../constants'
import './Geolocation'
import './Loading'
import './BaseLayerSwitcher'
import CompareLayer from './CompareLayer'
let Controls = {
  CompareLayer: CompareLayer,
  Loading: ol.control.Loading,
  Geolocation: ol.control.Geolocation,
  BaseLayerSwitcher: ol.control.BaseLayerSwitcher
}

export default Controls
