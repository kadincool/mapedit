// let mode = 0;
let mainMode = 0;
let actionMode = 0;
let pan = false;
let startClick = null;
const modeList = ["select", "move", "scale", "make", "delete"];

let ui = new UIManager();
ui.addElem(new Toolbar(10, 10, 200, 20));
// let elems = [];
let elems = new LinkedList();
let selected = new LinkedList();
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

  let origin = cam.worldToScreenP(new Point(0, 0));
  can2d.strokeStyle = "gray";
  can2d.lineWidth = 2;
  
  can2d.beginPath();
  can2d.moveTo(origin.x, 0);
  can2d.lineTo(origin.x, can2d.canvas.height);
  can2d.moveTo(0, origin.y);
  can2d.lineTo(can2d.canvas.width, origin.y);
  can2d.stroke();
  
  for (let elem of elems) {
    let highlight = 0;
    if (selected.includes(elem)) highlight = 2;
    else if (hover.includes(elem)) highlight = 1;

    // can2d.fillStyle = "black";
    // if (hover.includes(elem)) can2d.fillStyle = "#3f3f3f";
    // if (selected.includes(elem)) can2d.fillStyle = "dimgray";
    // drawArea(can2d, elem);
    elem.draw(can2d, cam, highlight);
  }

  can2d.strokeStyle = "blue";
  can2d.lineWidth = 2;
  // if (boundingBox.active) can2d.strokeRect(boundingBox.x, boundingBox.y, boundingBox.wid, boundingBox.hei);
  if (boundingBox.active) strokeArea(can2d, boundingBox);
  if (selectionBox.active) strokeArea(can2d, selectionBox);
  // strokeArea(can2d, selectionBox);

  can2d.fillStyle = "white";
  can2d.font = "10px sans-serif";
  can2d.textAlign = "start";
  can2d.textBaseline = "alphabetic";
  // can2d.fillText(mode + ", " + mainMode + ", " + actionMode, 3, 10);
  can2d.fillText(mainMode + ", " + actionMode + ", " + JSON.stringify(startClick), 3, 10);

  ui.draw(can2d);
}

function drawArea(can2d, area) {
  let transformed = cam.worldToScreenA(area);
  can2d.fillRect(transformed.x, transformed.y, transformed.wid, transformed.hei);
}

function strokeArea(can2d, area) {
  let transformed = cam.worldToScreenA(area);
  can2d.strokeRect(transformed.x, transformed.y, transformed.wid, transformed.hei);
}

// splitters
function onClick(click) {
  if (!ui.checkForClick(click)) {
    onWSClick(click);
  }
}

function onMove(drag) {
  let topMost = !ui.checkForDrag(drag);
  onWSMove(drag, topMost);
}

function onWSClick(click) {
  if (click.button == 0) {
    if (startClick != null) return;
    //Primary click
    startClick = click;
    click.transformByCam(cam);
    if (mainMode == 0) {
      startSelection(click);
    } else if (mainMode == 1) {
      startMove(click);
    } else if (mainMode == 2) {
      startScale(click);
    } else if (mainMode == 3) {
      startAdd(click);
    }
  } else if (click.button == 2) {
    //Secondary click
    if (startClick != null) return;
    click.transformByCam(cam);
    startClick = click;
    if (mainMode == 1) {
      startScale(click);
    } else if (mainMode == 2) {
      startMove(click);
    } else {
      startAdd(click);
    }
  } else if (click.button == 1) {
    //Tertiary click
    pan = true;
  }
}

function onWSMove(drag, isTop = true) {
  drag.transformByCam(cam);
  hover.clearAll();
  if (pan) {
    cam.x -= drag.offX;
    cam.y -= drag.offY;
    drag.offX = 0;
    drag.offY = 0;
  }
  if (startClick == null) {
    // not clicked
    if (mainMode == 0 || mainMode == 4) {
      highlightHovered(drag);
    }
  } else {
    //clicked
    if (actionMode == 0) {
      dragSelection(drag);
    } else if (actionMode == 1) {
      dragMove(drag);
    } else if (actionMode == 2) {
      dragScale(drag);
    } else if (actionMode == 3) {
      dragAdd(drag);
    }
  }
}

function onRelease(click) {
  click.transformByCam(cam);
  if (startClick && click.button == startClick.button) { //ensure clicks line up
    // Primary click
    if (actionMode == 0) {
      releaseSelection(click);
    } else if (actionMode == 1) {
      releaseMove(click)
    } else if (actionMode == 2) {
      releaseScale(click);
    } else if (actionMode == 3) {
      releaseAdd(click);
    }
    startClick = null;
  } else if (click.button == 1) {
    //Tertiary click
    pan = false;
  }
}