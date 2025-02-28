class Camera {
  x;
  y;
  scale = 1;

  constructor(x = 0, y = 0, scale = 1) {
    this.x = x;
    this.y = y;
    this.scale = scale;
  }

  worldToScreenP(point) {
    return new Point((point.x - this.x) * this.scale, (point.y - this.y) * this.scale);
  }

  worldToScreenA(area) {
    return new Area((area.x - this.x) * this.scale, (area.y - this.y) * this.scale, area.wid * this.scale, area.hei * this.scale);
  }

  ScreenToWorldP(point) {
    return new Point(point.x / this.scale + this.x, point.y / this.scale + this.y);
  }

  ScreenToWorldA(area) {
    return new Area(area.x / this.scale + this.x, area.y / this.scale + this.y, this.wid / camera.scale, this.hei / camera.scale);
  }
}

class Point {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Area {
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

  isIntersectP(point) {
    return point.x > this.x && point.x < this.x + this.wid && point.y > this.y && point.y < this.y + this.hei;
  }

  isIntersectA(area) {
    // TODO
  }
}

class Click extends Point {
  button;
  modifiers;

  constructor(x, y, button, modifiers) {
    super(x, y);
    this.button = button;
    this.modifiers = modifiers;
  }

  transformByCam(cam) {
    let transformed = cam.ScreenToWorldP(this);
    this.x = transformed.x;
    this.y = transformed.y;
  }
}

class Drag extends Click {
  offX;
  offY;

  constructor(x, y, offX, offY, button, modifiers) {
    super(x, y, button, modifiers);
    this.offX = offX;
    this.offY = offY;
  }

  transformByCam(cam) {
    super.transformByCam(cam);
    this.offX = this.offX / cam.scale;
    this.offY = this.offY / cam.scale;
  }
}

class Box extends Area {
  type;

  constructor(x, y, wid, hei, type = 0) {
    super(x, y, wid, hei);
    this.type = type;
  }

}

class BoundingBox extends Area {
  active = false;
  boxes = [];

  constructor(x, y, wid, hei, active) {
    super(x, y, wid, hei);
    this.active = active;
  }

  setBounds(boxes) {
    this.boxes = boxes;
    if (boxes.length > 0) {
      this.active = true;

      this.x = boxes[0].x;
      this.y = boxes[0].y;
      this.wid = boxes[0].wid;
      this.hei = boxes[0].hei;

      for (let i = 1; i < boxes.length; i++) {
        if (boxes[i].x < this.x) {
          this.wid += this.x - boxes[i].x;
          this.x = boxes[i].x;
        }
        if (boxes[i].y < this.y) {
          this.hei += this.y - boxes[i].y;
          this.y = boxes[i].y;
        }
        if (boxes[i].x + boxes[i].wid > this.x + this.wid) this.wid += boxes[i].x + boxes[i].wid - (this.x + this.wid);
        if (boxes[i].y + boxes[i].hei > this.y + this.hei) this.hei += boxes[i].y + boxes[i].hei - (this.y + this.hei);
      }
    } else {
      this.active = false;
    }
  }
}