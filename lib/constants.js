/**
 * Created by FDD on 2017/2/22.
 * @desc 静态常量
 */

export const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
export const PI = 3.1415926535897932384626; // PI
export const a = 6378245.0; // 北京54坐标系长半轴a=6378245m
export const ee = 0.00669342162296594323;

import _config from './config/mapConfig'
import _Map from './map/Map'
import _Layer from './layer/Layer'
import _Style from './style/Style'
import _Mix from './utils/mixin'

// modules
export const Layer = _Layer;
export const Map = _Map;
export const Style = _Style;
export const config = _config;
export const mix = _Mix;