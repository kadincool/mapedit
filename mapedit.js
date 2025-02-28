const canvas = document.getElementById("gameCanvas");
const can2d = canvas.getContext("2d");

let elems = [];
let selected = [];
let ui = [];

let camera = {
  x: 0,
  y: 0,
  scale: 1
};

function camTran(x = 0, y = 0, wid = 0, hei = 0) {
  return [(x - camera.x) * camera.scale, (y - camera.y) * camera.scale, wid * camera.scale, hei * camera.scale];
}

function revCamTran(x = 0, y = 0, wid = 0, hei = 0) {
  return [x / camera.scale + camera.x, y / camera.scale + camera.y, wid / camera.scale, hei / camera.scale];
}

let mode = "select";

let mouse = {
  x: 0,
  y: 0,
  worldX: 0,
  worldY: 0,
  down: false,
  click: false,
};

let clickAction = {
  active: false,
  action: "", //move, pan, scale, select, ect
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
}

class Elem {
  x;
  y;
  wid;
  hei;

  constructor(x, y, wid, hei) {
    this.x = x;
    this.y = y;
    this.wid = wid;
    this.hei = hei;
  }

  clickWithin(click) {
    pointInBox(click, this);
  }
}
elems.push(new Elem(0, 0, 100, 10));
elems.push(new Elem(0, 20, 100, 10));
elems.push(new Elem(0, 40, 100, 10));
elems.push(new Elem(0, 60, 100, 10));

function frame() {
  let translatedMouse = revCamTran(mouse.x, mouse.y);
  mouse.worldX = translatedMouse[0];
  mouse.worldY = translatedMouse[1];

  if (mouse.click) {
    handleMouseClick();
    mouse.click = false;
  }

  if (clickAction.active) {
    handleAction();
  }

  if (canvas.width = window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height = window.innerHeight) canvas.height = window.innerHeight;

  can2d.fillStyle = "lightgray";
  can2d.globalAlpha = 1;

  can2d.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let elem of elems) {
    can2d.fillStyle = (pointInBox(mouse, elem) ? "#3f3f3f" : "black");
    
    // can2d.fillStyle = elem.color;
    can2d.fillRect(...camTran(elem.x, elem.y, elem.wid, elem.hei));
  }

  can2d.fillStyle = "gray";
  // can2d.strokeStyle = "blue";
  // can2d.lineWidth = 2;
  // can2d.globalAlpha = 0.5;
  for (let elem of selected) {
    can2d.fillRect(...camTran(elem.x, elem.y, elem.wid, elem.hei));
    // can2d.strokeRect(...camTran(elem.x, elem.y, elem.wid, elem.hei));
  }
  
  // console.log(mouse, mouse.last);
  requestAnimationFrame(frame);
}
frame();

function handleMouseClick() {
  // console.log("click");
  if (mode = "select") {
    selected = [];
    for (let elem of elems) {
      if (pointInBox({x: mouse.worldX, y: mouse.worldY}, elem)) {
        selected.push(elem);
        return;
      }
    }
    // if an element wasnt selected
    clickAction.action = "select";
    clickAction.active = true;
    clickAction.startX = mouse.worldX;
    clickAction.startY = mouse.worldY;
  }
}

function handleAction() {

}

function pointInBox(point, box) {
  return box.x < point.x && box.x + box.wid > point.x && box.y < point.y && box.y + box.hei > point.y;
}

function boxIntersect(box1, box2) {
  return box1.x + box1.wid > box2.x && box1.x < box2.x + box2.wid && box1.y + box1.hei > box2.y && box1.y < box2.y + box2.hei;
}

document.addEventListener("keydown", (e) => {
  // console.log(e);
  
});

canvas.addEventListener("mousedown", (e) => {
  // console.log(e);
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
  mouse.down = true;
  mouse.click = true;
});

document.addEventListener("contextmenu", (e) => {e.preventDefault()});

canvas.addEventListener("mouseup", (e) => {
  // console.log(e);
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
  mouse.down = false;
});

canvas.addEventListener("mousemove", (e) => {
  // console.log(e);
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});