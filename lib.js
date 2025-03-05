function quickBitfield(...args) {
  let out = 0;
  for (let arg of args) {
    out += out * 2 + Boolean(arg);
  }
  return out;
}

function pointDist(point1, point2, cam = null) {
  if (cam) {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y) / cam.scale;
  } else {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
  }
}
