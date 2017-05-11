/**
 * Created by FDD on 2017/5/10.
 * @desc 空间数据加密解密算法
 */
class GeomCoder {
  constructor (params) {
    /**
     * 当前参数信息
     * @type {{}}
     */
    this.options = (!params) ? {} : params
    /**
     * 版本信息
     * @type {string}
     */
    this.version = '1.0.0'
    /**
     * @private
     * @type {number}
     */
    this.factor_ = this.options.factor ? this.options.factor : 1e5

    /**
     * 空间数据模型
     * @type {{XY: string, XYM: string, XYZ: string, XYZM: string}}
     */
    this.GeometryLayout = {
      XY: 'XY',
      XYM: 'XYM',
      XYZ: 'XYZ',
      XYZM: 'XYZM'
    }

    /**
     * @private
     * @type {ol.geom.GeometryLayout}
     */
    this.geometryLayout_ = this.options.geometryLayout ? this.options.geometryLayout : this.GeometryLayout.XY
  }

  /**
   * 读取加密数据
   * @param text
   * @returns {Array}
   */
  readCoordinatesFromText (text) {
    let stride = this.getStrideForLayout(this.geometryLayout_)
    let flatCoordinates = this.decodeDeltas(text, stride)
    this.flipXY(flatCoordinates, 0, flatCoordinates.length, stride, flatCoordinates)
    let coordinates = this.coordinates(flatCoordinates, 0, flatCoordinates.length, stride)
    return coordinates
  }

  /**
   * 加密空间数组
   * @param coordinates
   * @param stride
   * @returns {*}
   */
  writeCoordinatesText (coordinates, stride) {
    /**
     * 实际是将坐标数组转成一纬数组
     * @type {*}
     */
    let flatCoordinates = []
    if (coordinates && Array.isArray(coordinates) && coordinates.length > 0) {
      coordinates.forEach(item => {
        if (item && Array.isArray(item) && item.length > 0) {
          item.forEach(_item => {
            if (_item) {
              flatCoordinates.push(_item)
            }
          })
        }
      })
    }
    if (!stride) {
      stride = 2
    }
    this.flipXY(flatCoordinates, 0, flatCoordinates.length, stride, flatCoordinates)
    return (this.encodeDeltas(flatCoordinates, stride, this.factor_))
  }

  /**
   * 判断传入数据类型是否是文本类型
   * @param source
   * @returns {*}
   * @private
   */
  getText_ (source) {
    if (typeof source === 'string') {
      return source
    } else {
      return ''
    }
  }

  /**
   * 所传标准数据长度
   * @param layout
   * @returns {*}
   */
  getStrideForLayout (layout) {
    let stride = null
    if (layout === this.GeometryLayout.XY) {
      stride = 2
    } else if (layout === this.GeometryLayout.XYZ || layout === this.GeometryLayout.XYM) {
      stride = 3
    } else if (layout === this.GeometryLayout.XYZM) {
      stride = 4
    }
    return (stride)
  }

  /**
   * 解码增量值（核心算法）
   * @param encoded
   * @param stride
   * @returns {Array.<number>}
   */
  decodeDeltas (encoded, stride) {
    /** @type {Array.<number>} */
    let lastNumbers = new Array(stride)
    for (let d = 0; d < stride; ++d) {
      lastNumbers[d] = 0
    }
    let numbers = this.decodeFloats(encoded, this.factor_)
    let [i, ii] = [null, null]
    for (i = 0, ii = numbers.length; i < ii;) {
      for (let d = 0; d < stride; ++d, ++i) {
        lastNumbers[d] += numbers[i]
        numbers[i] = lastNumbers[d]
      }
    }
    return numbers
  }

  /**
   * 编码增量值
   * @param numbers
   * @param stride
   * @returns {*}
   */
  encodeDeltas (numbers, stride) {
    let [d, lastNumbers, i, ii] = [null, (new Array(stride)), null, null]
    for (d = 0; d < stride; ++d) {
      lastNumbers[d] = 0
    }
    for (i = 0, ii = numbers.length; i < ii;) {
      for (d = 0; d < stride; ++d, ++i) {
        let num = numbers[i]
        let delta = num - lastNumbers[d]
        lastNumbers[d] = num
        numbers[i] = delta
      }
    }
    return this.encodeFloats(numbers)
  }

  /**
   * 解码浮点数
   * @param encoded
   * @returns {*}
   */
  decodeFloats (encoded) {
    let numbers = this.decodeSignedIntegers(encoded)
    let [i, ii] = [null, null]
    for (i = 0, ii = numbers.length; i < ii; ++i) {
      numbers[i] /= this.factor_
    }
    return numbers
  }

  /**
   * 编码浮点数
   * @param numbers
   * @returns {*}
   */
  encodeFloats (numbers) {
    let [i, ii] = [null, null]
    for (i = 0, ii = numbers.length; i < ii; ++i) {
      numbers[i] = Math.round(numbers[i] * this.factor_)
    }
    return this.encodeSignedIntegers(numbers)
  }

  /**
   * 解码有符号整数
   * @param encoded
   * @returns {*}
   */
  decodeSignedIntegers (encoded) {
    let numbers = this.decodeUnsignedIntegers(encoded)
    let [i, ii] = [null, null]
    for (i = 0, ii = numbers.length; i < ii; ++i) {
      let num = numbers[i]
      numbers[i] = (num & 1) ? ~(num >> 1) : (num >> 1)
    }
    return numbers
  }

  /**
   * 编码有符号整数
   * @param numbers
   * @returns {*}
   */
  encodeSignedIntegers (numbers) {
    let [i, ii] = [null, null]
    for (i = 0, ii = numbers.length; i < ii; ++i) {
      let num = numbers[i]
      numbers[i] = (num < 0) ? ~(num << 1) : (num << 1)
    }
    return this.encodeUnsignedIntegers(numbers)
  }

  /**
   * 解码无符号整数
   * @param encoded
   * @returns {null}
   */
  decodeUnsignedIntegers (encoded) {
    let [numbers, current, shift, i, ii] = [[], 0, 0, null, null]
    for (i = 0, ii = encoded.length; i < ii; ++i) {
      let b = encoded.charCodeAt(i) - 63
      current |= (b & 0x1f) << shift
      if (b < 0x20) {
        numbers.push(current)
        current = 0
        shift = 0
      } else {
        shift += 5
      }
    }
    return numbers
  }

  /**
   * 编码无符号整数数组
   * @param numbers
   * @returns {string}
   */
  encodeUnsignedIntegers (numbers) {
    let [encoded, i, ii] = ['', null, null]
    for (i = 0, ii = numbers.length; i < ii; ++i) {
      encoded += this.encodeUnsignedInteger(numbers[i])
    }
    return encoded
  }

  /**
   * 编码无符号整数
   * @param num
   * @returns {null}
   */
  encodeUnsignedInteger (num) {
    let [value, encoded] = ['', null]
    while (num >= 0x20) {
      value = (0x20 | (num & 0x1f)) + 63
      encoded += String.fromCharCode(value)
      num >>= 5
    }
    value = num + 63
    encoded += String.fromCharCode(value)
    return encoded
  }

  /**
   * 裁剪XY坐标
   * @param flatCoordinates
   * @param offset
   * @param end
   * @param stride
   * @param optDest
   * @param optDestOffset
   * @returns {string}
   */
  flipXY (flatCoordinates, offset, end, stride, optDest, optDestOffset) {
    let [dest, destOffset] = ['', '']
    if (optDest !== undefined) {
      dest = optDest
      destOffset = optDestOffset !== undefined ? optDestOffset : 0
    } else {
      dest = []
      destOffset = 0
    }
    let j = offset
    while (j < end) {
      let x = flatCoordinates[j++]
      dest[destOffset++] = flatCoordinates[j++]
      dest[destOffset++] = x
      for (let k = 2; k < stride; ++k) {
        dest[destOffset++] = flatCoordinates[j++]
      }
    }
    dest.length = destOffset
    return dest
  }

  /**
   * 读取字符串坐标
   * @param flatCoordinates
   * @param offset
   * @param end
   * @param stride
   * @param optCoordinates
   * @returns {Array}
   */
  coordinates (flatCoordinates, offset, end, stride, optCoordinates) {
    let coordinates = optCoordinates !== undefined ? optCoordinates : []
    let [i, j] = [0, null]
    for (j = offset; j < end; j += stride) {
      coordinates[i++] = flatCoordinates.slice(j, j + stride)
    }
    coordinates.length = i
    return coordinates
  }
}

export default GeomCoder
