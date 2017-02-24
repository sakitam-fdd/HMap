/**
 * Created by FDD on 2017/2/22.
 * @desc 静态常量
 */

import _proj4 from '../node_modules/proj4'

import _Layer from './layer/layer'
import _Feature from './feature/feature'
import _LayerSwitcher from './layer/LayerSwitcher'

// lib
export const ol = require('../node_modules/openlayers');
export const proj4 = _proj4;

// modules
export const Layer = _Layer;
export const Feature = _Feature;
export const LayerSwitcher = _LayerSwitcher;