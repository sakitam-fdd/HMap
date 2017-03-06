/**
 * Created by FDD on 2017/2/22.
 * @desc 静态常量
 */

export const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
export const PI = 3.1415926535897932384626; // PI
export const a = 6378245.0; // 北京54坐标系长半轴a=6378245m
export const ee = 0.00669342162296594323;

import _proj4 from '../node_modules/proj4'
import _ol from '../node_modules/openlayers'

import _Layer from './layer/layer'
import _Feature from './feature/feature'
import _LayerSwitcher from './layer/LayerSwitcher'
import * as _Style from './style/style'

// lib
// export const ol = require('../node_modules/openlayers');
export const ol = _ol;
export const proj4 = _proj4;

// modules
export const Layer = _Layer;
export const Feature = _Feature;
export const LayerSwitcher = _LayerSwitcher;
export const Style = _Style;