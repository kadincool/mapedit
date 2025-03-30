// let mode = 0;
let mainMode = 0;
let actionMode = 0;
let pan = false;
let startClick = null;
const modeList = ["select", "move", "scale", "make", "delete"];

let ui = new UIManager();
ui.addElem(new UIElem(10, 10, 200, 20));
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

// splitter
function onClick(click) {
  if (!ui.checkForClick(click)) {
    onWSClick(click);
  }
}

function onWSClick(click) {
  if (click.button == 0) {
    if (startClick != null) return;
    //Primary click
    startClick = click;
    click.transformByCam(cam);
    if (mainMode == 0) {
      startSelection(click);
    }
    if (mainMode == 1) {
      startMove(click);
    }
  } else if (click.button == 2) {
    //Secondary click
    if (startClick != null) return;
    actionMode = 3;
    click.transformByCam(cam);
    // make a box and make it selected
    let box = new Box(Math.round(click.x), Math.round(click.y), 0, 0);
    elems.append(box);
    selected.clearAll();
    selected.append(box);
    // perform move action
    selected.first.value.scaleTo(click);
    startClick = click;
  } else if (click.button == 1) {
    //Tertiary click
    pan = true;
  }
}

function onMove(drag) {
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
    } else if (actionMode == 3) {
      // console.log("hallo");
      selected.first.value.scaleTo(drag);
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
      for (let elem of selected) {
        elem.snap();
      }
      boundingBox.setBounds(selected);
    } else if (actionMode == 3) {
      selected.first.value.snap();
    }
    startClick = null;
  } else if (click.button == 1) {
    //Tertiary click
    pan = false;
  }
}
  ///////////////
 // functions //
///////////////

// select
function startSelection(click) {
  if (checkBitfield(click.modifiers, 0) || !(boundingBox.active && boundingBox.isIntersectP(click))) { // not in bounding box
    // selectionBox.init(click);
    actionMode = 0;
  } else {
    actionMode = 1;
  }
}

function dragSelection(drag) {
  if (!selectionBox.active) {
    if (pointDist(startClick, drag, cam) >= 10) {
      selectionBox.init(startClick);
    }
  }
  selectionBox.scaleTo(drag);
  highlightHovered(drag);
}

function releaseSelection(click) {
  if (!checkBitfield(click.modifiers, 0)) selected.clearAll();
  // TODO remove if all values are in selected
  if (selectionBox.active) {
    // select whole box
    let selectionArea = selectionBox.getArea();
    selected.appendM(elems.getAll((e) => {return selectionArea.isIntersectA(e)}));
    selectionBox.active = false;
  } else {
    let topMost = elems.reverseIterate((elem) => {
      if (click.isIntersectA(elem)) return elem;
    });
    if (topMost) selected.append(topMost);
  }
  boundingBox.setBounds(selected);
}

// move
function startMove(click) {
  if (!boundingBox.active || !boundingBox.isIntersectP(click)) {
    // get topmost
    startSelection(click);
    releaseSelection(click);
  }
  actionMode = 1;
}

function dragMove(drag) {
  for (let elem of selected) {
    elem.offX += drag.offX;
    elem.offY += drag.offY;
    elem.snap(false);
  }
  // boundingBox.x += drag.offX;
  // boundingBox.y += drag.offY;
  boundingBox.setBounds(selected);
}

function releaseMove(click) {
  // TODO
}

function startScale(click) {
  // TODO
}

function dragScale(drag) {
  // TODO
}

function releaseScale(click) {
  // TODO
}

function startAdd(click) {
  // TODO
}

function dragAdd(drag) {
  // TODO
}

function releaseAdd(click) {
  // TODO
}

function startDelete(click) {
  // TODO
}

function dragDelete(drag) {
  // TODO
}

function releaseDelete(click) {
  // TODO
}

function deleteSelected() {
  // TODO
}

function setSelectedType(type) {
  // TODO
}

function highlightHovered(drag) {
  if (selectionBox.active) {
    let selectionArea = selectionBox.getArea();
    for (let elem of elems) {
      if (selectionArea.isIntersectA(elem)) {
        hover.append(elem);
      }
    }
  } else {
    let topMost = elems.reverseIterate((elem) => {
      if (drag.isIntersectA(elem)) return elem;
    });
    // console.log(topMost);
    if (topMost) hover.append(topMost);
  }
}

function zoom(amount, click) {
  //TODO: make scroll into cursor position
  if (amount > 0) while (amount > 0) {
    cam.scale = Math.min(cam.scale * 2, 128);
    amount -= 500;
  }
  else if (amount < 0) while (amount < 0) {
    cam.scale = Math.max(cam.scale / 2, 0.25);
    amount += 500;
  }
}