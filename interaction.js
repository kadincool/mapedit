// let mode = 0;
let mainMode = 0;
let actionMode = 0;
let startClick = null;
const modeList = ["select", "move", "scale"];

let ui = [];
let elems = [];
let selected = [];
let selectionBox = new SelectionBox();
let boundingBox = new BoundingBox();
let cam = new Camera(0, 0, 32);

let clicked = false;

// elems.push(new Box(0, 0, 200, 10));
// elems.push(new Box(0, 10, 200, 10));
// elems.push(new Box(0, 20, 200, 10));
// elems.push(new Box(0, 30, 200, 10));
elems.push(new Box(0, 0, 20, 1));
elems.push(new Box(0, 1, 20, 1));
elems.push(new Box(0, 2, 20, 1));
elems.push(new Box(0, 3, 20, 1));

function drawFrame(can2d) {
  can2d.fillStyle = "lightGray";
  can2d.fillRect(0, 0, can2d.canvas.width, can2d.canvas.height);
  
  for (let elem of elems) {
    can2d.fillStyle = "black";
    if (selected.includes(elem)) can2d.fillStyle = "dimgray";
    drawArea(can2d, elem);
  }

  can2d.strokeStyle = "blue";
  can2d.lineWidth = 2;
  // if (boundingBox.active) can2d.strokeRect(boundingBox.x, boundingBox.y, boundingBox.wid, boundingBox.hei);
  if (boundingBox.active) strokeArea(can2d, boundingBox);
  if (selectionBox.active) strokeArea(can2d, selectionBox);
  // strokeArea(can2d, selectionBox);

  can2d.fillStyle = "white";
  // can2d.fillText(mode + ", " + mainMode + ", " + actionMode, 3, 10);
  can2d.fillText(mainMode + ", " + actionMode + ", " + JSON.stringify(startClick), 3, 10);
}

function drawArea(can2d, area) {
  let transformed = cam.worldToScreenA(area);
  can2d.fillRect(transformed.x, transformed.y, transformed.wid, transformed.hei);
}

function strokeArea(can2d, area) {
  let transformed = cam.worldToScreenA(area);
  can2d.strokeRect(transformed.x, transformed.y, transformed.wid, transformed.hei);
}

function onClick(click) {
  // if (startClick != null) return;
  startClick = click;
  click.transformByCam(cam);
  if (mainMode == 0) {
    if (true) { // not in bounding box
      selectionBox.init(click);
      // selectionBox.active = true;
      actionMode = 0;
    } else {
      actionMode = 1;
    }
  }
  // if (mode == 0) {
  //   // if no control and clicked in bounding box, drag
  //   if (!(click.modifiers & 0x1) && boundingBox.active && boundingBox.isIntersectP(click)) {
  //     mode = 1;
  //   } else {
  //     // empty if not multi select
  //     if (!(click.modifiers & 0x1)) selected = [];
  //     // select clicked
  //     for (let elem of elems) {
  //       if (elem.isIntersectP(click)) {
  //         if (!(click.modifiers & 0x1)) selected = [];
  //         if (selected.includes(elem)) {
  //           selected.splice(selected.indexOf(elem), 1);
  //         } else {
  //           selected.push(elem);
  //         }
  //         if (!(click.modifiers & 0x1)) break;
  //       }
  //     }
  //   }
  //   boundingBox.setBounds(selected);
  // } if (mode == 1) {
  //   if (selected.length == 0) {
  //     // select clicked
  //     for (let elem of elems) {
  //       if (elem.isIntersectP(click)) {
  //         if (selected.includes(elem)) {
  //           selected.splice(selected.indexOf(elem), 1);
  //         } else {
  //           selected.push(elem);
  //         }
  //         break;
  //       }
  //     }
  //   }
  // }
}

function onRelease(click) {
  startClick = null;
  click.transformByCam(cam);
  if (actionMode == 0) {
    // selected
    selectionBox.active = false;
  }
//   if (mode == 1) {
//     console.log("drag end");
//     for (let elem of selected) {
//       elem.x = Math.round(elem.x);
//       elem.y = Math.round(elem.y);
//     }
//     mode = 0;
//     boundingBox.setBounds(selected);
//   }
}

function onMove(drag) {
  drag.transformByCam(cam);
  if (startClick == null) {
    return;
  }
  if (actionMode == 0) {
    selectionBox.scaleTo(drag);
  }
//   if (mode == 1) {
//     for (let elem of selected) {
//       elem.x += drag.offX;
//       elem.y += drag.offY;
//     }
//     boundingBox.setBounds(selected);
//     // mode = 0;
//   }
}