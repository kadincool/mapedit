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

  isIntersectP(point) {
    // TODO
  }

  isIntersectA(area) {
    return this.x >= area.x && this.x <= area.x + area.wid && this.y >= area.y && this.y <= area.y + area.hei;
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
    return point.x >= this.x && point.x <= this.x + this.wid && point.y >= this.y && point.y <= this.y + this.hei;
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
  // boxes = [];

  constructor(x, y, wid, hei, active = false) {
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

class SelectionBox extends Area {
  active = false;

  constructor(x, y, wid, hei, active = false) {
    super(x, y, wid, hei);
    this.active = active;
  }

  init(click) {
    this.x = click.x;
    this.y = click.y;
    this.wid = 0;
    this.hei = 0;

    this.active = true;
  }

  scaleTo(click) {
    this.wid = click.x - this.x;
    this.hei = click.y - this.y;
  }

  getInBounds(scene) {
    let bounds = new Area(this.x + Math.min(0, this.wid), this.y + Math.min(0, this.hei), Math.abs(this.wid), Math.abs(this.hei));
    let out = [];
    for (let elem of scene) {
      if (bounds.isIntersectA(elem)) {
        out.push(elem);
      }
    }
    return out;
  }

  addInBoundsToSelectionList(scene, selectionList) {
    let bounds = new Area(this.x + Math.min(0, this.wid), this.y + Math.min(0, this.hei), Math.abs(this.wid), Math.abs(this.hei));
    for (let elem of scene) {
      if (bounds.isIntersectA(elem)) {
        selectionList.addElem(scene, elem);
      }
    }
  }
}

class LLNode {
  next = null;
  previous = null;
  value = null;
  parent = null;

  constructor(value) {
    this.value = value;
  }

  insertBefore(node) {
    this.parent = node.parent;
    this.previous = node.previous;
    this.next = node;
    node.previous = this;
    if (this.previous) {
      this.previous.next = this;
    }
  }

  insertAfter(node) {
    this.parent = node.parent;
    this.next = node.next;
    this.previous = node;
    node.next = this;
    if (this.next) {
      this.next.previous = this;
    }
  }

  // append to beginning of linkedList
  appendB(parent) {
    this.parent = parent;
    this.next = this.parent.first;
    this.parent.first = this;
    if (this.next) {
      this.next.last = this;
    } else {
      this.parent.last = this;
    }
  }

  // append to end of linkedList
  appendE(parent) {
    this.parent = parent;
    this.last = this.parent.last;
    this.parent.last = this;
    if (this.last) {
      this.last.next = this;
    } else {
      this.parent.first = this;
    }
  }

  splice() {
    if (this.next) this.next.previous = this.previous;
    if (this.previous) this.previous.next = this.next;
    this.previous = null;
    this.next = null;
  }
}

class LinkedList {
  first = null;
  last = null;
  length = 0;

  constructor(vals) {
    this.first = null;
    this.last = null;
    this.length = 0;

    if (vals != undefined) {
      for (let val of vals) {
        this.append(val);
      }
    }
  }

  prepend(elem) {
    new LLNode(elem).appendB(this);
  }

  append(elem) {
    new LLNode(elem).appendE(this);
  }

  listAll() {
    let node = this.first;
    while (node != null) {
      console.log(node.value);
      node = node.next;
    }
  }
  
  getAll(exp, giveNodes = false) {
    let out = new LinkedList();
    let node = this.first;
    while (node != null) {
      if (exp(node.value)) {
        if (giveNodes) {
          out.append(node);
        } else {
          out.append(node.value);
        }
      }
      node = node.next;
    }
    return out;
  }

  [Symbol.iterator]() {
    let current = this.first;
    return {
      next() {
        if (current == null) {
          return {done: true};
        }
        let out = current.value;
        current = current.next;
        return {value: out, done: false};
      }
    }
  }
}

class SelectionList {
  elems;
  indeces;

  constructor() {
    this.elems = [];
    this.indeces = [];
  }

  clear() {
    this.elems = [];
    this.indeces = [];
  }

  addElem(elems, index) {
    this.elems.push(elems[index]);
    this.indeces.push(index);
  }
}