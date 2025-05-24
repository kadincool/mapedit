let canvas = document.getElementById("gameCanvas");
let can2d = canvas.getContext("2d");

let keys = {};

function frame() {
  if (canvas.width != window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height != window.innerHeight) canvas.height = window.innerHeight;
  drawFrame(can2d);
  requestAnimationFrame(frame);
}
frame();

document.addEventListener("mousedown", (e) => {
  e.preventDefault();
  onClick(new Click(e.offsetX, e.offsetY, e.button, quickBitfield(keys.ControlLeft)));
  // frame();
});

document.addEventListener("mouseup", (e) => {
  onRelease(new Click(e.offsetX, e.offsetY, e.button, quickBitfield(keys.ControlLeft)));
  // frame();
});

document.addEventListener("wheel", (e) => {
  zoom(e.wheelDelta, new Click(e.offsetX, e.offsetY, e.button, quickBitfield(keys.ControlLeft)));
  // frame();
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  // frame();
})

document.addEventListener("mousemove", (e) => {
  onMove(new Drag(e.offsetX, e.offsetY, e.movementX, e.movementY, e.button, quickBitfield(keys.ControlLeft)));
  // frame();
});

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  keybind(e.code);
  // frame();
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
  // frame();
});
