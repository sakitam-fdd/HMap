/**
 * Created by FDD on 2017/2/22.
 * @desc 静态常量
 */

export const X_PI = 3.14159265358979324 * 3000.0 / 180.0
export const PI = 3.1415926535897932384626 // PI
export const a = 6378245.0 // 北京54坐标系长半轴a=6378245m
export const ee = 0.00669342162296594323

// import _proj4 from '../node_modules/proj4'
import _ol from '../node_modules/openlayers'
import _mathjs from '../node_modules/mathjs'
// import _olx from '../node_modules/openlayers/externs'
// import _olx from '../node_modules/openlayers/externs/olx'

import _config from './config/config'

export const ol = _ol
// export const proj4 = _proj4
// export const olx = _olx;
export const config = _config
export const math = _mathjs
