/**
 * Tests if a point is left or right of line (a,b).
 * @param a
 * @param b
 * @param o
 * @returns {boolean}
 */
function clockwise (a, b, o) {
  return ((a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]) <= 0)
}

/**
 * Get coordinates of a geometry
 * @param geom
 * @returns {Array}
 */
function getCoordinates (geom) {
  let [h, p] = [[], null]
  switch (geom.getType()) {
    case 'Point':
      h.push(geom.getCoordinates())
      break
    case 'LineString':
    case 'LinearRing':
    case 'MultiPoint':
      h = geom.getCoordinates()
      break
    case 'MultiLineString':
      p = geom.getLineStrings()
      for (let i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]))
      break
    case 'Polygon':
      h = getCoordinates(geom.getLinearRing(0))
      break
    case 'MultiPolygon':
      p = geom.getPolygons()
      for (let i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]))
      break
    case 'GeometryCollection':
      p = geom.getGeometries()
      for (let i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]))
      break
    default:
      break
  }
  return h
}

/**
 * Compute a convex hull using Andrew's Monotone Chain Algorithm
 * @param points
 * @returns {*[]}
 */
ol.coordinate.convexHull = function (points) {
  points.sort(function (a, b) {
    return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]
  })
  let lower = []
  for (let i = 0; i < points.length; i++) {
    while (lower.length >= 2 && clockwise(lower[lower.length - 2], lower[lower.length - 1], points[i])) {
      lower.pop()
    }
    lower.push(points[i])
  }
  let upper = []
  for (let i = points.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && clockwise(upper[upper.length - 2], upper[upper.length - 1], points[i])) {
      upper.pop()
    }
    upper.push(points[i])
  }
  upper.pop()
  lower.pop()
  return lower.concat(upper)
}

/**
 * Compute a convex hull on a geometry using Andrew's Monotone Chain Algorithm
 * @returns {*[]}
 */
ol.geom.Geometry.prototype.convexHull = function () {
  return ol.coordinate.convexHull(getCoordinates(this))
}
