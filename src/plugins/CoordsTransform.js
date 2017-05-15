/**
 * Created by FDD on 2017/2/24.
 * @desc 原作者 Wandergis <https://github.com/wandergis/coordtransform>
 * 在此基础上添加优化和处理，并改写为es6
 */
import {PI, X_PI, a, ee} from '../constants'
class CoordsTransform {
  /**
   * 转换纬度
   * @param lng
   * @param lat
   * @returns {number}
   */
  transformlat (lng, lat) {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0
    return ret
  }

  /**
   * 转换经度
   * @param lng
   * @param lat
   * @returns {number}
   */
  transformlng (lng, lat) {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
    return ret
  }

  /**
   * 判断坐标是否在国内（国外坐标不需转换）
   * @param lng
   * @param lat
   * @returns {boolean}
   */
  outOfChina (lng, lat) {
    // 纬度3.86~53.55,经度73.66~135.05
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
  }

  /**
   * 国测局J02（火星坐标系 (GCJ-02)）坐标转WGS84
   * @param lng
   * @param lat
   * @returns {[*,*]}
   */
  gcj02towgs84 (lng, lat) {
    if (this.outOfChina(lng, lat)) {
      return [lng, lat]
    } else {
      let dlat = this.transformlat(lng - 105.0, lat - 35.0)
      let dlng = this.transformlng(lng - 105.0, lat - 35.0)
      let radlat = lat / 180.0 * PI
      let magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      let sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
      dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
      let mglat = lat + dlat
      let mglng = lng + dlng
      return [lng * 2 - mglng, lat * 2 - mglat]
    }
  }

  /**
   * WGS84转国测局J02（火星坐标系 (GCJ-02)）
   * @param lng
   * @param lat
   * @returns {[*,*]}
   */
  wgs84togcj02 (lng, lat) {
    if (this.outOfChina(lng, lat)) {
      return [lng, lat]
    } else {
      let dlat = this.transformlat(lng - 105.0, lat - 35.0)
      let dlng = this.transformlng(lng - 105.0, lat - 35.0)
      let radlat = lat / 180.0 * PI
      let magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      let sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
      dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
      let mglat = lat + dlat
      let mglng = lng + dlng
      return [mglng, mglat]
    }
  }

  /**
   * 国测局J02（火星坐标系 (GCJ-02)）转百度坐标系
   * @param lng
   * @param lat
   * @returns {[*,*]}
   */
  gcj02tobd (lng, lat) {
    let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI)
    let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI)
    let bdLng = z * Math.cos(theta) + 0.0065
    let bdLat = z * Math.sin(theta) + 0.006
    return [bdLng, bdLat]
  }

  /**
   * 百度坐标系转国测局J02（火星坐标系 (GCJ-02)）
   * @param lon
   * @param lat
   * @returns {[*,*]}
   */
  bdtogcj02 (lon, lat) {
    let x = lon - 0.0065
    let y = lat - 0.006
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI)
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI)
    let ggLng = z * Math.cos(theta)
    let ggLat = z * Math.sin(theta)
    return [ggLng, ggLat]
  }

  /**
   * 经纬度转Mercator
   * @param lontitude
   * @param latitude
   * @returns {[*,*]}
   */
  lonLatToMercator (lontitude, latitude) {
    let x = lontitude * 20037508.34 / 180
    let y = Math.log(Math.tan((90 + latitude) * Math.PI / 360)) / (Math.PI / 180)
    y = y * 20037508.34 / 180
    return [x, y]
  }

  /**
   * Mercator转经纬度
   * @param x
   * @param y
   * @returns {[*,*]}
   * @constructor
   */
  MercatorTolonLat (x, y) {
    let longtitude = x / 20037508.34 * 180
    let latitude = y / 20037508.34 * 180
    latitude = 180 / Math.PI * (2 * Math.atan(Math.exp(latitude * Math.PI / 180)) - Math.PI / 2)
    return [longtitude, latitude]
  }
}

export default CoordsTransform
