function quickBitfield(...args) {
  let out = 0;
  for (let arg of args) {
    out += out * 2 + Boolean(arg);
  }
  return out;
}

function checkBitfield(bitfield, index) {
  return Boolean((bitfield >> index) % 2);
}

function pointDist(point1, point2, cam = null) {
  if (cam) {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y) * cam.scale;
  } else {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
  }
}

function roundToPrec(val, prec) {
  return Math.round(val / prec) * prec;
}

function exportMap() {
  let obj = {
    colors: [],
    boxes: ["splice"]
  };
  for (let color of colors) {
    obj.colors.push(color);
  }
  let boxes = "";
  for (let elem of elems) {
    boxes += `${elem.type},${elem.x},${elem.y},${elem.wid},${elem.hei}, `;
    // obj.boxes.push(elem.type, elem.x, elem.y, elem.wid, elem.hei);
  }
  boxes = boxes.slice(0, boxes.length - 2);
  let out = JSON.stringify(obj);
  out = out.replace(`"splice"`, boxes);
  return out;
}

function importMap(str) {
  let obj = JSON.parse(str);
  // console.log(obj);
  // colors = obj.colors;
  if (obj.colors) colors.splice(0, colors.length, ...obj.colors);
  if (obj.boxes) {
    elems.clearAll();
    for (let i = 0; i < obj.boxes.length - 4; i += 5) {
      elems.append(new Box(obj.boxes[i + 1], obj.boxes[i + 2], obj.boxes[i + 3], obj.boxes[i + 4], obj.boxes[i]));
    }
  }
}