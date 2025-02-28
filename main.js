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
  onClick(new Click(e.offsetX, e.offsetY, e.button, keys.ControlLeft * 1));
});

document.addEventListener("mouseup", (e) => {
  onRelease(new Click(e.offsetX, e.offsetY, e.button, keys.ControlLeft * 1));
});

document.addEventListener("mousemove", (e) => {
  onMove(new Drag(e.offsetX, e.offsetY, e.movementX, e.movementY, e.button, keys.ControlLeft * 1));
});

document.addEventListener("keydown", (e) => {keys[e.code] = true});
document.addEventListener("keyup", (e) => {keys[e.code] = false});