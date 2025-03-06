// let mode = 0;
let mainMode = 0;
let actionMode = 0;
let startClick = null;
const modeList = ["select", "move", "scale"];

let ui = [];
// let elems = [];
let elems = new LinkedList();
let selected = [];
let hover = new LinkedList();
let selectionBox = new SelectionBox();
let boundingBox = new BoundingBox();
let cam = new Camera(0, 0, 32);

let clicked = false;

// elems.push(new Box(0, 0, 20, 1));
// elems.push(new Box(0, 1, 20, 1));
// elems.push(new Box(0, 2, 20, 1));
// elems.push(new Box(0, 3, 20, 1));
elems.append(new Box(0, 0, 20, 1));
elems.append(new Box(0, 2, 20, 1));
elems.append(new Box(0, 4, 20, 1));
elems.append(new Box(0, 6, 20, 1));


function drawFrame(can2d) {
  can2d.fillStyle = "lightGray";
  can2d.fillRect(0, 0, can2d.canvas.width, can2d.canvas.height);
  
  for (let elem of elems) {
    can2d.fillStyle = "black";
    // if (selected.includes(elem)) can2d.fillStyle = "dimgray";
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
      // selectionBox.init(click);
      actionMode = 0;
    } else {
      actionMode = 1;
    }
  }
}

function onMove(drag) {
  drag.transformByCam(cam);
  hover.clearAll();
  if (selectionBox.active) {
    
  } else {
    // let topMost = elems.reverseIter()
  }
  // only run on click
  if (startClick == null) {
    return;
  }
  if (actionMode == 0) {
    selectionBox.scaleTo(drag);
  }
}

function onRelease(click) {
  startClick = null;
  click.transformByCam(cam);
  if (actionMode == 0) {
    if (selectionBox.active) {
      // select whole box
      let selectionArea = selectionBox.getArea();
      console.log("Selection:");
      elems.getAll((e) => {return selectionArea.isIntersectA(e)}).listAll();
      selectionBox.active = false;
    } else {
      console.log("Selection:");
      elems.getAll((e) => {return click.isIntersectA(e)}).listAll();
    }
  }
}