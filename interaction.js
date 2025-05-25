// let mode = 0;
let mainMode = 0;
let actionMode = -1;
let pan = false;
let startClick = null;
const modeList = ["select", "move", "scale", "make", "remove"];

let colors = ["#000000", "#ff0000", "#0000ff"];
let currentColor = 0;

let ui = new UIManager();
let modeBar = new Toolbar(10, 10, 200, 20);
ui.addElem(modeBar);
ui.addElem(new EditOptions(10, 40, 200, 20, modeBar));
let colorBar = new ColorBar(10, 40, 200, 20);
ui.addElem(colorBar);
ui.addElem(new Options(10, 40, 200, 20, colorBar));
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
/*elems.append(new Box(0, 0, 20, 1));
elems.append(new Box(0, 2, 20, 1));
elems.append(new Box(0, 4, 20, 1));
elems.append(new Box(0, 6, 20, 1));*/

function drawFrame(can2d) {
  checkColorIntegrety();

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
  
  if (boundingBox.active) {
    strokeArea(can2d, boundingBox);
    let boundPos = cam.worldToScreenP(boundingBox);
    can2d.fillStyle = "white";
    can2d.strokeStyle = "black";
    can2d.lineWidth = 3;
    can2d.font = "16px sans-serif";
    can2d.textAlign = "start";
    can2d.textBaseline = "top";
    let text = `(${Math.round(boundingBox.x)}, ${Math.round(boundingBox.y)}), ${Math.round(boundingBox.wid)} x ${Math.round(boundingBox.hei)}`;
    if (selected.length == 1) {
      text += `, ${colors[selected.first.value.type]}`;
    } else {
      text += `, ${selected.length}`;
    }
    can2d.strokeText(text, boundPos.x + 3, boundPos.y + 3);
    can2d.fillText(text, boundPos.x + 3, boundPos.y + 3);
  }
  can2d.strokeStyle = "blue";
  can2d.lineWidth = 2;
  if (selectionBox.active) strokeArea(can2d, selectionBox);
  // strokeArea(can2d, selectionBox);

  // can2d.fillStyle = "white";
  // can2d.font = "10px sans-serif";
  // can2d.textAlign = "start";
  // can2d.textBaseline = "alphabetic";
  // can2d.fillText(mode + ", " + mainMode + ", " + actionMode, 3, 10);
  // can2d.fillText(mainMode + ", " + actionMode + ", " + JSON.stringify(startClick), 3, 10);
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
  if (!perFrame) frame();
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
    } else if (mainMode == 4) {
      startDelete(click);
    }
  } else if (click.button == 2) {
    //Secondary click
    if (startClick != null) return;
    click.transformByCam(cam);
    startClick = click;
    if (mainMode == 0) {
      startAdd(click);
    } else if (mainMode == 1) {
      startScale(click);
    } else if (mainMode == 2) {
      startMove(click);
    } else if (mainMode == 3) {
      startSelection(click);
    } else if (mainMode == 4) {
      startMove(click);
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
    cam.x = roundToPrec(cam.x, 1/cam.scale); //snap to remove gaps
    cam.y = roundToPrec(cam.y, 1/cam.scale);
    drag.offX = 0;
    drag.offY = 0;
  }
  if (startClick == null) {
    // not clicked
    if ((mainMode == 0 || mainMode == 4) && isTop) {
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
    } else if (actionMode == 4) {
      dragDelete(drag);
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
    } else if (actionMode == 4) {
      releaseDelete(click);
    }
    startClick = null;
    actionMode = -1; // prevent bugs
  } else if (click.button == 1) {
    //Tertiary click
    pan = false;
  }
  frame();
}

function keybind(key) {
  switch (key) {
    case "Delete":
      deleteSelected();
      break;
    case "Home":
      cam.x = 0;
      cam.y = 0;
      cam.scale = 32;
      break;
    case "PageDown":
      selectedToBottom();
      break;
    case "PageUp":
      selectedToTop();
      break;
    case "KeyD":
      duplicateSelected();
      break;
    case "KeyQ":
      mainMode = 0;
      break;
    case "KeyW":
      mainMode = 1;
      break;
    case "KeyE":
      mainMode = 2;
      break;
    case "KeyR":
      mainMode = 3;
      break;
    case "KeyT":
      mainMode = 4;
      break;
    case "Equal":
      addColor();
      break
    case "Minus":
      deleteColor();
      break;
    case "Backquote":
      changeColor();
      break;
    case "Digit1":
    case "Numpad1":
      currentColor = 0;
      break;
    case "Digit2":
    case "Numpad2":
      currentColor = 1;
      break;
    case "Digit3":
    case "Numpad3":
      currentColor = 2;
      break;
    case "Digit4":
    case "Numpad4":
      currentColor = 3;
      break;
    case "Digit5":
    case "Numpad5":
      currentColor = 4;
      break;
    case "Digit6":
    case "Numpad6":
      currentColor = 5;
      break;
    case "Digit7":
    case "Numpad7":
      currentColor = 6;
      break;
    case "Digit8":
    case "Numpad8":
      currentColor = 7;
      break;
    case "Digit9":
    case "Numpad9":
      currentColor = 8;
      break;
    case "Digit0":
    case "Numpad0":
      currentColor = colors.length;
      break;
  }
  frame();
}