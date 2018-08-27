const squaredDistance = function(coord1, coord2) {
  const dx = coord1[0] - coord2[0];
  const dy = coord1[1] - coord2[1];
  return dx * dx + dy * dy;
};

const closestOnSegment = function(coordinate, segment) {
  const x0 = coordinate[0];
  const y0 = coordinate[1];
  const start = segment[0];
  const end = segment[1];
  const x1 = start[0];
  const y1 = start[1];
  const x2 = end[0];
  const y2 = end[1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const along = (dx === 0 && dy === 0) ? 0 : ((dx * (x0 - x1)) + (dy * (y0 - y1))) / ((dx * dx + dy * dy) || 0);
  let x, y;
  if (along <= 0) {
    x = x1;
    y = y1;
  } else if (along >= 1) {
    x = x2;
    y = y2;
  } else {
    x = x1 + along * dx;
    y = y1 + along * dy;
  }
  return [x, y];
};

const distance = function(coord1, coord2) {
  return Math.sqrt(squaredDistance(coord1, coord2));
};

const squaredDistanceToSegment = function(coordinate, segment) {
  return squaredDistance(coordinate, closestOnSegment(coordinate, segment));
};

const closestOnCircle = function(coordinate, circle) {
  const r = circle.getRadius();
  const center = circle.getCenter();
  const x0 = center[0];
  const y0 = center[1];
  const x1 = coordinate[0];
  const y1 = coordinate[1];
  let dx = x1 - x0;
  const dy = y1 - y0;
  if (dx === 0 && dy === 0) {
    dx = 1;
  }
  const d = Math.sqrt(dx * dx + dy * dy);
  let x, y;
  x = x0 + r * dx / d;
  y = y0 + r * dy / d;
  return [x, y];
};

export {
  distance,
  squaredDistance,
  closestOnCircle,
  closestOnSegment,
  squaredDistanceToSegment
};
