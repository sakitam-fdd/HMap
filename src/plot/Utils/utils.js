/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */
export const MathDistance = (pnt1, pnt2) => {
  return (Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2)))
}

/**
 * 计算点集合的总距离
 * @param points
 * @returns {number}
 */
export const wholeDistance = (points) => {
  let distance = 0
  if (points && Array.isArray(points) && points.length > 0) {
    points.forEach((item, index) => {
      if (index < points.length - 1) {
        distance += (MathDistance(item, points[index + 1]))
      }
    })
  }
  return distance
}
/**
 * 获取基础长度
 * @param points
 * @returns {number}
 */
export const getBaseLength = (points) => {
  return Math.pow(wholeDistance(points), 0.99)
}

/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
export const Mid = (point1, point2) => {
  return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
}

/**
 * 通过三个点确定一个圆的中心点
 * @param point1
 * @param point2
 * @param point3
 */
export const getCircleCenterOfThreePoints = (point1, point2, point3) => {
  let pntA = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
  let pntB = [pntA[0] - point1[1] + point2[1], pntA[1] + point1[0] - point2[0]]
  let pntC = [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2]
  let pntD = [pntC[0] - point1[1] + point3[1], pntC[1] + point1[0] - point3[0]]
  return getIntersectPoint(pntA, pntB, pntC, pntD)
}

/**
 * 获取交集的点
 * @param pntA
 * @param pntB
 * @param pntC
 * @param pntD
 * @returns {[*,*]}
 */
export const getIntersectPoint = (pntA, pntB, pntC, pntD) => {
  if (pntA[1] === pntB[1]) {
    let f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1])
    let x = f * (pntA[1] - pntC[1]) + pntC[0]
    let y = pntA[1]
    return [x, y]
  }
  if (pntC[1] === pntD[1]) {
    let e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1])
    let x = e * (pntC[1] - pntA[1]) + pntA[0]
    let y = pntC[1]
    return [x, y]
  }
  let e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1])
  let f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1])
  let y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f)
  let x = e * y - e * pntA[1] + pntA[0]
  return [x, y]
}

/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
export const getAzimuth = (startPoint, endPoint) => {
  let azimuth
  let angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / (MathDistance(startPoint, endPoint)))
  if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = angle + Math.PI
  } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = Math.PI * 2 - angle
  } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = angle
  } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = Math.PI - angle
  }
  return azimuth
}

/**
 * 通过三个点获取方位角
 * @param pntA
 * @param pntB
 * @param pntC
 * @returns {number}
 */
export const getAngleOfThreePoints = (pntA, pntB, pntC) => {
  let angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC)
  return ((angle < 0) ? (angle + Math.PI * 2) : angle)
}

/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
export const isClockWise = (pnt1, pnt2, pnt3) => {
  return ((pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]))
}

/**
 * 获取线上的点
 * @param t
 * @param startPnt
 * @param endPnt
 * @returns {[*,*]}
 */
export const getPointOnLine = (t, startPnt, endPnt) => {
  let x = startPnt[0] + (t * (endPnt[0] - startPnt[0]))
  let y = startPnt[1] + (t * (endPnt[1] - startPnt[1]))
  return [x, y]
}

/**
 * 获取立方值
 * @param t
 * @param startPnt
 * @param cPnt1
 * @param cPnt2
 * @param endPnt
 * @returns {[*,*]}
 */
export const getCubicValue = (t, startPnt, cPnt1, cPnt2, endPnt) => {
  t = Math.max(Math.min(t, 1), 0)
  let [tp, t2, t3, tp2, tp3] = [(1 - t), (t * t), (t2 * t), (tp * tp), (tp2 * tp)]
  let x = (tp3 * startPnt[0]) + (3 * tp2 * t * cPnt1[0]) + (3 * tp * t2 * cPnt2[0]) + (t3 * endPnt[0])
  let y = (tp3 * startPnt[1]) + (3 * tp2 * t * cPnt1[1]) + (3 * tp * t2 * cPnt2[1]) + (t3 * endPnt[1])
  return [x, y]
}

/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */
export const getThirdPoint = (startPnt, endPnt, angle, distance, clockWise) => {
  let azimuth = getAzimuth(startPnt, endPnt)
  let alpha = clockWise ? (azimuth + angle) : (azimuth - angle)
  let dx = distance * Math.cos(alpha)
  let dy = distance * Math.sin(alpha)
  return ([endPnt[0] + dx, endPnt[1] + dy])
}
